import AuthCard from "@/components/admin/AuthCard";
import { LoginForm } from "@/components/admin/AuthForms";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const notice = error === "not-admin" ? "This account has no admin access." : error === "link" ? "That link has expired. Ask the owner for a new invite, or reset your password." : undefined;
  return (
    <AuthCard title="Staff login">
      <LoginForm notice={notice} />
    </AuthCard>
  );
}
