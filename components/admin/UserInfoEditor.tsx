"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Phone,
  UserCog,
  Calendar,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Shield,
  Users,
  User,
} from "lucide-react";
import Link from "next/link";

type UserType = {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role?: string;
  active?: boolean;
  assigned_to?: string | null;
  calendly_link?: string | null;
};

type Props = {
  userId: string;
};

export default function UserInfoEditor({ userId }: Props) {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [active, setActive] = useState(false);
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [calendlyLink, setCalendlyLink] = useState<string>("");

  // List of chargés de compte for assigning
  const [accountManagers, setAccountManagers] = useState<UserType[]>([]);

  // Fetch user data
  async function fetchUser() {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      setError("Erreur lors du chargement de l'utilisateur.");
      setLoading(false);
      return;
    }

    setUser(data);
    setFirstName(data.first_name || "");
    setLastName(data.last_name || "");
    setEmail(data.email || "");
    setPhone(data.phone || "");
    setRole(data.role || "");
    setActive(data.active ?? false);
    setAssignedTo(data.assigned_to || null);
    setCalendlyLink(data.calendly_link || "");
    setLoading(false);
  }

  // Fetch chargés de compte to assign
  async function fetchAccountManagers() {
    const { data, error } = await supabase
      .from("profiles")
      .select("user_id, first_name, last_name, email")
      .eq("role", "charge_de_compte");

    if (!error && data) {
      setAccountManagers(data);
    }
  }

  useEffect(() => {
    fetchUser();
    fetchAccountManagers();
  }, [userId]);

  // Save update
  async function save() {
    if (!user) return;

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    const updates = {
      first_name: firstName || null,
      last_name: lastName || null,
      email: email || null,
      phone: phone || null,
      role: role || null,
      active: !!active,
      assigned_to: role === "client" && assignedTo ? assignedTo : null,
      calendly_link:
        role === "charge_de_compte" && calendlyLink ? calendlyLink : null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", user.user_id);

    if (error) {
      console.error("Supabase update error:", error);
      setError("Erreur lors de la mise à jour.");
      console.log(user.user_id);
    } else {
      setSuccessMessage("Informations mises à jour avec succès !");
      await fetchUser();
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    }

    setSaving(false);
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4 text-red-500" />;
      case "charge_de_compte":
        return <UserCog className="h-4 w-4 text-blue-500" />;
      case "client":
        return <User className="h-4 w-4 text-green-500" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="border-red-400 text-red-300 bg-black hover:bg-black">
            Admin
          </Badge>
        );
      case "charge_de_compte":
        return (
          <Badge className="border-blue-400 text-blue-300 bg-black hover:bg-black">
            Chargé de compte
          </Badge>
        );
      case "client":
        return (
          <Badge className="border-green-400 text-green-300 bg-black hover:bg-black">
            Client
          </Badge>
        );
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!user) {
    return (
      <Alert className="max-w-2xl mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Utilisateur introuvable</AlertTitle>
        <AlertDescription>
          Aucun utilisateur trouvé avec cet identifiant.
        </AlertDescription>
      </Alert>
    );
  }

  // Trouver le chargé de compte assigné (objet complet)
  const assignedManager = assignedTo
    ? accountManagers.find((mgr) => mgr.user_id === assignedTo)
    : null;

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Modifier les informations utilisateur
            </CardTitle>
            <CardDescription className="mt-2">
              Modifiez les informations de profil de l&apos;utilisateur
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getRoleBadge(role)}
            <Badge variant={active ? "default" : "secondary"}>
              {active ? "Actif" : "Inactif"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {successMessage && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Succès</AlertTitle>
            <AlertDescription className="text-green-700">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="flex items-center gap-1">
              Prénom
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="pl-9"
                placeholder="Prénom"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" className="flex items-center gap-1">
              Nom
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="pl-9"
                placeholder="Nom"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-1">
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={email}
              className="pl-9"
              placeholder="email@exemple.com"
              disabled
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-1">
            Téléphone
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="pl-9"
              placeholder="+33 6 12 34 56 78"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="role" className="flex items-center gap-1">
              Rôle
            </Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="role" className="relative">
                <SelectValue placeholder="Choisir un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-green-500" />
                    Client
                  </div>
                </SelectItem>
                <SelectItem value="charge_de_compte">
                  <div className="flex items-center gap-2">
                    <UserCog className="h-4 w-4 text-blue-500" />
                    Chargé de compte
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-red-500" />
                    Admin
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="active" className="flex items-center gap-1">
              Statut du compte
            </Label>
            <div className="flex items-center space-x-2 h-10 px-3 border rounded-md">
              <Switch
                id="active"
                checked={active}
                onCheckedChange={setActive}
              />
              <Label htmlFor="active" className="cursor-pointer">
                {active ? "Actif" : "Inactif"}
              </Label>
            </div>
          </div>
        </div>

        {role === "client" && (
          <div className="space-y-4 animate-in fade-in-50 slide-in-from-top-5 duration-300">
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="assignedTo" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Chargé de compte assigné
              </Label>
              <Select
                value={assignedTo || "none"}
                onValueChange={(value) =>
                  setAssignedTo(value === "none" ? null : value)
                }
              >
                <SelectTrigger id="assignedTo" className="pl-9 relative">
                  <UserCog className="absolute left-3 top-2.5 h-4 w-4 text-blue-500" />
                  <SelectValue placeholder="Sélectionner un chargé de compte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun chargé assigné</SelectItem>
                  {accountManagers.map((mgr) => (
                    <SelectItem key={mgr.user_id} value={mgr.user_id}>
                      {mgr.first_name} {mgr.last_name} ({mgr.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {role === "charge_de_compte" && (
          <div className="space-y-4 animate-in fade-in-50 slide-in-from-top-5 duration-300">
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="calendlyLink" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Lien Calendly
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="calendlyLink"
                  type="url"
                  value={calendlyLink}
                  onChange={(e) => setCalendlyLink(e.target.value)}
                  placeholder="https://calendly.com/monlien"
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4">
          <Link href={`/admin/documents/${user.user_id}`}>
            <Button className="">Voir les documents soumis</Button>
          </Link>
          <Button onClick={save} disabled={saving} className="min-w-32">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Sauvegarder
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
