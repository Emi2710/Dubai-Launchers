import { DashboardLayout } from "@/components/client/dashboard-layout";
import EditProfile from "@/components/client/EditProfile";
import React from "react";

type Props = {};

export default function page({}: Props) {
  return (
    <DashboardLayout>
      <EditProfile />
    </DashboardLayout>
  );
}
