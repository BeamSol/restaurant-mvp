import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePageAdmin } from "@/lib/admin/auth";
import { userClient } from "@/lib/supabase/server";
import { EventForm } from "@/components/admin/EventsAdmin";
import { PageTitle } from "@/components/admin/ui";

export default async function EditEvent({ params }: { params: Promise<{ id: string }> }) {
  await requirePageAdmin();
  const { id } = await params;
  const db = await userClient();
  const [branches, event] = await Promise.all([db.from("branches").select("id, name").order("sort"), id === "new" ? Promise.resolve({ data: null }) : db.from("events").select("*").eq("id", id).maybeSingle()]);
  if (id !== "new" && !event.data) notFound();
  return (
    <>
      <Link href="/admin/events/" className="btn btn-ghost btn-sm -ml-2 mb-2">
        ← Events
      </Link>
      <PageTitle title={event.data?.title ?? "New event"} />
      <EventForm event={event.data ?? undefined} branches={branches.data ?? []} />
    </>
  );
}
