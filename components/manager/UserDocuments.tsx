"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Calendar,
  MapPin,
  Flag,
  FileText,
  Download,
  Check,
  X,
  AlertCircle,
  Eye,
  Shield,
  Clock,
  Briefcase,
} from "lucide-react";

type UserProfile = {
  first_name: string;
  last_name: string;
  gender: string;
  dob: string;
  place_of_birth: string;
  country_birth: string;
  nationality: string;
  passport_path: string | null;
  idcard_path: string | null;
  residence_address: string;
  email: string;
  mobile_number: string;
  last_diploma: string;
  dadName: string;
  momName: string;
  religion: string;
  marital_status: string;
  arrival_date_dubai: string;
  activity: string;
  trade_name1: string;
  trade_name2: string;
  trade_name3: string;
  active: boolean;
  comment: string | null;
  updated_at: string;
};

function extractRelativePath(fullPath: string): string {
  if (!fullPath) return "";
  try {
    const url = new URL(fullPath);
    const documentsIndex = url.pathname.indexOf("/documents/");
    if (documentsIndex === -1) return fullPath;
    return url.pathname.substring(documentsIndex + "/documents/".length);
  } catch {
    if (fullPath.startsWith("documents/")) {
      return fullPath.substring("documents/".length);
    }
    return fullPath;
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export default function ViewUserProfile() {
  const params = useParams();
  const userId = params?.id;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passportUrl, setPassportUrl] = useState<string | null>(null);
  const [idcardUrl, setIdcardUrl] = useState<string | null>(null);
  const [refuseMode, setRefuseMode] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!userId) return;

    async function fetchProfile() {
      setLoading(true);
      setError(null);

      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      if (authError || !authData.user) {
        setError("Vous devez être connecté pour voir les profils.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("users_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (!data) {
        setError(
          "Profil utilisateur introuvable. Il semblerait que le client n'a pas encore remplit son formulaire."
        );
        setLoading(false);
        return;
      }

      if (error) {
        setError("Profil utilisateur introuvable ou accès non autorisé.");
        setLoading(false);
        return;
      }

      setProfile(data);

      if (data.passport_path) {
        const relativePath = extractRelativePath(data.passport_path);
        const { data: passportSignedUrlData, error: passportError } =
          await supabase.storage
            .from("documents")
            .createSignedUrl(relativePath, 600);
        if (!passportError) setPassportUrl(passportSignedUrlData.signedUrl);
      }

      if (data.idcard_path) {
        const relativePath = extractRelativePath(data.idcard_path);
        const { data: idcardSignedUrlData, error: idcardError } =
          await supabase.storage
            .from("documents")
            .createSignedUrl(relativePath, 600);
        if (!idcardError) setIdcardUrl(idcardSignedUrlData.signedUrl);
      }

      setLoading(false);
    }

    fetchProfile();
  }, [userId]);

  const handleValidate = async () => {
    setUpdating(true);

    const { error } = await supabase
      .from("users_profiles")
      .update({ active: false, comment: null })
      .eq("user_id", userId);

    if (!error && profile) {
      setProfile({ ...profile, active: false, comment: null });

      const email = profile.email;

      await fetch("/api/users/validation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
        }),
      });
    }

    setUpdating(false);
  };

  const handleReject = async () => {
    setUpdating(true);
    const { error } = await supabase
      .from("users_profiles")
      .update({ active: true, comment: commentText })
      .eq("user_id", userId);

    if (!error && profile) {
      setProfile({ ...profile, active: true, comment: commentText });

      const email = profile.email;

      await fetch("/api/users/refuse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
        }),
      });
    }

    setRefuseMode(false);
    setCommentText("");
    setUpdating(false);
  };

  function formatDateSubmit(dateString: string | null) {
    if (!dateString) return "Date inconnue";

    const date = new Date(dateString);

    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-48" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Aucune donnée de profil disponible.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isValidated = !profile.active && !profile.comment;
  const isRejected = profile.active && profile.comment;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl">
                  {profile.first_name} {profile.last_name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Profil utilisateur
                </p>
                <p className="text-sm text-muted-foreground">
                  Dernière soumission: {formatDateSubmit(profile.updated_at)}
                </p>
              </div>
            </div>
            <Badge
              variant={
                isValidated
                  ? "default"
                  : isRejected
                    ? "destructive"
                    : "secondary"
              }
              className="w-fit"
            >
              {isValidated ? (
                <>
                  <Check className="w-3 h-3 mr-1" />
                  Validé
                </>
              ) : isRejected ? (
                <>
                  <X className="w-3 h-3 mr-1" />
                  Refusé
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3 mr-1" />
                  En attente
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Informations professionnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Activité principale
              </p>
              <p className="text-sm">{profile.activity}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Nom commercial 1
              </p>
              <p className="text-sm">{profile.trade_name1}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Nom commercial 2
              </p>
              <p className="text-sm">{profile.trade_name2}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Nom commercial 3
              </p>
              <p className="text-sm">{profile.trade_name3}</p>
            </div>
          </CardContent>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Prénom
                </p>
                <p className="text-sm">{profile.first_name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Nom</p>
                <p className="text-sm">{profile.last_name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Genre
                </p>
                <p className="text-sm">{profile.gender}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Date de naissance
                </p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm">{profile.dob}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Lieu de naissance
                </p>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm">{profile.place_of_birth}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Pays de naissance
                </p>
                <div className="flex items-center gap-2">
                  <Flag className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm">{profile.country_birth}</p>
                </div>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Nationalité
                </p>
                <div className="flex items-center gap-2">
                  <Flag className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm">{profile.nationality}</p>
                </div>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Adresse de résidence
                </p>
                <p className="text-sm">{profile.residence_address}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Email
                </p>
                <p className="text-sm">{profile.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Téléphone
                </p>
                <p className="text-sm">{profile.mobile_number}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Dernier diplôme
                </p>
                <p className="text-sm">{profile.last_diploma}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Nom du père
                </p>
                <p className="text-sm">{profile.dadName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Nom de la mère
                </p>
                <p className="text-sm">{profile.momName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Religion
                </p>
                <p className="text-sm">{profile.religion}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Statut marital
                </p>
                <p className="text-sm">{profile.marital_status}</p>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Date d&apos;arrivée prévue à Dubaï
                </p>
                <p className="text-sm">{profile.arrival_date_dubai}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Passeport</p>
                    <p className="text-xs text-muted-foreground">
                      {passportUrl ? "Document disponible" : "Aucun document"}
                    </p>
                  </div>
                </div>
                {passportUrl ? (
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <a
                        href={passportUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Voir
                      </a>
                    </Button>
                  </div>
                ) : (
                  <Badge variant="secondary">Indisponible</Badge>
                )}
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Carte d&apos;identité</p>
                    <p className="text-xs text-muted-foreground">
                      {idcardUrl ? "Document disponible" : "Aucun document"}
                    </p>
                  </div>
                </div>
                {idcardUrl ? (
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <a
                        href={idcardUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Voir
                      </a>
                    </Button>
                  </div>
                ) : (
                  <Badge variant="secondary">Indisponible</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Validation Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Validation des documents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Status */}
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center">
              {isValidated ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : isRejected ? (
                <X className="w-4 h-4 text-red-600" />
              ) : (
                <Clock className="w-4 h-4 text-orange-600" />
              )}
            </div>
            <div>
              <p className="font-medium">
                {isValidated
                  ? "Documents validés"
                  : isRejected
                    ? "Documents refusés"
                    : "En attente de validation"}
              </p>
              <p className="text-sm text-muted-foreground">
                {isValidated
                  ? "Les documents ont été approuvés"
                  : isRejected
                    ? "Les documents nécessitent des corrections"
                    : "Les documents sont en cours de révision"}
              </p>
            </div>
          </div>

          {/* Rejection Comment */}
          {profile.comment && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Commentaire pour le client :</strong> {profile.comment}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          {!refuseMode && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleValidate}
                disabled={isValidated || updating}
                className="flex-1"
                variant={isValidated ? "outline" : "default"}
              >
                <Check className="w-4 h-4 mr-2" />
                {updating ? "Validation..." : "Valider les documents"}
              </Button>
              <Button
                onClick={() => setRefuseMode(true)}
                variant="destructive"
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Refuser les documents
              </Button>
            </div>
          )}

          {/* Rejection Form */}
          {refuseMode && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Motif du refus à afficher au client
                </label>
                <Textarea
                  placeholder="Expliquez pourquoi les documents sont refusés et ce que le client doit corriger..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleReject}
                  disabled={!commentText.trim() || updating}
                  variant="destructive"
                  className="flex-1"
                >
                  {updating ? "Sauvegarde..." : "Confirmer le refus"}
                </Button>
                <Button
                  onClick={() => {
                    setRefuseMode(false);
                    setCommentText("");
                  }}
                  variant="outline"
                  className="flex-1"
                  disabled={updating}
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
