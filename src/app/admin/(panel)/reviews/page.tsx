import { requirePageAdmin } from "@/lib/admin/auth";
import { userClient } from "@/lib/supabase/server";
import ReviewsAdmin from "@/components/admin/ReviewsAdmin";
import { PageTitle } from "@/components/admin/ui";

export default async function ReviewsPage() {
  await requirePageAdmin("OWNER");
  const db = await userClient();
  const { data } = await db.from("testimonials").select("*").order("sort");
  return (
    <>
      <PageTitle title="Reviews" />
      <ReviewsAdmin reviews={data ?? []} />
    </>
  );
}
