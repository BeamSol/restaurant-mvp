import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./env";

/**
 * SERVICE-ROLE client: bypasses Row Level Security. Server-side only, never
 * import this from a Client Component. Used for: inviting/creating admin
 * users and login rate limiting. Everything else uses userClient().
 */
export function serviceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing (server-only env var, see .env.example).");
  return createClient(SUPABASE_URL, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
