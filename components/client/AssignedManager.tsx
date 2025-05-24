"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { HandHeart, Mail, MessageCircle, UserX } from "lucide-react";

type Props = {};

type Profile = {
  user_id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
};

export default function AssignedManager({}: Props) {
  const [manager, setManager] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchManager = async () => {
      setLoading(true);

      // Get logged-in user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Erreur utilisateur:", userError?.message);
        setLoading(false);
        return;
      }

      // Get client profile with assigned_to
      const { data: clientProfile, error: profileError } = await supabase
        .from("profiles")
        .select("assigned_to")
        .eq("user_id", user.id)
        .single();

      if (profileError || !clientProfile?.assigned_to) {
        console.error("Erreur récupération client:", profileError?.message);
        setLoading(false);
        return;
      }

      // Get assigned manager profile
      const { data: managerProfile, error: managerError } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, email, phone")
        .eq("user_id", clientProfile.assigned_to)
        .single();

      if (managerError) {
        console.error("Erreur récupération manager:", managerError.message);
        setLoading(false);
        return;
      }

      setManager(managerProfile);
      setLoading(false);
    };

    fetchManager();
  }, []);

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0)?.toUpperCase() || "";
    const last = lastName?.charAt(0)?.toUpperCase() || "";
    return first + last || "CM";
  };

  const formatPhoneForWhatsApp = (phone?: string) => {
    if (!phone) return "";
    // Remove all non-numeric characters and add country code if needed
    const cleaned = phone.replace(/\D/g, "");
    return cleaned.startsWith("971") ? cleaned : `971${cleaned}`;
  };

  const handleEmailClick = () => {
    if (manager?.email) {
      window.location.href = `mailto:${manager.email}?subject=Question concernant ma création d'entreprise à Dubai`;
    }
  };

  const handleWhatsAppClick = () => {
    if (manager?.phone) {
      const formattedPhone = formatPhoneForWhatsApp(manager.phone);
      const message = encodeURIComponent(
        "Bonjour, j'ai une question concernant ma création d'entreprise à Dubai."
      );
      window.open(`https://wa.me/${formattedPhone}?text=${message}`, "_blank");
    }
  };

  if (loading) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HandHeart className="h-5 w-5" />
            Votre chargé de compte dédié
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
              <div className="flex gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-28" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!manager) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HandHeart className="h-5 w-5" />
            Votre chargé de compte dédié
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <UserX className="h-4 w-4" />
            <AlertDescription>
              Aucun chargé de compte n&apos;est actuellement assigné à votre
              dossier.
              <br />
              <span className="text-sm text-muted-foreground">
                Contactez notre support pour plus d&apos;informations.
              </span>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HandHeart className="h-5 w-5 text-blue-600" />
          Votre chargé de compte dédié
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-blue-100 text-blue-700 text-lg font-semibold">
              {getInitials(manager.first_name, manager.last_name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h3 className="text-xl font-semibold text-slate-300 mb-1">
              {manager.first_name} {manager.last_name}
            </h3>

            {manager.email && (
              <div className="flex items-center gap-2 text-slate-300 mb-3">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{manager.email}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {manager.email && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEmailClick}
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </Button>
              )}

              {manager.phone && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleWhatsAppClick}
                  className="flex items-center gap-2 text-green-700 border-green-200"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
