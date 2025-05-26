"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  /*useEffect(() => {
    // Si on est sur login, on ne fait rien, on affiche direct
    if (pathname === "/login") {
      setLoading(false);
      return;
    }

    if (pathname === "/") {
      setLoading(false);
      return;
    }

    if (!session) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          router.push("/login");
          return;
        }
        setSession(session);
        setLoading(false);
      });
    } else {
      const userRole = session.user.user_metadata?.role;
      const isAdminRoute = pathname.startsWith("/admin");
      const isClientRoute = pathname.startsWith("/client");
      const isChargeDeCompte = pathname.startsWith("/manager");

      if (
        (isAdminRoute && userRole !== "admin") ||
        (isClientRoute && userRole !== "client") ||
        (isChargeDeCompte && userRole !== "charge_de_compte")
      ) {
        router.push("/unauthorized");
        return;
      }
      setLoading(false);
    }
  }, [pathname, router, session]);*/

  if (loading) return <div className="p-4">Chargement...</div>;

  return <>{children}</>;
}
