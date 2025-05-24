import EditProfile from "@/components/client/EditProfile";
import { DashboardLayout } from "@/components/manager/dashboard-layout";
import React from "react";

type Props = {};

export default function Profile({}: Props) {
  return (
    <DashboardLayout>
      <EditProfile />
    </DashboardLayout>
  );
}
