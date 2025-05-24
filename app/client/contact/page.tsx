import AssignedManager from "@/components/client/AssignedManager";
import { DashboardLayout } from "@/components/client/dashboard-layout";
import React from "react";

type Props = {};

export default function Contact({}: Props) {
  return (
    <DashboardLayout>
      <AssignedManager />
    </DashboardLayout>
  );
}
