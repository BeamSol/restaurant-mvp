/**
 * Loads the researched Mama's Kitchen data (supabase/seed/data.ts) into the
 * database. Safe to re-run: it REPLACES all content (not admin users).
 *
 *   npm run db:seed
 *
 * Uses the service-role key from .env.local (server-side only).
 */
import { readFileSync, existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { extractSwatches, tokensFromSwatches } from "../src/lib/palette.ts";
import * as data from "../supabase/seed/data.ts";

// --- env (.env.local)
if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
const db = createClient(url, key, { auth: { persistSession: false } });

const images: Record<string, { w: number; h: number; blur: string }> = JSON.parse(readFileSync("supabase/seed/images.json", "utf8"));
const blur = (path?: string | null) => (path ? images[path]?.blur ?? null : null);

async function run<T>(label: string, p: PromiseLike<{ data: T; error: { message: string } | null }>): Promise<T> {
  const { data: rows, error } = await p;
  if (error) throw new Error(`${label}: ${error.message}`);
  return rows;
}

// --- 1. wipe content (order matters for foreign keys)
const all = "00000000-0000-0000-0000-000000000000";
for (const table of ["events", "menu_items", "menu_categories", "special_closures", "opening_hours", "branches", "gallery_images", "testimonials", "announcements"]) {
  await run(`clear ${table}`, db.from(table).delete().neq("id", all));
}

// --- 2. settings, with the palette extracted from the logo
const { data: px } = await sharp("public/restaurant/logo.png").ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const palette = tokensFromSwatches(extractSwatches(px));
const s = data.settings;
await run(
  "settings",
  db.from("restaurant_settings").upsert({
    id: 1,
    ...s,
    tokens: palette.tokens,
    palette: palette.swatches,
    hero_blur: blur(s.hero_image),
    about_blur: blur(s.about_image),
    highlights: s.highlights.map((h) => ({ ...h, blur: blur(h.image) })),
    sections: {
      catering: { ...s.sections.catering, blur: blur(s.sections.catering.image) },
      inn: { ...s.sections.inn, blur: blur(s.sections.inn.image) },
    },
  }),
);
console.log("✓ settings (primary", palette.tokens.primary + ")");

// --- 3. branches + weekly hours
const branchIds: Record<string, string> = {};
for (const [i, b] of data.branches.entries()) {
  const { hours, ...row } = b;
  const inserted = await run("branch " + b.slug, db.from("branches").insert({ ...row, sort: i, photo_blur: blur(b.photo_url) }).select("id").single());
  branchIds[b.slug] = (inserted as { id: string }).id;
  const [open, close] = hours.split("-");
  await run(
    "hours " + b.slug,
    db.from("opening_hours").insert([0, 1, 2, 3, 4, 5, 6].map((weekday) => ({ branch_id: branchIds[b.slug], weekday, open_time: open, close_time: close, closed: false }))),
  );
}
console.log(`✓ ${data.branches.length} branches with hours`);

// --- 4. menu
let itemCount = 0;
for (const [ci, c] of data.menu.entries()) {
  const cat = (await run("category " + c.slug, db.from("menu_categories").insert({ slug: c.slug, name: c.name, name_am: c.name_am, sort: ci }).select("id").single())) as { id: string };
  const rows = c.items.map((it, ii) => {
    const note = data.itemNote(it);
    return {
      category_id: cat.id,
      slug: it.slug,
      name: it.name,
      name_am: it.name_am,
      description: it.description ?? null,
      description_am: it.description_am ?? null,
      price: it.price,
      photo_url: it.photo ?? null,
      photo_blur: blur(it.photo),
      tags: it.tags ?? [],
      is_featured: it.featured ?? false,
      branch_ids: (it.branches ?? []).map((slug) => branchIds[slug]),
      sort: ii,
      needs_review: note.length > 0,
      review_note: note || null,
    };
  });
  await run("items " + c.slug, db.from("menu_items").insert(rows));
  itemCount += rows.length;
}
console.log(`✓ ${data.menu.length} categories, ${itemCount} dishes`);

// --- 5. events, gallery, reviews, announcements
await run(
  "events",
  db.from("events").insert(data.events.map(({ branch, ...e }, i) => ({ ...e, branch_id: branchIds[branch], recurrence: "weekly", sort: i, photo_blur: blur(e.photo_url) }))),
);
await run(
  "gallery",
  db.from("gallery_images").insert(data.gallery.map((g, i) => ({ ...g, sort: i, blur: blur(g.url), width: images[g.url]?.w, height: images[g.url]?.h }))),
);
await run("testimonials", db.from("testimonials").insert(data.testimonials.map((t, i) => ({ ...t, sort: i }))));
await run("announcements", db.from("announcements").insert(data.announcements));
console.log(`✓ ${data.events.length} events, ${data.gallery.length} gallery photos, ${data.testimonials.length} sample reviews`);
// Tell the running website to drop its cache (optional: needs REVALIDATE_SECRET + the site running).
const site = process.env.NEXT_PUBLIC_SITE_URL;
if (process.env.REVALIDATE_SECRET && site) {
  const r = await fetch(`${site}/api/revalidate`, { method: "POST", headers: { "x-revalidate-secret": process.env.REVALIDATE_SECRET } }).catch(() => null);
  console.log(r?.ok ? "✓ website cache cleared" : `(website at ${site} not reachable; restart it or wait up to 1 hour to see the new data)`);
}
console.log("Done.");
