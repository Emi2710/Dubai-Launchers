"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      const userRole = session.user.user_metadata?.role;

      // Automatic route-based role enforcement
      const isAdminRoute = pathname.startsWith("/admin");
      const isClientRoute = pathname.startsWith("/client");
      const isChargeDeCompte = pathname.startsWith("/charge_de_compte");

      if (
        (isAdminRoute && userRole !== "admin") ||
        (isClientRoute && userRole !== "client") ||
        (isChargeDeCompte && userRole !== "charge_de_compte")
      ) {
        router.push("/unauthorized"); // or a generic /dashboard or /login
        return;
      }

      setLoading(false);
    };

    checkAuth();
  }, [pathname, router]);

  if (loading) return <div className="p-4">Chargement...</div>;

  return <>{children}</>;
}
