/**
 * One-time database setup that runs INSIDE the Vercel build, where the
 * Supabase keys are available (Vercel marks them "sensitive", so they can't
 * be downloaded to a laptop). Does nothing unless RUN_DB_SETUP=1.
 *
 *  1. applies supabase/migrations (safe to repeat: already-applied ones are skipped)
 *  2. loads the seed data ONLY if the database has no restaurant yet
 *  3. creates/updates admin accounts from SETUP_OWNER_* / SETUP_STAFF_* env vars
 *
 * Remove RUN_DB_SETUP (and the SETUP_* passwords) from Vercel afterwards.
 */
import { spawnSync } from "node:child_process";

if (process.env.RUN_DB_SETUP !== "1") {
  console.log("[setup] RUN_DB_SETUP is not 1: skipping database setup.");
  process.exit(0);
}

const run = (cmd, args, label) => {
  console.log(`[setup] ${label}…`);
  const r = spawnSync(cmd, args, { stdio: "inherit", env: process.env });
  if (r.status !== 0) {
    console.error(`[setup] ${label} FAILED (exit ${r.status})`);
    process.exit(1);
  }
};

const dbUrl = process.env.POSTGRES_URL_NON_POOLING;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!dbUrl || !url || !key) {
  console.error("[setup] Missing POSTGRES_URL_NON_POOLING / NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

// 1. schema, RLS, storage bucket
run("npx", ["supabase", "db", "push", "--db-url", dbUrl, "--include-all", "--yes"], "Applying migrations");

// 2. seed only an empty database (never overwrite real content)
const res = await fetch(`${url}/rest/v1/restaurant_settings?select=id&id=eq.1`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
const rows = res.ok ? await res.json() : [];
if (Array.isArray(rows) && rows.length === 0) {
  run("node", ["--experimental-strip-types", "--no-warnings", "scripts/seed.mts"], "Loading Mama's Kitchen data (empty database)");
} else {
  console.log("[setup] Restaurant data already present: not seeding.");
}

// 3. admin accounts
for (const role of ["OWNER", "STAFF"]) {
  const email = process.env[`SETUP_${role}_EMAIL`];
  const password = process.env[`SETUP_${role}_PASSWORD`];
  if (email && password) run("node", ["--experimental-strip-types", "--no-warnings", "scripts/create-owner.mts", email, password, role === "OWNER" ? "Owner" : "Staff", role], `Creating ${role} ${email}`);
}
console.log("[setup] Done.");
