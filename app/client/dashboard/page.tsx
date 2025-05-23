// exemple dans app/client/dashboard/page.tsx
import AuthGuard from "@/components/auth/AuthGard";

export default function ClientDashboardPage() {
  return (
    <AuthGuard>
      <div className="p-4">Bienvenue sur ton dashboard client !</div>
    </AuthGuard>
  );
}
