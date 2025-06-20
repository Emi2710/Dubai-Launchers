"use client";

import ClientProgress from "@/components/admin/ClientProgress";
import { DashboardLayout } from "@/components/admin/dashboard-layout";
import UpcomingActions from "@/components/admin/UpcomingActions";
import UserInfoEditor from "@/components/admin/UserInfoEditor";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AppointmentList from "@/components/admin/AppointmentList";

export default function UpdateUser() {
  const params = useParams();
  const id = params.id as string;
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", id)
        .single();

      if (error) {
        console.error("Erreur lors de la récupération du rôle:", error.message);
      } else {
        setUserRole(data.role);
      }
      setLoading(false);
    };

    fetchUserRole();
  }, [id]);

  return (
    <DashboardLayout>
      <UserInfoEditor userId={id} />

      {!loading && userRole === "client" && <ClientProgress clientId={id} />}
      {!loading && userRole === "client" && <UpcomingActions clientId={id} />}
      {!loading && userRole === "client" && <AppointmentList clientId={id} />}
    </DashboardLayout>
  );
}
