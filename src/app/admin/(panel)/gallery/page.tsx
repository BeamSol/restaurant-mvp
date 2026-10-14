import { requirePageAdmin } from "@/lib/admin/auth";
import { userClient } from "@/lib/supabase/server";
import GalleryAdmin from "@/components/admin/GalleryAdmin";
import { PageTitle } from "@/components/admin/ui";

export default async function GalleryPage() {
  await requirePageAdmin();
  const db = await userClient();
  const { data } = await db.from("gallery_images").select("*").order("sort");
  return (
    <>
      <PageTitle title="Gallery" />
      <GalleryAdmin images={data ?? []} />
    </>
  );
}
