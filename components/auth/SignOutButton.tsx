"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import React from "react";

export default function SignOutButton({
  className = "",
  children = "Se déconnecter",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const router = useRouter();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push("/login");
    } else {
      console.error("Erreur lors de la déconnexion :", error.message);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className={`bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded ${className}`}
    >
      {children}
    </button>
  );
}
