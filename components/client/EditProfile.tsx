"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Profile = {
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  calendly_link?: string;
  role?: string;
};

export default function EditProfile() {
  const [profile, setProfile] = useState<Profile>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    calendly_link: "",
    role: "",
  });
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(
    null
  );

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Erreur utilisateur", userError?.message);
        setMessage("Erreur de récupération de l'utilisateur.");
        setMessageType("error");
        return;
      }

      setEmail(user.email || "");

      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, last_name, email, phone, calendly_link, role")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Erreur récupération profil", error.message);
        setMessage("Erreur lors de la récupération du profil.");
        setMessageType("error");
      } else {
        setProfile(data);
      }

      setLoading(false);
    };

    loadProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Utilisateur non trouvé.");
      setMessageType("error");
      return;
    }

    // Si l'e-mail a été modifié
    const emailHasChanged = email !== user.email;

    // Met à jour l'e-mail dans l'auth
    if (emailHasChanged) {
      const { error: emailError } = await supabase.auth.updateUser({ email });

      if (emailError) {
        setMessage("Erreur lors de la mise à jour de l'e-mail.");
        setMessageType("error");
        return;
      } else {
        setMessage(
          "Un lien de confirmation a été envoyé à votre ancienne et nouvelle adresse e-mail. Veuillez vérifier vos deux boîtes mail pour confirmer le changement."
        );
        setMessageType("success");
      }
    }

    // Met à jour les autres infos dans le profil
    const { error: profileError } = await supabase
      .from("profiles")
      .update(profile)
      .eq("user_id", user.id);

    if (profileError) {
      setMessage("Erreur lors de la mise à jour du profil.");
      setMessageType("error");
    } else if (!emailHasChanged) {
      // Ne pas surcharger le message si l’e-mail a déjà été mis à jour ci-dessus
      setMessage("Profil mis à jour avec succès.");
      setMessageType("success");
    }
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Modifier mon profil</h1>

      {message && (
        <div
          className={`p-2 mb-4 rounded ${
            messageType === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="first_name">Prénom</Label>
          <Input
            name="first_name"
            value={profile.first_name || ""}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="last_name">Nom</Label>
          <Input
            name="last_name"
            value={profile.last_name || ""}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            name="phone"
            value={profile.phone || ""}
            onChange={handleChange}
          />
        </div>

        {profile.role === "charge_de_compte" && (
          <div>
            <Label htmlFor="calendly_link">Lien Calendly</Label>
            <Input
              name="calendly_link"
              value={profile.calendly_link || ""}
              onChange={handleChange}
            />
          </div>
        )}

        <Button type="submit" className="w-full">
          Sauvegarder
        </Button>
      </form>
    </div>
  );
}
