import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePageAdmin } from "@/lib/admin/auth";
import { userClient } from "@/lib/supabase/server";
import ItemForm from "@/components/admin/ItemForm";
import { PageTitle } from "@/components/admin/ui";

export default async function EditItem({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ category?: string }> }) {
  const admin = await requirePageAdmin();
  const { id } = await params;
  const { category } = await searchParams;
  const db = await userClient();
  const [cats, branches, item] = await Promise.all([
    db.from("menu_categories").select("*").order("sort"),
    db.from("branches").select("id, name").neq("kind", "catering").order("sort"),
    id === "new" ? Promise.resolve({ data: null }) : db.from("menu_items").select("*").eq("id", id).maybeSingle(),
  ]);
  if (id !== "new" && !item.data) notFound();
  const it = item.data ? { ...item.data, price: item.data.price === null ? null : Number(item.data.price) } : undefined;
  return (
    <>
      <Link href="/admin/menu/" className="btn btn-ghost btn-sm -ml-2 mb-2">
        ← Menu
      </Link>
      <PageTitle title={it ? it.name : "New dish"} />
      <ItemForm item={it} categories={cats.data ?? []} branches={branches.data ?? []} role={admin.role} defaultCategory={category} />
    </>
  );
}
