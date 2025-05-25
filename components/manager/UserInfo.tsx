import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Mail, Phone } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

type UserProfile = {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  role: string | null;
  active: boolean | null;
};

type Props = {
  id: string;
};

export default function UserInfo({ id }: Props) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [docLoading, setDocLoading] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("user_id, first_name, last_name, email, phone, role, active")
          .eq("user_id", id)
          .single();

        if (error) throw error;
        setUser(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUser();
  }, [id]);

  const getInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.charAt(0)?.toUpperCase() || "";
    const last = lastName?.charAt(0)?.toUpperCase() || "";
    return first + last || "?";
  };

  const getFullName = (firstName: string | null, lastName: string | null) => {
    const parts = [firstName, lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "Nom non renseigné";
  };

  // Fetch signed URL for user's passport document
  const handleViewDocuments = async () => {
    if (!user) return;

    setDocLoading(true);
    setDocError(null);

    try {
      // Generate signed URL for passport.pdf (change path/file as needed)
      const { data: passportData, error: passportError } =
        await supabase.storage
          .from("documents")
          .createSignedUrl(`${user.user_id}/passport.pdf`, 60); // URL valid 60 seconds

      if (passportError) throw passportError;

      // Generate signed URL for id_card.pdf (optional, if you want to fetch both)
      const { data: idCardData, error: idCardError } = await supabase.storage
        .from("documents")
        .createSignedUrl(`${user.user_id}/id_card.pdf`, 60);

      if (idCardError) throw idCardError;

      // For demo, just open passport pdf in a new tab, you can do better UI for multiple docs
      window.open(passportData.signedUrl, "_blank");

      // If you want to open id card also, either open in new tab or show links
      // window.open(idCardData.signedUrl, "_blank");
    } catch (error: any) {
      setDocError(
        "Erreur lors de la récupération des documents: " + error.message
      );
    } finally {
      setDocLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <Skeleton className="h-12 w-12 rounded-full mb-4" />
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64 mb-1" />
        <Skeleton className="h-4 w-40" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        variant="destructive"
        className="bg-rose-50 text-rose-800 border-rose-200 p-4"
      >
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>
          Impossible de charger l&apos;utilisateur: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!user) {
    return <p className="p-6 text-slate-500">Utilisateur non trouvé.</p>;
  }

  return (
    <Card className="border border-slate-200 shadow-sm p-6 max-w-md mx-auto">
      <div className="flex items-center gap-4 mb-4">
        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-medium text-xl">
          {getInitials(user.first_name, user.last_name)}
        </div>
        <h2 className="text-xl font-semibold text-slate-700">
          {getFullName(user.first_name, user.last_name)}
        </h2>
      </div>

      {user.email && (
        <div className="flex items-center gap-2 mb-2 text-slate-700">
          <Mail className="h-5 w-5" />
          <span>{user.email}</span>
        </div>
      )}

      {user.phone && (
        <div className="flex items-center gap-2 text-slate-700">
          <Phone className="h-5 w-5" />
          <span>{user.phone}</span>
        </div>
      )}

      <Link href={`/manager/documents/${user.user_id}`}>
        <Button className="mt-3">Voir les documents soumis</Button>
      </Link>

      {docError && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{docError}</AlertDescription>
        </Alert>
      )}

      {!user.email && !user.phone && (
        <p className="italic text-slate-500 mt-4">
          Informations de contact manquantes
        </p>
      )}
    </Card>
  );
}
