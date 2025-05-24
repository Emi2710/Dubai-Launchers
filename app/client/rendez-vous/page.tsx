import UserAppointments from "@/components/client/Appointments";
import Calendly from "@/components/client/Calendly";
import { DashboardLayout } from "@/components/client/dashboard-layout";
import React from "react";

type Props = {};

export default function RendezVous({}: Props) {
  return (
    <DashboardLayout>
      <UserAppointments />
      <Calendly />
    </DashboardLayout>
  );
}
