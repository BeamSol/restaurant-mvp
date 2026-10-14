import "server-only";
import { updateTag } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SITE_TAG } from "@/lib/data";
import { userClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/types";
import { getAdmin, type AdminSession } from "./auth";

export type ActionResult = { ok: true; message?: string; data?: unknown } | { ok: false; error: string };

/**
 * Every admin change goes through here:
 *  1. checks the user is an admin (and OWNER if required): server-side role check,
 *  2. runs the change with the USER's database client, so Row Level Security applies too,
 *  3. writes an activity-log entry,
 *  4. refreshes the public website cache so the change is visible within seconds.
 */
export async function mutate(
  opts: { role?: Role; entity: string; action: string; summary: string; entityId?: string },
  fn: (db: SupabaseClient, admin: AdminSession) => Promise<unknown>,
): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return { ok: false, error: "Your session has expired. Please log in again." };
  if (opts.role === "OWNER" && admin.role !== "OWNER") return { ok: false, error: "Only the owner can do this." };
  const db = await userClient();
  try {
    const data = await fn(db, admin);
    await db.from("activity_log").insert({
      user_id: admin.userId,
      email: admin.email,
      action: opts.action,
      entity: opts.entity,
      entity_id: opts.entityId ?? null,
      summary: opts.summary.slice(0, 300),
    });
    updateTag(SITE_TAG);
    return { ok: true, message: "Saved", data };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    // Friendly text for the most common database errors
    if (/row-level security|permission denied|42501|Only the owner/i.test(msg)) return { ok: false, error: /Only the owner/.test(msg) ? msg : "You don't have permission to do this." };
    return { ok: false, error: msg };
  }
}

/** Throws on a Supabase error so mutate() can report it. */
export function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}
