import { generateWelcomeEmail } from "@/emails/WelcomeEmail";
import { createClient } from "@supabase/supabase-js";
import { request } from "http";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY!);

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

    // 1. Create user
    const { data: user, error } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
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

    // 2. Insert profile
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

    // 3. Generate recovery link and send welcome email
    try {
      const { data: resetLinkData, error: resetLinkError } =
        await supabase.auth.admin.generateLink({
          type: "recovery",
          email,
          options: {
            redirectTo: `${process.env.NEXT_PUBLIC_URL}/login/reset-password`, // change to your domain
          },
        });

      const passwordLink = resetLinkData?.properties?.action_link;

      if (!passwordLink)
        throw new Error("Échec génération du lien de mot de passe.");

      await resend.emails.send({
        from: "noreply@dubailaunchers.com", // Replace with your sender domain
        to: email,
        subject: `${first_name}, bienvenue sur Dubai Launchers!`,
        html: generateWelcomeEmail(first_name, passwordLink),
      });
    } catch (emailError) {
      console.error("Erreur envoi email:", emailError);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Erreur serveur : " + err.message },
      { status: 500 }
    );
  }
}
