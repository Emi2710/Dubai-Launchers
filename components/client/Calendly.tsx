"use client";

import { supabase } from "@/lib/supabaseClient";
import { PhoneCall } from "lucide-react";
import React, { useEffect, useState } from "react";

type Props = {};

type Profile = {
  user_id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  calendly_link?: string;
};

export default function Calendly({}: Props) {
  const [manager, setManager] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchManager = async () => {
      setLoading(true);

      // Get logged-in user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Erreur utilisateur:", userError?.message);
        setLoading(false);
        return;
      }

      // Get client profile with assigned_to
      const { data: clientProfile, error: profileError } = await supabase
        .from("profiles")
        .select("assigned_to")
        .eq("user_id", user.id)
        .single();

      if (profileError || !clientProfile?.assigned_to) {
        console.error("Erreur récupération client:", profileError?.message);
        setLoading(false);
        return;
      }

      // Get assigned manager profile
      const { data: managerProfile, error: managerError } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, email, phone, calendly_link")
        .eq("user_id", clientProfile.assigned_to)
        .single();

      if (managerError) {
        console.error("Erreur récupération manager:", managerError.message);
        setLoading(false);
        return;
      }

      setManager(managerProfile);
      setLoading(false);
    };

    fetchManager();
  }, []);
  return (
    <div className="mt-16">
      <div className="flex items-center md:justify-center">
        <PhoneCall className="text-red-400" />
        <h2 className="ml-2 text-2xl md:text-3xl font-bold">
          Réserver un appel avec votre référent
        </h2>
      </div>
      <iframe
        className="w-[100%] md:w-[80%] mx-auto mt-4 h-screen md:h-[80vh] rounded-lg"
        src={manager?.calendly_link}
      />
    </div>
  );
}
