import { DashboardLayout } from "@/components/manager/dashboard-layout";
import UserDocuments from "@/components/manager/UserDocuments";
import React from "react";

type Props = {};

export default function DocumentsPage({}: Props) {
  return (
    <DashboardLayout>
      <UserDocuments />
    </DashboardLayout>
  );
}
