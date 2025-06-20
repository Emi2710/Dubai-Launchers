"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AddUserFormProps {
  onSuccess?: () => void;
}

export default function AddUserForm({ onSuccess }: AddUserFormProps) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "client",
    calendly_link: "",
    assigned_to: "",
  });

  const [chargés, setChargés] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // Récupérer les chargés de compte
  useEffect(() => {
    const fetchChargés = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name")
        .eq("role", "charge_de_compte");

      if (error) {
        console.error("Erreur Supabase :", error);
      } else {
        console.log("Chargés de compte récupérés :", data);
      }

      setChargés(data || []);
    };
    fetchChargés();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const res = await fetch("/api/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setIsError(true);
        setMessage(data.error || "Une erreur est survenue.");
      } else {
        setMessage(
          "Utilisateur créé avec succès ! Lien de création de mot de passe envoyé."
        );
        setForm({
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          role: "client",
          calendly_link: "",
          assigned_to: "",
        });
      }
    } catch (err: any) {
      setIsError(true);
      setMessage("Erreur inattendue : " + err.message);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div className="space-y-2">
        <Label htmlFor="first_name">
          Prénom <span className="text-red-500">*</span>
        </Label>
        <Input
          id="first_name"
          value={form.first_name}
          required
          onChange={(e) => setForm({ ...form, first_name: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="last_name">
          Nom <span className="text-red-500">*</span>
        </Label>
        <Input
          id="last_name"
          value={form.last_name}
          required
          onChange={(e) => setForm({ ...form, last_name: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          value={form.email}
          required
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Téléphone</Label>
        <Input
          id="phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">
          Rôle <span className="text-red-500">*</span>
        </Label>
        <Select
          value={form.role}
          onValueChange={(value) => setForm({ ...form, role: value })}
          required
        >
          <SelectTrigger id="role">
            <SelectValue placeholder="Sélectionner un rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="client">Client</SelectItem>
            <SelectItem value="charge_de_compte">Chargé de compte</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {form.role === "charge_de_compte" && (
        <div className="space-y-2">
          <Label htmlFor="calendly_link">Lien Calendly</Label>
          <Input
            id="calendly_link"
            value={form.calendly_link}
            placeholder="https://calendly.com/..."
            onChange={(e) =>
              setForm({ ...form, calendly_link: e.target.value })
            }
          />
        </div>
      )}

      {form.role === "client" && (
        <div className="space-y-2">
          <Label htmlFor="assigned_to">
            Chargé de compte <span className="text-red-500">*</span>
          </Label>
          <Select
            value={form.assigned_to}
            onValueChange={(value) => setForm({ ...form, assigned_to: value })}
          >
            <SelectTrigger id="assigned_to">
              <SelectValue placeholder="Sélectionner un chargé de compte" />
            </SelectTrigger>
            <SelectContent>
              {chargés.length > 0 ? (
                chargés.map((c) => (
                  <SelectItem key={c.user_id} value={c.user_id}>
                    {c.first_name} {c.last_name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>
                  Aucun chargé disponible
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Création en cours..." : "Créer l'utilisateur"}
      </Button>

      {message && (
        <Alert variant={isError ? "destructive" : "default"}>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
    </form>
  );
}
