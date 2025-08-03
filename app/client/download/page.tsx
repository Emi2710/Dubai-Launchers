import { DashboardLayout } from "@/components/client/dashboard-layout";
import DownloadDocuments from "@/components/client/DownloadDocuments";
import React from "react";

type Props = {};

export default function Download({}: Props) {
  return (
    <DashboardLayout>
      <DownloadDocuments />
    </DashboardLayout>
  );
}
