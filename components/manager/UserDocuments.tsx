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

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
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
        const { data: passportSignedUrlData, error } = await supabase.storage
          .from("documents")
          .createSignedUrl(data.passport_path, 60);
        if (!error) setPassportUrl(passportSignedUrlData.signedUrl);
      }
      if (data.idcard_path) {
        const { data: idcardSignedUrlData, error } = await supabase.storage
          .from("documents")
          .createSignedUrl(data.idcard_path, 60);
        if (!error) setIdcardUrl(idcardSignedUrlData.signedUrl);
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

      {passportUrl && (
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
      )}
      {idcardUrl && (
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
      )}
    </div>
  );
}
