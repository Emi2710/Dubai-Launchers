import { DashboardLayout } from "@/components/client/dashboard-layout";
import UploadDocuments from "@/components/client/UploadDocuments";
import React from "react";

type Props = {};

export default function Documents({}: Props) {
  return (
    <DashboardLayout>
      <UploadDocuments />
    </DashboardLayout>
  );
}
