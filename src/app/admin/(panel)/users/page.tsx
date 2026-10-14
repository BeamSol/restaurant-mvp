import { requirePageAdmin } from "@/lib/admin/auth";
import { userClient } from "@/lib/supabase/server";
import UsersAdmin from "@/components/admin/UsersAdmin";
import { PageTitle } from "@/components/admin/ui";

export default async function UsersPage() {
  const admin = await requirePageAdmin("OWNER");
  const db = await userClient();
  const { data } = await db.from("admin_users").select("user_id, email, full_name, role").order("created_at");
  return (
    <>
      <PageTitle title="Users" />
      <UsersAdmin users={data ?? []} me={admin.userId} />
    </>
  );
}
