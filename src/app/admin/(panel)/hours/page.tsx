import { requirePageAdmin } from "@/lib/admin/auth";
import { userClient } from "@/lib/supabase/server";
import { Closures, WeeklyHours } from "@/components/admin/HoursEditor";
import { PageTitle, ReviewBadge } from "@/components/admin/ui";
import type { Branch } from "@/lib/types";

export default async function HoursAdmin() {
  const admin = await requirePageAdmin();
  const db = await userClient();
  const today = new Date().toISOString().slice(0, 10);
  const [branches, hours, closures] = await Promise.all([
    db.from("branches").select("*").order("sort"),
    db.from("opening_hours").select("*"),
    db.from("special_closures").select("*").gte("date", today).order("date"),
  ]);
  const list: Branch[] = (branches.data ?? []).map((b) => ({ ...b, hours: (hours.data ?? []).filter((h) => h.branch_id === b.id) }));
  return (
    <>
      <PageTitle title="Hours & holidays" lead="Weekly opening hours per branch, plus holiday closures (Genna, Timket, Fasika, Meskel…). The “Open now” badges on the website use these." />
      <section className="card mb-4 p-4">
        <h2 className="h3 mb-3">Holiday closures &amp; special days</h2>
        <Closures closures={closures.data ?? []} branches={list.map(({ id, name }) => ({ id, name }))} />
      </section>
      <div className="space-y-3">
        {list.map((b) => (
          <details key={b.id} className="card p-4" open={list.length <= 2}>
            <summary className="flex cursor-pointer items-center gap-2 text-[15px] font-semibold">
              {b.name} {b.needs_review && <ReviewBadge note={b.review_note} />}
            </summary>
            <div className="mt-3">
              <WeeklyHours branch={b} role={admin.role} />
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
