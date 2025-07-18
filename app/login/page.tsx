"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Step 1: Login
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (signInError || !signInData?.user) {
      setError(signInError?.message || "Erreur de connexion.");
      setLoading(false);
      return;
    }

    const user = signInData.user;

    // Step 2: Fetch profile to check "active"
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("active, role")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      setError("Erreur lors de la récupération du profil.");
      setLoading(false);
      return;
    }

    if (!profile.active) {
      await supabase.auth.signOut();
      setError(
        "Votre compte est désactivé. Veuillez contacter un administrateur."
      );
      setLoading(false);
      return;
    }

    // Step 3: Redirect based on role
    const role = profile.role;

    if (role === "admin") {
      router.push("/admin/utilisateurs");
    } else if (role === "client") {
      router.push("/client/dashboard");
    } else if (role === "charge_de_compte") {
      router.push("/manager/utilisateurs");
    } else {
      router.push("/");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#000319]">
      <Card className="w-full max-w-md shadow-lg bg-black/15">
        <CardHeader className="space-y-1">
          <img
            className="w-[140px] m-auto"
            src="/logo/2.png"
            alt="Logo Dubai Launchers"
          />
          <CardTitle className="text-2xl font-bold text-center">
            Connexion
          </CardTitle>
          <CardDescription className="text-center">
            Entrez vos identifiants pour accéder à votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nom@exemple.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <a
                  href="/login/forgot-password"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Mot de passe oublié?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Se souvenir de moi
              </Label>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
