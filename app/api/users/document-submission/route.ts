import { ajoutEmail } from "@/emails/Ajout";
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
        from: "noreply@dubailaunchers.com", // change this to your verified sender email
        to: email,
        subject: `Dubai Launchers: Un nouveau document a été ajouté dans votre espace`,
        html: ajoutEmail(),
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
