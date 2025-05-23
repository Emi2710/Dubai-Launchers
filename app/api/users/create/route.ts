// app/api/users/create/route.ts (Next.js 13+ app router) ou pages/api/users/create.ts (pages router)
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // clé admin côté serveur uniquement
);

export async function POST(req: Request) {
  try {
    const form = await req.json();
    const {
      email,
      first_name,
      last_name,
      phone,
      role,
      calendly_link,
      assigned_to,
    } = form;

    // 1. Création utilisateur avec user_metadata (incluant le rôle)
    const { data: user, error } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true, // si tu veux que l’email soit considéré comme confirmé
      user_metadata: {
        first_name,
        last_name,
        phone,
        role,
        calendly_link: role === "charge_de_compte" ? calendly_link : null,
        assigned_to: role === "client" ? assigned_to : null,
      },
    });

    if (error || !user?.user?.id) {
      return NextResponse.json(
        { error: error?.message || "Erreur création utilisateur." },
        { status: 400 }
      );
    }

    const userId = user.user.id;

    // 2. Insertion dans la table profiles
    const { error: profileError } = await supabase.from("profiles").insert({
      user_id: userId,
      first_name,
      last_name,
      phone,
      role,
      calendly_link: role === "charge_de_compte" ? calendly_link : null,
      assigned_to: role === "client" ? assigned_to : null,
      active: true,
      email,
    });

    if (profileError) {
      return NextResponse.json(
        {
          error:
            "Utilisateur créé, mais échec d’insertion dans profiles : " +
            profileError.message,
        },
        { status: 500 }
      );
    }

    // 3. Envoi du lien de définition du mot de passe
    const { error: linkError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: "https://localhost:3000/login/reset-password", // mets ton URL ici
      }
    );

    if (linkError) {
      return NextResponse.json(
        {
          error:
            "Utilisateur créé, mais échec de l’envoi du lien de définition de mot de passe : " +
            linkError.message,
        },
        { status: 200 }
      );
    }

    // Succès
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Erreur serveur : " + err.message },
      { status: 500 }
    );
  }
}
