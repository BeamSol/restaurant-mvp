import { cookies } from "next/headers";
import { requirePageAdmin } from "@/lib/admin/auth";
import { userClient } from "@/lib/supabase/server";
import AdminNav from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

/** Everything inside /admin (except login pages) requires an admin. */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requirePageAdmin();
  const db = await userClient();
  const [items, branches, events, settings, requests] = await Promise.all([
    db.from("menu_items").select("id", { count: "exact", head: true }).eq("needs_review", true),
    db.from("branches").select("id", { count: "exact", head: true }).eq("needs_review", true),
    db.from("events").select("id", { count: "exact", head: true }).eq("needs_review", true),
    db.from("restaurant_settings").select("needs_review, logo_url, name").eq("id", 1).single(),
    db.from("requests").select("id", { count: "exact", head: true }).eq("status", "new"),
  ]);
  const review = (items.count ?? 0) + (branches.count ?? 0) + (events.count ?? 0) + (settings.data?.needs_review?.length ?? 0);
  const collapsed = (await cookies()).get("admin_sidebar")?.value === "collapsed";
  return (
    <div className="min-h-screen transition-[padding] duration-300 lg:pl-[var(--admin-sidebar,256px)]">
      {/* initial sidebar width from the cookie (the sidebar updates it live when toggled) */}
      <style>{`:root{--admin-sidebar:${collapsed ? "76px" : "256px"}}`}</style>
      <AdminNav
        role={admin.role}
        name={admin.name ?? ""}
        email={admin.email}
        counts={{ requests: requests.count ?? 0, review }}
        collapsed={collapsed}
        logo={settings.data?.logo_url ?? null}
        siteName={settings.data?.name ?? "Restaurant"}
      />
      <main className="mx-auto max-w-6xl px-4 pt-6 pb-28 sm:px-6 lg:px-8 lg:pt-8 lg:pb-14">{children}</main>
    </div>
  );
}
