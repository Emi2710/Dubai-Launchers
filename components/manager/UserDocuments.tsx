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
};

// Improved helper to get relative path inside bucket
function extractRelativePath(fullPath: string): string {
  if (!fullPath) return "";

  try {
    const url = new URL(fullPath);
    const documentsIndex = url.pathname.indexOf("/documents/");
    if (documentsIndex === -1) return fullPath;
    return url.pathname.substring(documentsIndex + "/documents/".length);
  } catch {
    // If not a valid URL, check and remove 'documents/' prefix if present
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

  useEffect(() => {
    if (!userId) return;

    async function fetchProfile() {
      setLoading(true);
      setError(null);

      // Check user authentication
      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      if (authError || !authData.user) {
        setError("You must be logged in to view profiles.");
        setLoading(false);
        return;
      }

      // Fetch profile from DB
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

      // DEBUG: Log raw paths from DB
      console.log("Raw passport_path from DB:", data.passport_path);
      console.log("Raw idcard_path from DB:", data.idcard_path);

      // List files in documents bucket for debugging
      const { data: listData, error: listError } = await supabase.storage
        .from("documents")
        .list("", { limit: 100 });
      if (listError) {
        console.error("Error listing documents bucket files:", listError);
      } else {
        console.log("Documents bucket files:", listData);
      }

      // Create signed URLs if paths exist
      if (data.passport_path) {
        const relativePath = extractRelativePath(data.passport_path);
        console.log("Passport relative path:", relativePath);
        const { data: passportSignedUrlData, error: passportError } =
          await supabase.storage
            .from("documents")
            .createSignedUrl(relativePath, 600);

        if (passportError) {
          console.error("Error creating passport signed URL:", passportError);
        } else {
          setPassportUrl(passportSignedUrlData.signedUrl);
        }
      }

      if (data.idcard_path) {
        const relativePath = extractRelativePath(data.idcard_path);
        console.log("ID card relative path:", relativePath);
        const { data: idcardSignedUrlData, error: idcardError } =
          await supabase.storage
            .from("documents")
            .createSignedUrl(relativePath, 600);

        if (idcardError) {
          console.error("Error creating ID card signed URL:", idcardError);
        } else {
          setIdcardUrl(idcardSignedUrlData.signedUrl);
        }
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
    </div>
  );
}
