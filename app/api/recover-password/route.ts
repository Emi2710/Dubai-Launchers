import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { generateResetPasswordEmail } from "@/emails/PasswordRecover"; // Crée un email distinct pour reset si tu veux

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email requis." }, { status: 400 });
    }

    // Génération du lien de récupération
    const { data: resetLinkData, error: resetLinkError } =
      await supabase.auth.admin.generateLink({
        type: "recovery",
        email,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_URL}/login/reset-password`,
        },
      });

    if (resetLinkError || !resetLinkData?.properties?.action_link) {
      console.error(resetLinkError);
      return NextResponse.json(
        { error: "Impossible de générer le lien de récupération." },
        { status: 500 }
      );
    }

    const passwordLink = resetLinkData.properties.action_link;

    // Envoi de l'email
    await resend.emails.send({
      from: "noreply@dubailaunchers.com",
      to: email,
      subject: `Réinitialisation de votre mot de passe`,
      html: generateResetPasswordEmail(passwordLink),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Erreur serveur : " + err.message },
      { status: 500 }
    );
  }
}
