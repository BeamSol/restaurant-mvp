import { type NextRequest, NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { userClient } from "@/lib/supabase/server";

/**
 * Invite + password-reset links land here: /admin/auth/confirm/?token_hash=…&type=invite|recovery
 * We verify the one-time token (creates a session cookie) and send the user
 * to choose a password. Email templates: supabase/templates/*.html
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const next = new URL("/admin/set-password/", url.origin);
  if (tokenHash && type && ["invite", "recovery", "magiclink", "email"].includes(type)) {
    const db = await userClient();
    const { error } = await db.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) return NextResponse.redirect(next);
  }
  return NextResponse.redirect(new URL("/admin/login/?error=link", url.origin));
}
