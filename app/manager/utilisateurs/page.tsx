"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import ClientProgress from "@/components/admin/ClientProgress";
import { DashboardLayout } from "@/components/manager/dashboard-layout";
import UsersTable from "@/components/admin/UsersTable";
import UsersInfo from "@/components/manager/UsersInfo";

export default function UtilisateursPage() {
  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase.from("profiles").select("*");

      if (error) {
        console.error("RLS Error:", error);
      } else {
        console.log("Data:", data);
      }
    };

    fetchProfiles();
  }, []);

  return (
    <DashboardLayout>
      <UsersInfo />
    </DashboardLayout>
  );
}
