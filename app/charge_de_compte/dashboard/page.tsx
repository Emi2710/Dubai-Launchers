import { DashboardLayout } from "@/components/admin/dashboard-layout";
import AuthGuard from "@/components/auth/AuthGard";
import React from "react";

type Props = {};

export default function Dashboard({}: Props) {
  return (
    <DashboardLayout>
      Bienvenue à ton dashboard chargé de compte
    </DashboardLayout>
  );
}
