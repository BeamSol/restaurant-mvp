"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { userClient } from "@/lib/supabase/server";
import { serviceClient } from "@/lib/supabase/service";
import { str } from "@/lib/admin/form";

type State = { error?: string; message?: string } | null;

const WINDOW_MIN = 15;
const MAX_PER_EMAIL = 5;
const MAX_PER_IP = 20;

async function clientIp() {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "unknown").trim();
}

/**
 * Login with rate limiting: max 5 failed attempts per email and 20 per IP
 * address in 15 minutes. Attempts are stored in `login_attempts`, which only
 * the server (service key) can read or write.
 */
export async function login(_: State, form: FormData): Promise<State> {
  const email = str(form, "email").toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  const ip = await clientIp();
  const svc = serviceClient();
  const since = new Date(Date.now() - WINDOW_MIN * 60_000).toISOString();
  const [byEmail, byIp] = await Promise.all([
    svc.from("login_attempts").select("id", { count: "exact", head: true }).eq("email", email).eq("success", false).gte("created_at", since),
    svc.from("login_attempts").select("id", { count: "exact", head: true }).eq("ip", ip).eq("success", false).gte("created_at", since),
  ]);
  if ((byEmail.count ?? 0) >= MAX_PER_EMAIL || (byIp.count ?? 0) >= MAX_PER_IP) {
    return { error: `Too many failed attempts. Please wait ${WINDOW_MIN} minutes and try again.` };
  }

  const db = await userClient();
  const { data, error } = await db.auth.signInWithPassword({ email, password });
  let isAdmin = false;
  if (!error && data.user) {
    const { data: row } = await db.from("admin_users").select("role").eq("user_id", data.user.id).maybeSingle();
    isAdmin = !!row;
    if (!isAdmin) await db.auth.signOut();
  }
  await svc.from("login_attempts").insert({ email, ip, success: isAdmin });

  if (!isAdmin) return { error: "Wrong email or password, or this account has no admin access." };
  await db.from("activity_log").insert({ user_id: data.user!.id, email, action: "login", entity: "session", summary: "Logged in" });
  redirect("/admin/");
}

export async function logout() {
  const db = await userClient();
  await db.auth.signOut();
  redirect("/admin/login/");
}

/** Sends a password-reset email (link opens /admin/auth/confirm → /admin/set-password). */
export async function requestReset(_: State, form: FormData): Promise<State> {
  const email = str(form, "email").toLowerCase();
  if (!email) return { error: "Enter your email." };
  const db = await userClient();
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3100";
  await db.auth.resetPasswordForEmail(email, { redirectTo: `${site}/admin/set-password/` });
  // Same message whether or not the account exists (don't reveal who has access).
  return { message: "If this email has admin access, a reset link is on its way." };
}

/** After an invite or reset link: choose a password. */
export async function setPassword(_: State, form: FormData): Promise<State> {
  const password = String(form.get("password") ?? "");
  if (password.length < 10) return { error: "Use at least 10 characters." };
  if (password !== String(form.get("confirm") ?? "")) return { error: "The two passwords don't match." };
  const db = await userClient();
  const { error } = await db.auth.updateUser({ password });
  if (error) return { error: error.message };
  redirect("/admin/");
}
