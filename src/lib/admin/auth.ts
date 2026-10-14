import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { userClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/types";

export interface AdminSession {
  userId: string;
  email: string;
  name: string | null;
  role: Role;
}

/** The logged-in admin (or null). Cached per request. */
export const getAdmin = cache(async (): Promise<AdminSession | null> => {
  const db = await userClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return null;
  const { data } = await db.from("admin_users").select("email, full_name, role").eq("user_id", user.id).maybeSingle();
  if (!data) return null;
  return { userId: user.id, email: data.email, name: data.full_name, role: data.role };
});

/** For pages: send to login if not an admin; show "owner only" if the role is too low. */
export async function requirePageAdmin(role?: Role): Promise<AdminSession> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login/?error=not-admin");
  if (role === "OWNER" && admin.role !== "OWNER") redirect("/admin/?error=owner-only");
  return admin;
}
