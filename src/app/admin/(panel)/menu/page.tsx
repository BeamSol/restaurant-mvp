import { requirePageAdmin } from "@/lib/admin/auth";
import { userClient } from "@/lib/supabase/server";
import MenuManager from "@/components/admin/MenuManager";
import { PageTitle } from "@/components/admin/ui";

export default async function MenuAdmin() {
  const admin = await requirePageAdmin();
  const db = await userClient();
  const [cats, items] = await Promise.all([db.from("menu_categories").select("*").order("sort"), db.from("menu_items").select("*").order("sort")]);
  return (
    <>
      <PageTitle title="Menu" lead="Add and edit dishes, mark sold-out items, and reorder. Changes appear on the website within seconds." />
      <MenuManager categories={cats.data ?? []} items={(items.data ?? []).map((i) => ({ ...i, price: i.price === null ? null : Number(i.price) }))} role={admin.role} />
    </>
  );
}
