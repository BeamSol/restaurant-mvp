import { requirePageAdmin } from "@/lib/admin/auth";
import { userClient } from "@/lib/supabase/server";
import NeedsReview from "@/components/admin/NeedsReview";
import { PageTitle } from "@/components/admin/ui";

export default async function NeedsReviewPage() {
  const admin = await requirePageAdmin();
  const db = await userClient();
  const [s, items, branches, events] = await Promise.all([
    db.from("restaurant_settings").select("needs_review").eq("id", 1).single(),
    db.from("menu_items").select("id, name, review_note").eq("needs_review", true).order("name"),
    db.from("branches").select("id, name, review_note").eq("needs_review", true).order("sort"),
    db.from("events").select("id, title, review_note").eq("needs_review", true).order("sort"),
  ]);
  const rows = [
    ...(branches.data ?? []).map((b) => ({ id: b.id, name: b.name, note: b.review_note, table: "branches" as const, href: `/admin/branches/${b.id}/` })),
    ...(events.data ?? []).map((e) => ({ id: e.id, name: e.title, note: e.review_note, table: "events" as const, href: `/admin/events/${e.id}/` })),
    ...(items.data ?? []).map((i) => ({ id: i.id, name: i.name, note: i.review_note, table: "menu_items" as const, href: `/admin/menu/${i.id}/` })),
  ];
  return (
    <>
      <PageTitle title="Needs review" lead="We built this website from your old website (2018–2023) and a delivery app. Anything we couldn't confirm is listed here. Check each one, fix it if needed, then press “Confirmed”." />
      <NeedsReview settingsNotes={s.data?.needs_review ?? []} rows={rows} role={admin.role} />
    </>
  );
}
