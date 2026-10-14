import AuthCard from "@/components/admin/AuthCard";
import { ForgotForm } from "@/components/admin/AuthForms";

export default function ForgotPage() {
  return (
    <AuthCard title="Reset password">
      <ForgotForm />
    </AuthCard>
  );
}
