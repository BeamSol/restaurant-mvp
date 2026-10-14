import "server-only";
import { unstable_cache } from "next/cache";
import { publicClient } from "./supabase/public";
import type { Branch, SiteData } from "./types";

/** Cache tag for all public content. Admin saves call `updateTag(SITE_TAG)`. */
export const SITE_TAG = "site";

async function fetchSiteData(): Promise<SiteData> {
  const db = publicClient();
  const today = new Date().toISOString().slice(0, 10);
  const [settings, branches, hours, closures, categories, items, events, gallery, testimonials, announcements] = await Promise.all([
    db.from("restaurant_settings").select("*").eq("id", 1).single(),
    db.from("branches").select("*").eq("is_published", true).order("sort"),
    db.from("opening_hours").select("*"),
    // Closures from yesterday on (yesterday matters for after-midnight hours)
    db.from("special_closures").select("*").gte("date", new Date(Date.now() - 864e5).toISOString().slice(0, 10)).order("date"),
    db.from("menu_categories").select("*").eq("is_published", true).order("sort"),
    db.from("menu_items").select("*").eq("is_published", true).order("sort"),
    db.from("events").select("*").eq("is_published", true).order("sort"),
    db.from("gallery_images").select("*").eq("is_published", true).order("sort"),
    db.from("testimonials").select("*").eq("is_published", true).order("sort"),
    db.from("announcements").select("*").eq("is_active", true).order("created_at", { ascending: false }),
  ]);

  const failed = [settings, branches, hours, closures, categories, items, events, gallery, testimonials, announcements].find((r) => r.error);
  if (failed?.error) throw new Error(`Could not load site data: ${failed.error.message}`);

  // One-off events in the past are hidden automatically.
  const upcoming = (events.data ?? []).filter((e) => e.recurrence === "weekly" || (e.event_date && e.event_date >= today));

  return {
    settings: settings.data,
    branches: (branches.data ?? []).map((b) => ({ ...b, hours: (hours.data ?? []).filter((h) => h.branch_id === b.id) })) as Branch[],
    closures: closures.data ?? [],
    categories: categories.data ?? [],
    items: (items.data ?? []).map((i) => ({ ...i, price: i.price === null ? null : Number(i.price) })),
    events: upcoming,
    gallery: gallery.data ?? [],
    testimonials: testimonials.data ?? [],
    announcements: (announcements.data ?? []).filter(
      (a) => (!a.starts_at || a.starts_at <= new Date().toISOString()) && (!a.ends_at || a.ends_at >= new Date().toISOString()),
    ),
  };
}

/**
 * Cached for up to 1 hour, and refreshed immediately when an admin saves
 * (server actions call updateTag(SITE_TAG)).
 */
export const getSiteData = unstable_cache(fetchSiteData, ["site-data-v1"], { tags: [SITE_TAG], revalidate: 3600 });
