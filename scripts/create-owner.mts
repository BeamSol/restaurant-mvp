/**
 * Creates (or promotes) the FIRST owner account. Public sign-up is disabled,
 * so this is how the very first admin gets in. After that, the owner invites
 * staff from Admin → Users.
 *
 *   npm run create-owner -- owner@example.com "a-strong-password" "Owner name"
 *   npm run create-owner -- staff@example.com "password" "Staff name" STAFF
 */
import { readFileSync, existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
const [email, password, fullName = "", role = "OWNER"] = process.argv.slice(2);
if (!email || !password) {
  console.error('Usage: npm run create-owner -- <email> <password> ["Full name"] [OWNER|STAFF]');
  process.exit(1);
}
if (password.length < 10) throw new Error("Use a password of at least 10 characters.");
if (!["OWNER", "STAFF"].includes(role)) throw new Error("Role must be OWNER or STAFF");

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });

// Find existing user or create one (email confirmed, since there is no sign-up flow).
const { data: list, error: listError } = await db.auth.admin.listUsers({ perPage: 1000 });
if (listError) throw listError;
let user = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
if (user) {
  const { error } = await db.auth.admin.updateUserById(user.id, { password });
  if (error) throw error;
} else {
  const { data, error } = await db.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: fullName } });
  if (error) throw error;
  user = data.user;
}

const { error } = await db.from("admin_users").upsert({ user_id: user.id, email, full_name: fullName || null, role });
if (error) throw error;
console.log(`✓ ${email} can now sign in at /admin as ${role}`);
