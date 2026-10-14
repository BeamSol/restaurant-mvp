import Link from "next/link";
import { requirePageAdmin } from "@/lib/admin/auth";
import { userClient } from "@/lib/supabase/server";
import BranchList from "@/components/admin/BranchList";
import { PageTitle } from "@/components/admin/ui";

export default async function BranchesAdmin() {
  await requirePageAdmin("OWNER");
  const db = await userClient();
  const { data } = await db.from("branches").select("*").order("sort");
  return (
    <>
      <PageTitle title="Branches" lead="The order here is the order on the website. The switch shows or hides a branch.">
        <Link href="/admin/branches/new/" className="btn btn-primary btn-sm">
          + Add branch
        </Link>
      </PageTitle>
      <BranchList branches={data ?? []} />
      <p className="text-secondary mt-3">
        Opening hours are edited in <Link href="/admin/hours/" className="text-primary underline">Hours &amp; holidays</Link>.
      </p>
    </>
  );
}
