// lib/getLoggedInUserProfile.ts

import { supabase } from "@/lib/supabaseClient";

export type UserProfile = {
  user_id: string;
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  calendly_link?: string;
};

export const getLoggedInUserProfile = async (): Promise<UserProfile | null> => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Erreur utilisateur:", userError?.message);
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("user_id, first_name, last_name, email, phone, calendly_link")
    .eq("user_id", user.id)
    .single();

  if (profileError) {
    console.error("Erreur récupération profil:", profileError.message);
    return null;
  }

  return profile;
};
