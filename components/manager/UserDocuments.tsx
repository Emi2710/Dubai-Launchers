"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type UserProfile = {
  first_name: string;
  last_name: string;
  gender: string;
  dob: string;
  place_of_birth: string;
  country_birth: string;
  nationality: string;
  passport_path: string | null;
  idcard_path: string | null;
  active: boolean;
  comment: string | null;
};

function extractRelativePath(fullPath: string): string {
  if (!fullPath) return "";
  try {
    const url = new URL(fullPath);
    const documentsIndex = url.pathname.indexOf("/documents/");
    if (documentsIndex === -1) return fullPath;
    return url.pathname.substring(documentsIndex + "/documents/".length);
  } catch {
    if (fullPath.startsWith("documents/")) {
      return fullPath.substring("documents/".length);
    }
    return fullPath;
  }
}

export default function ViewUserProfile() {
  const params = useParams();
  const userId = params?.id;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passportUrl, setPassportUrl] = useState<string | null>(null);
  const [idcardUrl, setIdcardUrl] = useState<string | null>(null);
  const [refuseMode, setRefuseMode] = useState(false);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    if (!userId) return;

    async function fetchProfile() {
      setLoading(true);
      setError(null);

      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      if (authError || !authData.user) {
        setError("You must be logged in to view profiles.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("users_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error || !data) {
        setError("User profile not found or you do not have access.");
        setLoading(false);
        return;
      }

      setProfile(data);

      if (data.passport_path) {
        const relativePath = extractRelativePath(data.passport_path);
        const { data: passportSignedUrlData, error: passportError } =
          await supabase.storage
            .from("documents")
            .createSignedUrl(relativePath, 600);
        if (!passportError) setPassportUrl(passportSignedUrlData.signedUrl);
      }

      if (data.idcard_path) {
        const relativePath = extractRelativePath(data.idcard_path);
        const { data: idcardSignedUrlData, error: idcardError } =
          await supabase.storage
            .from("documents")
            .createSignedUrl(relativePath, 600);
        if (!idcardError) setIdcardUrl(idcardSignedUrlData.signedUrl);
      }

      setLoading(false);
    }

    fetchProfile();
  }, [userId]);

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!profile) return <p>No profile data.</p>;

  return (
    <div style={{ maxWidth: 600, margin: "auto" }}>
      <h2>
        {profile.first_name} {profile.last_name}&apos;s Profile
      </h2>
      <p>
        <strong>Gender:</strong> {profile.gender}
      </p>
      <p>
        <strong>Date of Birth:</strong> {profile.dob}
      </p>
      <p>
        <strong>Place of Birth:</strong> {profile.place_of_birth}
      </p>
      <p>
        <strong>Country of Birth:</strong> {profile.country_birth}
      </p>
      <p>
        <strong>Nationality:</strong> {profile.nationality}
      </p>

      {passportUrl ? (
        <p>
          <a
            href={passportUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
          >
            Download Passport Document
          </a>
        </p>
      ) : (
        <p>No Passport Document Available</p>
      )}

      {idcardUrl ? (
        <p>
          <a
            href={idcardUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
          >
            Download ID Card Document
          </a>
        </p>
      ) : (
        <p>No ID Card Document Available</p>
      )}

      <hr style={{ margin: "20px 0" }} />
      <h3>Validation des documents</h3>
      <p>
        <strong>Statut:</strong> {profile.active ? "❌ Refusé" : "✔️ Validé"}
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        <button
          onClick={async () => {
            const { error } = await supabase
              .from("users_profiles")
              .update({ active: false, comment: null })
              .eq("user_id", userId);

            if (!error)
              setProfile({ ...profile, active: false, comment: null });
          }}
          disabled={!profile.active}
        >
          ✅ Valider
        </button>

        <button onClick={() => setRefuseMode(true)} disabled={profile.active}>
          ❌ Refuser
        </button>
      </div>

      {/* Affichage du commentaire s'il y a refus */}
      {profile.active && profile.comment && (
        <p>
          <strong>Commentaire pour le client :</strong> {profile.comment}
        </p>
      )}

      {/* Formulaire de refus */}
      {refuseMode && (
        <div>
          <textarea
            placeholder="Motif du refus à afficher au client"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={4}
            style={{ width: "100%", marginBottom: 10 }}
          />
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={async () => {
                const { error } = await supabase
                  .from("users_profiles")
                  .update({ active: true, comment: commentText })
                  .eq("user_id", userId);

                if (!error)
                  setProfile({
                    ...profile,
                    active: true,
                    comment: commentText,
                  });

                setRefuseMode(false);
                setCommentText("");
              }}
            >
              Sauvegarder le refus
            </button>

            <button onClick={() => setRefuseMode(false)}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}
