// exemple dans app/client/dashboard/page.tsx
import UsersTable from "@/components/admin/UsersTable";
import AuthGuard from "@/components/auth/AuthGard";
import AssignedManager from "@/components/client/AssignedManager";
import { DashboardLayout } from "@/components/client/dashboard-layout";
import Header from "@/components/client/Header";
import Progression from "@/components/client/Progression";
import UpcomingActions from "@/components/client/UpcomingActions";

export default function ClientDashboardPage() {
  return (
    <DashboardLayout>
      <Header />
      <Progression />
      <UpcomingActions />
      <AssignedManager />
    </DashboardLayout>
  );
}
