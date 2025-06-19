import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  try {
    const { type, email } = await req.json();

    try {
      await resend.emails.send({
        from: "onboarding@resend.dev", // change this to your verified sender email
        to: "delivered@resend.dev",
        subject: `${email}, document ajouté dans votre esoace`,
        html: `
          <h1>Bienvenue sur notre plateforme</h1>
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
