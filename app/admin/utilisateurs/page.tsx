import ClientProgress from "@/components/admin/ClientProgress";
import { DashboardLayout } from "@/components/admin/dashboard-layout";

import UsersTable from "@/components/admin/UsersTable";

export default function UtilisateursPage() {
  return (
    <DashboardLayout>
      <UsersTable />
    </DashboardLayout>
  );
}
