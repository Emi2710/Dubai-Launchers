import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { userId } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    // Mettre assigned_to à null pour les utilisateurs liés à ce manager
    await supabaseAdmin
      .from("profiles")
      .update({ assigned_to: null })
      .eq("assigned_to", userId);

    // Supprimer les données associées dans toutes les tables
    await supabaseAdmin.from("appointments").delete().eq("client_id", userId);
    await supabaseAdmin
      .from("business_progress")
      .delete()
      .eq("client_id", userId);
    await supabaseAdmin
      .from("upcoming_actions")
      .delete()
      .eq("client_id", userId);
    await supabaseAdmin.from("users_profiles").delete().eq("user_id", userId);
    await supabaseAdmin.from("profiles").delete().eq("user_id", userId);

    // Supprimer les fichiers du dossier documents/[userId]
    await deleteFilesInFolder("documents", `${userId}`);
    // Supprimer les fichiers du dossier documents/clients/[userId]
    await deleteFilesInFolder("documents", `clients/${userId}`);

    // Supprimer dans Supabase Auth
    const { error: authError } =
      await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) {
      console.error(authError.message);
      return NextResponse.json(
        { error: "Erreur suppression Auth" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Erreur suppression" }, { status: 500 });
  }
}

// Fonction pour supprimer tous les fichiers d'un dossier
async function deleteFilesInFolder(bucket: string, folderPath: string) {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .list(folderPath, {
      limit: 100,
      offset: 0,
      search: "",
    });

  if (error) {
    console.error(
      `Erreur en listant les fichiers dans ${folderPath} :`,
      error.message
    );
    return;
  }

  if (!data || data.length === 0) return;

  const filePaths = data.map((file) => `${folderPath}/${file.name}`);

  const { error: deleteError } = await supabaseAdmin.storage
    .from(bucket)
    .remove(filePaths);

  if (deleteError) {
    console.error(
      `Erreur en supprimant les fichiers dans ${folderPath} :`,
      deleteError.message
    );
  }
}
