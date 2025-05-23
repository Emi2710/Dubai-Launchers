"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | null>(
    null
  );
  const [showPassword, setShowPassword] = useState(false);
  const [redirectProgress, setRedirectProgress] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const router = useRouter();

  // Calculate password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    // Length check
    if (password.length >= 8) strength += 25;
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 25;
    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 25;
    // Contains number or special char
    if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 25;

    setPasswordStrength(strength);
  }, [password]);

  const getStrengthColor = () => {
    if (passwordStrength <= 25) return "bg-red-500";
    if (passwordStrength <= 50) return "bg-orange-500";
    if (passwordStrength <= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (passwordStrength <= 25) return "Très faible";
    if (passwordStrength <= 50) return "Faible";
    if (passwordStrength <= 75) return "Moyen";
    return "Fort";
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (password.length < 8) {
      setMessage("Le mot de passe doit contenir au moins 8 caractères.");
      setMessageType("error");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");
    setMessageType(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        throw error;
      }

      setMessageType("success");
      setMessage(
        "Mot de passe modifié avec succès. Redirection vers la page de connexion..."
      );

      // Start progress bar for redirection
      let progress = 0;
      const interval = setInterval(() => {
        progress += 2;
        setRedirectProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          router.push("/login");
        }
      }, 40); // 2000ms / 50 steps = 40ms per step
    } catch (error: any) {
      setMessageType("error");
      setMessage(`Erreur : ${error.message || "Une erreur est survenue"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Nouveau mot de passe
          </CardTitle>
          <CardDescription className="text-center">
            Veuillez créer un nouveau mot de passe sécurisé pour votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nouveau mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Masquer" : "Afficher"} le mot de passe
                  </span>
                </Button>
              </div>

              {password && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Force du mot de passe:</span>
                    <span
                      className={
                        passwordStrength > 75
                          ? "text-green-500"
                          : "text-muted-foreground"
                      }
                    >
                      {getStrengthText()}
                    </span>
                  </div>
                  <Progress
                    value={passwordStrength}
                    className={`h-1 ${getStrengthColor()}`}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">
                Confirmer le mot de passe
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {messageType && (
              <Alert
                variant={messageType === "error" ? "destructive" : "default"}
                className="mt-4"
              >
                {messageType === "error" ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                <AlertTitle>
                  {messageType === "error" ? "Erreur" : "Succès"}
                </AlertTitle>
                <AlertDescription>{message}</AlertDescription>
                {messageType === "success" && (
                  <Progress value={redirectProgress} className="h-1 mt-2" />
                )}
              </Alert>
            )}

            <div className="text-xs text-muted-foreground">
              <p>Votre mot de passe doit contenir:</p>
              <ul className="list-disc pl-4 mt-1 space-y-1">
                <li className={password.length >= 8 ? "text-green-500" : ""}>
                  Au moins 8 caractères
                </li>
                <li className={/[A-Z]/.test(password) ? "text-green-500" : ""}>
                  Une lettre majuscule
                </li>
                <li className={/[a-z]/.test(password) ? "text-green-500" : ""}>
                  Une lettre minuscule
                </li>
                <li
                  className={
                    /[0-9!@#$%^&*(),.?":{}|<>]/.test(password)
                      ? "text-green-500"
                      : ""
                  }
                >
                  Un chiffre ou un caractère spécial
                </li>
              </ul>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Modification en cours...
                </>
              ) : (
                "Modifier le mot de passe"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
