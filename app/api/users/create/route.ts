import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";
import { Resend } from "resend";

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

    // 3. Send welcome email with Resend
    try {
      await resend.emails.send({
        from: "onboarding@resend.dev", // change this to your verified sender email
        to: "delivered@resend.dev",
        subject: `${first_name}, bienvenue sur Dubai Launchers!`,
        html: `
          <h1>Bienvenue sur notre plateforme ${first_name}!</h1>
          <p>Nous sommes ravis de vous compter parmi nous.</p>
          <p>Pour accéder à votre espace, veuillez d'abord créer votre mot de passe en suivant ce lien : <a href="https://localhost3000/login/forgot-password" target="_blank">ici</a></p>
        `,
      });
    } catch (emailError) {
      // If email sending fails, log but don't break
      console.error("Erreur envoi email:", emailError);
    }

    // Success
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Erreur serveur : " + err.message },
      { status: 500 }
    );
  }
}
