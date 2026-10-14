import Link from "next/link";
import { requirePageAdmin } from "@/lib/admin/auth";
import { userClient } from "@/lib/supabase/server";
import { EventList } from "@/components/admin/EventsAdmin";
import { PageTitle } from "@/components/admin/ui";

export default async function EventsAdmin() {
  await requirePageAdmin();
  const db = await userClient();
  const { data } = await db.from("events").select("*").order("sort");
  return (
    <>
      <PageTitle title="Live music & events" lead="Weekly nights (jazz, live band, jam session) and one-off events. One-off events disappear from the website after their date.">
        <Link href="/admin/events/new/" className="btn btn-primary btn-sm">
          + Add event
        </Link>
      </PageTitle>
      <EventList events={data ?? []} />
    </>
  );
}
