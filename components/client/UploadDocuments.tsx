"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";

type Gender = "Male" | "Female" | "Other";

type FormData = {
  firstName: string;
  lastName: string;
  gender: Gender;
  dob: string; // yyyy-mm-dd
  placeOfBirth: string;
  countryBirth: string;
  nationality: string;
  passportFile: File | null;
  idcardFile: File | null;
};

export default function UserProfileForm() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    gender: "Male",
    dob: "",
    placeOfBirth: "",
    countryBirth: "",
    nationality: "",
    passportFile: null,
    idcardFile: null,
  });

  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const BUCKET_NAME = "documents";

  // Load user profile on mount
  useEffect(() => {
    async function loadUserProfile() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setMessage("User not authenticated.");
        return;
      }

      const { data, error } = await supabase
        .from("users_profiles")
        .select(
          "first_name,last_name,gender,dob,place_of_birth,country_birth,nationality"
        )
        .eq("user_id", user.id)
        .single();

      if (error) {
        setMessage("Failed to load user profile.");
      } else if (data) {
        setFormData((prev) => ({
          ...prev,
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          gender: data.gender || "Male",
          dob: data.dob || "",
          placeOfBirth: data.place_of_birth || "",
          countryBirth: data.country_birth || "",
          nationality: data.nationality || "",
          passportFile: null,
          idcardFile: null,
        }));
      }
    }

    loadUserProfile();
  }, []);

  function handleInputChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, files } = e.target;
    if (!files || files.length === 0) return;

    setFormData((prev) => ({
      ...prev,
      [name]: files[0],
    }));
  }

  async function uploadFile(userId: string, file: File) {
    const fileName = uuidv4();
    const fileExt = file.name.split(".").pop();

    const filePath = `${userId}/${fileName}`;
    const metadata = {
      original_filename: file.name,
      file_extension: fileExt,
    };

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, { cacheControl: "3600", upsert: true, metadata });

    if (error) throw error;

    return filePath;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setUploading(true);
    setMessage(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setMessage("User not authenticated.");
        setUploading(false);
        return;
      }

      let passport_path = null;
      let idcard_path = null;

      if (formData.passportFile) {
        passport_path = await uploadFile(user.id, formData.passportFile);
      }

      if (formData.idcardFile) {
        idcard_path = await uploadFile(user.id, formData.idcardFile);
      }

      const { error: upsertError } = await supabase
        .from("users_profiles")
        .upsert(
          {
            user_id: user.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            gender: formData.gender,
            dob: formData.dob,
            place_of_birth: formData.placeOfBirth,
            country_birth: formData.countryBirth,
            nationality: formData.nationality,
            ...(passport_path && { passport_path }),
            ...(idcard_path && { idcard_path }),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      if (upsertError) {
        setMessage(`Failed to save profile: ${upsertError.message}`);
      } else {
        setMessage("Profile saved successfully!");
        setFormData((prev) => ({
          ...prev,
          passportFile: null,
          idcardFile: null,
        }));
      }
    } catch (error) {
      setMessage("Unexpected error occurred.");
    }

    setUploading(false);
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: "auto" }}>
      <h2>User Profile</h2>

      <label>
        First Name:
        <input
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
          required
        />
      </label>

      <label>
        Last Name:
        <input
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
          required
        />
      </label>

      <label>
        Gender:
        <select
          name="gender"
          value={formData.gender}
          onChange={handleInputChange}
          required
        >
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </label>

      <label>
        Date of Birth:
        <input
          name="dob"
          type="date"
          value={formData.dob}
          onChange={handleInputChange}
          required
        />
      </label>

      <label>
        Place of Birth:
        <input
          name="placeOfBirth"
          value={formData.placeOfBirth}
          onChange={handleInputChange}
          required
        />
      </label>

      <label>
        Country of Birth:
        <input
          name="countryBirth"
          value={formData.countryBirth}
          onChange={handleInputChange}
          required
        />
      </label>

      <label>
        Nationality:
        <input
          name="nationality"
          value={formData.nationality}
          onChange={handleInputChange}
          required
        />
      </label>

      <label>
        Passport (PDF, DOC, DOCX, TXT):
        <input
          type="file"
          name="passportFile"
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileChange}
        />
      </label>

      <label>
        ID Card (PDF, DOC, DOCX, TXT):
        <input
          type="file"
          name="idcardFile"
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileChange}
        />
      </label>

      <button type="submit" disabled={uploading}>
        {uploading ? "Saving..." : "Save Profile"}
      </button>

      {message && <p>{message}</p>}
    </form>
  );
}
