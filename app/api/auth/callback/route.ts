// app/auth/callback/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/client/dashboard", req.url)); // or dynamic

  const supabase = createMiddlewareClient({ req, res });
  await supabase.auth.getSession(); // Sets the cookie

  return res;
}
