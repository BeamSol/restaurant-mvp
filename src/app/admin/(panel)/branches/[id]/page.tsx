import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePageAdmin } from "@/lib/admin/auth";
import { userClient } from "@/lib/supabase/server";
import BranchForm from "@/components/admin/BranchForm";
import { PageTitle } from "@/components/admin/ui";

export default async function EditBranch({ params }: { params: Promise<{ id: string }> }) {
  await requirePageAdmin("OWNER");
  const { id } = await params;
  const db = await userClient();
  const branch = id === "new" ? null : (await db.from("branches").select("*").eq("id", id).maybeSingle()).data;
  if (id !== "new" && !branch) notFound();
  return (
    <>
      <Link href="/admin/branches/" className="btn btn-ghost btn-sm -ml-2 mb-2">
        ← Branches
      </Link>
      <PageTitle title={branch?.name ?? "New branch"} />
      <BranchForm branch={branch ?? undefined} />
    </>
  );
}
