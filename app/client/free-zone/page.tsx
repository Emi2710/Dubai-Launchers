import { DashboardLayout } from "@/components/client/dashboard-layout";
import React from "react";

type Props = {};

export default function Page({}: Props) {
  return (
    <DashboardLayout>
      <h1 className="text-center text-3xl my-5">
        Comment accéder à votre free-zone
      </h1>
    </DashboardLayout>
  );
}
