import { redirect } from "next/navigation";
import AuthCard from "@/components/admin/AuthCard";
import { SetPasswordForm } from "@/components/admin/AuthForms";
import { userClient } from "@/lib/supabase/server";

/** Reached from an invite or password-reset link (after /admin/auth/confirm). */
export default async function SetPasswordPage() {
  const db = await userClient();
  const { data } = await db.auth.getUser();
  if (!data.user) redirect("/admin/login/?error=link");
  return (
    <AuthCard title="Choose your password">
      <p className="text-secondary mb-3">Signed in as {data.user.email}</p>
      <SetPasswordForm />
    </AuthCard>
  );
}
