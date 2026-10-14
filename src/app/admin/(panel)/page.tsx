import Link from "next/link";
import { requirePageAdmin } from "@/lib/admin/auth";
import { userClient } from "@/lib/supabase/server";
import { getZonedNow } from "@/lib/hours";
import { AnnouncementQuick, SoldOutQuick, TodayHours } from "@/components/admin/QuickActions";
import { AlertIcon, ArrowRightIcon, CalendarIcon, InboxIcon, ListIcon } from "@/components/Icons";

function Stat({ href, label, value, hint, Icon, tone }: { href: string; label: string; value: number; hint: string; Icon: typeof InboxIcon; tone: "primary" | "green" | "amber" | "neutral" }) {
  const toneCls = {
    primary: "bg-primary/12 text-primary",
    green: "bg-green-600/12 text-green-700 dark:text-green-400",
    amber: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    neutral: "bg-tint text-ink/80",
  }[tone];
  return (
    <Link href={href} className="card card-hover group flex flex-col p-4 sm:p-5">
      <span className="flex items-center justify-between">
        <span className={`inline-flex size-10 items-center justify-center rounded-[12px] ${toneCls}`}>
          <Icon size={20} />
        </span>
        <ArrowRightIcon size={16} className="text-muted transition-transform group-hover:translate-x-0.5" />
      </span>
      <span className="mt-4 text-[30px] leading-none font-extrabold tabular-nums">{value}</span>
      <span className="mt-1.5 text-[14px] font-semibold">{label}</span>
      <span className="text-[12px] text-muted">{hint}</span>
    </Link>
  );
}

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const admin = await requirePageAdmin();
  const { error } = await searchParams;
  const db = await userClient();
  const { data: settings } = await db.from("restaurant_settings").select("timezone, needs_review").eq("id", 1).single();
  const tz = settings?.timezone ?? "Africa/Addis_Ababa";
  const today = getZonedNow(tz).date;
  const [items, branches, closures, announcement, reviewItems, reviewBranches, newRequests, todayRequests, recent, activity] = await Promise.all([
    db.from("menu_items").select("id, name, name_am, is_available, is_featured").order("name"),
    db.from("branches").select("id, name").order("sort"),
    db.from("special_closures").select("*").eq("date", today),
    db.from("announcements").select("*").order("created_at", { ascending: false }).limit(1).maybeSingle(),
    db.from("menu_items").select("id", { count: "exact", head: true }).eq("needs_review", true),
    db.from("branches").select("id", { count: "exact", head: true }).eq("needs_review", true),
    db.from("requests").select("id", { count: "exact", head: true }).eq("status", "new"),
    db.from("requests").select("id", { count: "exact", head: true }).eq("date", today).in("status", ["new", "confirmed"]),
    db.from("requests").select("id, kind, name, date, time, guests, status, created_at").order("created_at", { ascending: false }).limit(5),
    admin.role === "OWNER" ? db.from("activity_log").select("email, summary, created_at").order("created_at", { ascending: false }).limit(6) : Promise.resolve({ data: [] }),
  ]);
  const soldOut = (items.data ?? []).filter((i) => !i.is_available).length;
  const review = (reviewItems.count ?? 0) + (reviewBranches.count ?? 0) + (settings?.needs_review?.length ?? 0);
  const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "numeric", hourCycle: "h23" }).format(new Date()));
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-secondary">{new Date().toLocaleDateString("en-GB", { timeZone: tz, weekday: "long", day: "numeric", month: "long" })}</p>
        <h1 className="h1 !text-[28px] lg:!text-[34px]">
          {greeting}
          {admin.name ? `, ${admin.name.split(" ")[0]}` : ""}
        </h1>
      </div>
      {error === "owner-only" && <p className="rounded-[12px] bg-amber-50 p-3 text-[14px] text-amber-900">That page is only for the owner.</p>}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <Stat href="/admin/requests/" label="New bookings" value={newRequests.count ?? 0} hint="Waiting for your call" Icon={InboxIcon} tone="primary" />
        <Stat href="/admin/requests/" label="Booked for today" value={todayRequests.count ?? 0} hint="New + confirmed" Icon={CalendarIcon} tone="green" />
        <Stat href="/admin/menu/" label="Sold out" value={soldOut} hint={`of ${(items.data ?? []).length} dishes`} Icon={ListIcon} tone="neutral" />
        <Stat href="/admin/needs-review/" label="Needs review" value={review} hint="Old info to confirm" Icon={AlertIcon} tone="amber" />
      </div>

      {(recent.data?.length ?? 0) > 0 && (
        <section className="card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <h2 className="h3">Latest bookings & enquiries</h2>
            <Link href="/admin/requests/" className="btn btn-ghost btn-sm">
              All <ArrowRightIcon size={15} />
            </Link>
          </div>
          <ul className="mt-2 divide-y divide-border">
            {recent.data!.map((r) => (
              <li key={r.id}>
                <Link href="/admin/requests/" className="flex items-center justify-between gap-3 py-2.5 text-[14px] hover:text-primary">
                  <span className="min-w-0 truncate">
                    <strong>{r.name}</strong> · {r.kind === "table" ? `${r.guests ?? "?"} guests` : "Catering"} {r.date && `· ${new Date(`${r.date}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`} {r.time && r.time.slice(0, 5)}
                  </span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${r.status === "new" ? "bg-primary text-on-primary" : r.status === "confirmed" ? "bg-green-600 text-white" : "bg-border text-ink"}`}>{r.status}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <SoldOutQuick items={items.data ?? []} />
        <AnnouncementQuick current={announcement.data ?? undefined} />
      </div>
      <TodayHours branches={branches.data ?? []} closures={closures.data ?? []} today={today} tz={tz} />

      {admin.role === "OWNER" && (activity.data?.length ?? 0) > 0 && (
        <section className="card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <h2 className="h3">Recent changes</h2>
            <Link href="/admin/activity/" className="btn btn-ghost btn-sm">
              All <ArrowRightIcon size={15} />
            </Link>
          </div>
          <ul className="text-secondary mt-2 space-y-1.5">
            {activity.data!.map((a, i) => (
              <li key={i}>
                <span className="text-ink">{a.summary}</span> · {a.email} · {new Date(a.created_at).toLocaleString("en-GB", { timeZone: tz, dateStyle: "medium", timeStyle: "short" })}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
