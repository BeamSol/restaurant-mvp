import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, assertSupabaseEnv } from "./env";

/**
 * Anonymous client for the PUBLIC website. It has no user session, so Row
 * Level Security only lets it read published content. Safe to cache.
 */
export function publicClient() {
  assertSupabaseEnv();
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
