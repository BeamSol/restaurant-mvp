"use server";

/**
 * All admin write actions. Each one goes through `mutate()`, which:
 * checks the role on the server → runs with the user's DB client (RLS) →
 * logs the activity → refreshes the public site cache.
 */
import sharp from "sharp";
import { check, mutate, type ActionResult } from "@/lib/admin/mutate";
import { maybeUpload, uploadPhoto } from "@/lib/admin/images";
import { bool, isDate, isTime, isUuid, lines, list, num, opt, slugify, str } from "@/lib/admin/form";
import { getAdmin } from "@/lib/admin/auth";
import { serviceClient } from "@/lib/supabase/service";
import { checkTokens, extractSwatches, tokensFromSwatches, type DesignTokens } from "@/lib/palette";
import { getZonedNow } from "@/lib/hours";
import { MENU_TAGS, type MenuTag, type Role } from "@/lib/types";

type State = ActionResult | null;

/* ============================== MENU ============================== */

export async function saveItem(_: State, f: FormData): Promise<ActionResult> {
  const id = str(f, "id");
  const name = str(f, "name");
  if (!name) return { ok: false, error: "Name (English) is required." };
  const categoryId = str(f, "category_id");
  if (!isUuid(categoryId)) return { ok: false, error: "Choose a menu section." };
  const tags = list(f, "tags").filter((t): t is MenuTag => MENU_TAGS.includes(t as MenuTag));
  const admin = await getAdmin();
  const price = num(f, "price");
  if (price !== null && price > 50000) return { ok: false, error: "That price looks too high. Please check it (max 50,000 ETB)." };

  return mutate({ entity: "menu_item", action: id ? "update" : "create", summary: `${id ? "Edited" : "Added"} dish "${name}"`, entityId: id || undefined }, async (db) => {
    const row: Record<string, unknown> = {
      name,
      name_am: opt(f, "name_am"),
      description: opt(f, "description"),
      description_am: opt(f, "description_am"),
      category_id: categoryId,
      tags,
      is_available: bool(f, "is_available"),
      is_featured: bool(f, "is_featured"),
      is_published: bool(f, "is_published"),
      branch_ids: list(f, "branch_ids").filter(isUuid),
    };
    // Prices: only the owner may change them (also enforced by a database trigger).
    if (admin?.role === "OWNER") row.price = price;
    if (bool(f, "mark_reviewed")) Object.assign(row, { needs_review: false, review_note: null });
    const photo = await maybeUpload(db, f, "menu");
    if (photo) Object.assign(row, { photo_url: photo.url, photo_blur: photo.blur });
    if (bool(f, "remove_photo")) Object.assign(row, { photo_url: null, photo_blur: null });

    if (id) return check(await db.from("menu_items").update(row).eq("id", id).select("id").single());
    const { data: last } = await db.from("menu_items").select("sort").eq("category_id", categoryId).order("sort", { ascending: false }).limit(1).maybeSingle();
    return check(await db.from("menu_items").insert({ ...row, price: admin?.role === "OWNER" ? price : null, slug: `${slugify(name)}-${Date.now().toString(36)}`, sort: (last?.sort ?? -1) + 1 }).select("id").single());
  });
}

export async function deleteItem(id: string): Promise<ActionResult> {
  return mutate({ role: "OWNER", entity: "menu_item", action: "delete", summary: `Deleted dish ${id}`, entityId: id }, async (db) => {
    check(await db.from("menu_items").delete().eq("id", id));
  });
}

/** One-tap "sold out" / "available". */
export async function setAvailable(id: string, available: boolean, name = ""): Promise<ActionResult> {
  return mutate({ entity: "menu_item", action: "update", summary: `${name || "Dish"} marked ${available ? "available" : "SOLD OUT"}`, entityId: id }, async (db) => {
    check(await db.from("menu_items").update({ is_available: available }).eq("id", id));
  });
}

export async function setFeatured(id: string, featured: boolean, name = ""): Promise<ActionResult> {
  return mutate({ entity: "menu_item", action: "update", summary: `${name || "Dish"} ${featured ? "added to" : "removed from"} signature dishes`, entityId: id }, async (db) => {
    check(await db.from("menu_items").update({ is_featured: featured }).eq("id", id));
  });
}

export async function saveCategory(_: State, f: FormData): Promise<ActionResult> {
  const id = str(f, "id");
  const name = str(f, "name");
  if (!name) return { ok: false, error: "Section name is required." };
  return mutate({ role: "OWNER", entity: "menu_category", action: id ? "update" : "create", summary: `${id ? "Renamed" : "Added"} menu section "${name}"` }, async (db) => {
    const row = { name, name_am: opt(f, "name_am"), is_published: bool(f, "is_published") };
    if (id) return check(await db.from("menu_categories").update(row).eq("id", id));
    const { count } = await db.from("menu_categories").select("id", { count: "exact", head: true });
    return check(await db.from("menu_categories").insert({ ...row, slug: slugify(name), sort: count ?? 0 }));
  });
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  return mutate({ role: "OWNER", entity: "menu_category", action: "delete", summary: `Deleted menu section ${id}` }, async (db) => {
    const { count } = await db.from("menu_items").select("id", { count: "exact", head: true }).eq("category_id", id);
    if (count) throw new Error("Move or delete the dishes in this section first.");
    check(await db.from("menu_categories").delete().eq("id", id));
  });
}

/**
 * Bulk price change by a percentage (owner only), optionally for one section.
 * Rounds to the nearest 5 birr by default. Items without a price are skipped.
 */
export async function bulkPrice(_: State, f: FormData): Promise<ActionResult> {
  const percent = num(f, "percent");
  if (percent === null || percent < -50 || percent > 200 || percent === 0) return { ok: false, error: "Enter a percentage between -50 and 200 (not 0)." };
  const category = str(f, "category_id");
  const roundTo = Number(str(f, "round") || 5);
  return mutate({ role: "OWNER", entity: "menu_item", action: "bulk_price", summary: `Changed prices by ${percent > 0 ? "+" : ""}${percent}%${category ? " in one section" : " on the whole menu"}` }, async (db) => {
    let q = db.from("menu_items").select("id, price").not("price", "is", null);
    if (isUuid(category)) q = q.eq("category_id", category);
    const items = check(await q) as { id: string; price: number }[];
    await Promise.all(
      items.map(async (i) => {
        const raw = Number(i.price) * (1 + percent / 100);
        const price = Math.max(0, Math.round(raw / roundTo) * roundTo);
        check(await db.from("menu_items").update({ price }).eq("id", i.id));
      }),
    );
    return { updated: items.length };
  });
}

/* ============================== ORDERING & PUBLISHING ============================== */

const SORTABLE: Record<string, Role> = { menu_items: "STAFF", menu_categories: "OWNER", branches: "OWNER", events: "STAFF", gallery_images: "STAFF", testimonials: "OWNER" };

/** Saves a new order after drag & drop. */
export async function reorder(table: string, ids: string[]): Promise<ActionResult> {
  if (!(table in SORTABLE) || !ids.every(isUuid)) return { ok: false, error: "Invalid reorder request." };
  return mutate({ role: SORTABLE[table] === "OWNER" ? "OWNER" : undefined, entity: table, action: "reorder", summary: `Reordered ${table.replace("_", " ")}` }, async (db) => {
    await Promise.all(ids.map(async (id, sort) => check(await db.from(table).update({ sort }).eq("id", id))));
  });
}

const PUBLISHABLE: Record<string, Role> = { menu_items: "STAFF", branches: "OWNER", events: "STAFF", gallery_images: "STAFF", testimonials: "OWNER", menu_categories: "OWNER" };

export async function setPublished(table: string, id: string, published: boolean): Promise<ActionResult> {
  if (!(table in PUBLISHABLE) || !isUuid(id)) return { ok: false, error: "Invalid request." };
  return mutate({ role: PUBLISHABLE[table] === "OWNER" ? "OWNER" : undefined, entity: table, action: "update", summary: `${published ? "Published" : "Hid"} a row in ${table}`, entityId: id }, async (db) => {
    check(await db.from(table).update({ is_published: published }).eq("id", id));
  });
}

/* ============================== BRANCHES ============================== */

export async function saveBranch(_: State, f: FormData): Promise<ActionResult> {
  const id = str(f, "id");
  const name = str(f, "name");
  const address = str(f, "address");
  if (!name || !address) return { ok: false, error: "Name and address are required." };
  return mutate({ role: "OWNER", entity: "branch", action: id ? "update" : "create", summary: `${id ? "Edited" : "Added"} branch "${name}"`, entityId: id || undefined }, async (db) => {
    const row: Record<string, unknown> = {
      name,
      name_am: opt(f, "name_am"),
      address,
      address_am: opt(f, "address_am"),
      description: opt(f, "description"),
      description_am: opt(f, "description_am"),
      kind: ["restaurant", "lounge", "catering"].includes(str(f, "kind")) ? str(f, "kind") : "restaurant",
      phones: lines(f, "phones"),
      map_query: opt(f, "map_query"),
      lat: num(f, "lat"),
      lng: num(f, "lng"),
      photo_alt: opt(f, "photo_alt"),
      is_published: bool(f, "is_published"),
    };
    if (bool(f, "mark_reviewed")) Object.assign(row, { needs_review: false, review_note: null });
    const photo = await maybeUpload(db, f, "branch");
    if (photo) Object.assign(row, { photo_url: photo.url, photo_blur: photo.blur });
    if (id) return check(await db.from("branches").update(row).eq("id", id).select("id").single());
    const { count } = await db.from("branches").select("id", { count: "exact", head: true });
    const created = check(await db.from("branches").insert({ ...row, slug: `${slugify(name)}-${Date.now().toString(36)}`, sort: count ?? 0 }).select("id").single()) as { id: string };
    // New branch starts with 08:00–22:00 every day; edit in Hours.
    check(await db.from("opening_hours").insert([0, 1, 2, 3, 4, 5, 6].map((weekday) => ({ branch_id: created.id, weekday, open_time: "08:00", close_time: "22:00" }))));
    return created;
  });
}

export async function deleteBranch(id: string): Promise<ActionResult> {
  return mutate({ role: "OWNER", entity: "branch", action: "delete", summary: `Deleted branch ${id}`, entityId: id }, async (db) => {
    check(await db.from("branches").delete().eq("id", id));
  });
}

/* ============================== HOURS & CLOSURES ============================== */

export async function saveHours(_: State, f: FormData): Promise<ActionResult> {
  const branchId = str(f, "branch_id");
  if (!isUuid(branchId)) return { ok: false, error: "Unknown branch." };
  const rows = [0, 1, 2, 3, 4, 5, 6].map((d) => {
    const closed = bool(f, `closed_${d}`);
    const open = str(f, `open_${d}`);
    const close = str(f, `close_${d}`);
    if (!closed && (!isTime(open) || !isTime(close))) throw new Error("Each open day needs an opening and closing time.");
    return { branch_id: branchId, weekday: d, closed, open_time: closed ? null : open, close_time: closed ? null : close };
  });
  return mutate({ entity: "opening_hours", action: "update", summary: `Updated weekly hours (${str(f, "branch_name")})`, entityId: branchId }, async (db) => {
    check(await db.from("opening_hours").upsert(rows, { onConflict: "branch_id,weekday" }));
    if (bool(f, "mark_reviewed")) {
      // Only the owner can edit branch rows; staff simply leave the flag.
      await db.from("branches").update({ needs_review: false, review_note: null }).eq("id", branchId);
    }
  });
}

export async function addClosure(_: State, f: FormData): Promise<ActionResult> {
  const date = str(f, "date");
  const name = str(f, "name");
  const closed = str(f, "mode") !== "special";
  const open = str(f, "open_time");
  const close = str(f, "close_time");
  if (!isDate(date) || !name) return { ok: false, error: "Pick a date and give it a name (e.g. Genna)." };
  if (!closed && (!isTime(open) || !isTime(close))) return { ok: false, error: "Enter special opening and closing times." };
  const branchId = str(f, "branch_id");
  return mutate({ entity: "special_closure", action: "create", summary: `${closed ? "Closed" : "Special hours"} on ${date}: ${name}` }, async (db) => {
    check(
      await db.from("special_closures").insert({
        date,
        name,
        name_am: opt(f, "name_am"),
        branch_id: isUuid(branchId) ? branchId : null,
        closed,
        open_time: closed ? null : open,
        close_time: closed ? null : close,
      }),
    );
  });
}

export async function deleteClosure(id: string): Promise<ActionResult> {
  return mutate({ entity: "special_closure", action: "delete", summary: `Removed a holiday closure`, entityId: id }, async (db) => {
    check(await db.from("special_closures").delete().eq("id", id));
  });
}

/** Dashboard quick action: today normal / closed / special hours for one branch. */
export async function setToday(_: State, f: FormData): Promise<ActionResult> {
  const branchId = str(f, "branch_id");
  const mode = str(f, "mode"); // normal | closed | special
  const tz = str(f, "tz") || "Africa/Addis_Ababa";
  const { date } = getZonedNow(tz);
  if (!isUuid(branchId)) return { ok: false, error: "Unknown branch." };
  return mutate({ entity: "special_closure", action: "update", summary: `Today (${date}) at ${str(f, "branch_name")}: ${mode}` }, async (db) => {
    check(await db.from("special_closures").delete().eq("branch_id", branchId).eq("date", date));
    if (mode === "closed") check(await db.from("special_closures").insert({ branch_id: branchId, date, name: opt(f, "reason") ?? "Closed today", closed: true }));
    if (mode === "special") {
      const open = str(f, "open_time");
      const close = str(f, "close_time");
      if (!isTime(open) || !isTime(close)) throw new Error("Enter today's opening and closing time.");
      check(await db.from("special_closures").insert({ branch_id: branchId, date, name: "Special hours today", closed: false, open_time: open, close_time: close }));
    }
  });
}

/* ============================== EVENTS ============================== */

export async function saveEvent(_: State, f: FormData): Promise<ActionResult> {
  const id = str(f, "id");
  const title = str(f, "title");
  const recurrence = str(f, "recurrence") === "once" ? "once" : "weekly";
  if (!title) return { ok: false, error: "Title is required." };
  const weekday = num(f, "weekday");
  const date = str(f, "event_date");
  if (recurrence === "weekly" && (weekday === null || weekday < 0 || weekday > 6)) return { ok: false, error: "Choose the day of the week." };
  if (recurrence === "once" && !isDate(date)) return { ok: false, error: "Choose the date." };
  return mutate({ entity: "event", action: id ? "update" : "create", summary: `${id ? "Edited" : "Added"} event "${title}"`, entityId: id || undefined }, async (db) => {
    const branch = str(f, "branch_id");
    const row: Record<string, unknown> = {
      title,
      title_am: opt(f, "title_am"),
      description: opt(f, "description"),
      description_am: opt(f, "description_am"),
      branch_id: isUuid(branch) ? branch : null,
      recurrence,
      weekday: recurrence === "weekly" ? weekday : null,
      event_date: recurrence === "once" ? date : null,
      start_time: isTime(str(f, "start_time")) ? str(f, "start_time") : null,
      end_time: isTime(str(f, "end_time")) ? str(f, "end_time") : null,
      is_published: bool(f, "is_published"),
    };
    if (bool(f, "mark_reviewed")) Object.assign(row, { needs_review: false, review_note: null });
    const photo = await maybeUpload(db, f, "event");
    if (photo) Object.assign(row, { photo_url: photo.url, photo_blur: photo.blur });
    if (id) return check(await db.from("events").update(row).eq("id", id).select("id").single());
    return check(await db.from("events").insert({ ...row, sort: 99 }).select("id").single());
  });
}

export async function deleteEvent(id: string): Promise<ActionResult> {
  return mutate({ entity: "event", action: "delete", summary: `Deleted an event`, entityId: id }, async (db) => {
    check(await db.from("events").delete().eq("id", id));
  });
}

/* ============================== GALLERY ============================== */

export async function uploadGallery(_: State, f: FormData): Promise<ActionResult> {
  const files = f.getAll("photos").filter((x): x is File => x instanceof File && x.size > 0);
  if (!files.length) return { ok: false, error: "Choose one or more photos." };
  if (files.length > 10) return { ok: false, error: "Upload up to 10 photos at a time." };
  const alt = str(f, "alt") || "Photo from Mama's Kitchen";
  return mutate({ entity: "gallery", action: "create", summary: `Uploaded ${files.length} gallery photo(s)` }, async (db) => {
    const { count } = await db.from("gallery_images").select("id", { count: "exact", head: true });
    for (const [i, file] of files.entries()) {
      const p = await uploadPhoto(db, file, "gallery");
      check(await db.from("gallery_images").insert({ url: p.url, blur: p.blur, width: p.width, height: p.height, alt, alt_am: opt(f, "alt_am"), source_status: "UPLOAD", sort: (count ?? 0) + i }));
    }
  });
}

export async function saveGalleryAlt(_: State, f: FormData): Promise<ActionResult> {
  const id = str(f, "id");
  return mutate({ entity: "gallery", action: "update", summary: "Edited a gallery caption", entityId: id }, async (db) => {
    check(await db.from("gallery_images").update({ alt: str(f, "alt"), alt_am: opt(f, "alt_am") }).eq("id", id));
  });
}

export async function deleteGallery(id: string): Promise<ActionResult> {
  return mutate({ entity: "gallery", action: "delete", summary: "Deleted a gallery photo", entityId: id }, async (db) => {
    check(await db.from("gallery_images").delete().eq("id", id));
  });
}

/* ============================== REVIEWS & ANNOUNCEMENTS ============================== */

export async function saveReview(_: State, f: FormData): Promise<ActionResult> {
  const id = str(f, "id");
  const name = str(f, "name");
  const text = str(f, "text");
  if (!name || !text) return { ok: false, error: "Name and review text are required." };
  if (!bool(f, "is_sample") && !bool(f, "permission")) return { ok: false, error: "Confirm the guest gave permission to publish their review." };
  return mutate({ role: "OWNER", entity: "testimonial", action: id ? "update" : "create", summary: `${id ? "Edited" : "Added"} review by ${name}` }, async (db) => {
    const row = { name, text, text_am: opt(f, "text_am"), rating: Math.min(5, Math.max(1, num(f, "rating") ?? 5)), is_sample: bool(f, "is_sample"), source: opt(f, "source"), is_published: bool(f, "is_published") };
    if (id) return check(await db.from("testimonials").update(row).eq("id", id));
    return check(await db.from("testimonials").insert({ ...row, sort: 99 }));
  });
}

export async function deleteReview(id: string): Promise<ActionResult> {
  return mutate({ role: "OWNER", entity: "testimonial", action: "delete", summary: "Deleted a review", entityId: id }, async (db) => {
    check(await db.from("testimonials").delete().eq("id", id));
  });
}

export async function saveAnnouncement(_: State, f: FormData): Promise<ActionResult> {
  const id = str(f, "id");
  const text = str(f, "text");
  const active = bool(f, "is_active");
  if (active && !text) return { ok: false, error: "Write the announcement text." };
  return mutate({ entity: "announcement", action: "update", summary: active ? `Announcement on: "${text.slice(0, 60)}"` : "Announcement turned off" }, async (db) => {
    const row = { text: text || "(empty)", text_am: opt(f, "text_am"), link: opt(f, "link"), is_active: active, ends_at: opt(f, "ends_at") ? new Date(`${str(f, "ends_at")}T23:59:00+03:00`).toISOString() : null };
    if (active) await db.from("announcements").update({ is_active: false }).neq("id", isUuid(id) ? id : "00000000-0000-0000-0000-000000000000");
    if (isUuid(id)) return check(await db.from("announcements").update(row).eq("id", id));
    return check(await db.from("announcements").insert(row));
  });
}

/* ============================== SETTINGS ============================== */

/** Saves one settings section (general / contact / seo / features / sections). Owner only. */
export async function saveSettings(_: State, f: FormData): Promise<ActionResult> {
  const section = str(f, "section");
  return mutate({ role: "OWNER", entity: "settings", action: "update", summary: `Updated settings: ${section}` }, async (db) => {
    const current = check(await db.from("restaurant_settings").select("*").eq("id", 1).single()) as Record<string, any>;
    let patch: Record<string, unknown> = {};
    if (section === "general") {
      patch = {
        name: str(f, "name") || current.name,
        name_am: opt(f, "name_am"),
        tagline: opt(f, "tagline"),
        tagline_am: opt(f, "tagline_am"),
        story: opt(f, "story"),
        story_am: opt(f, "story_am"),
        hero_image_alt: opt(f, "hero_image_alt"),
        hero_image_alt_am: opt(f, "hero_image_alt_am"),
        about_image_alt: opt(f, "about_image_alt"),
        about_image_alt_am: opt(f, "about_image_alt_am"),
      };
      const hero = await maybeUpload(db, f, "hero", "hero_photo");
      if (hero) Object.assign(patch, { hero_image: hero.url, hero_blur: hero.blur });
      const about = await maybeUpload(db, f, "section", "about_photo");
      if (about) Object.assign(patch, { about_image: about.url, about_blur: about.blur });
    } else if (section === "contact") {
      patch = {
        contact: { phones: lines(f, "phones"), whatsapp: str(f, "whatsapp"), telegram: str(f, "telegram").replace(/^@/, ""), email: str(f, "email") },
        socials: { facebook: str(f, "facebook"), instagram: str(f, "instagram"), tiktok: str(f, "tiktok"), youtube: str(f, "youtube") },
      };
    } else if (section === "seo") {
      patch = { seo: { siteUrl: str(f, "siteUrl"), title: str(f, "title"), description: str(f, "description"), keywords: lines(f, "keywords") } };
    } else if (section === "features") {
      patch = {
        features: Object.fromEntries(["events", "gallery", "reviews", "catering", "inn", "announcements", "booking", "orders", "darkMode"].map((k) => [k, bool(f, k)])),
        fonts: { heading: ["nunito", "fraunces", "playfair"].includes(str(f, "heading")) ? str(f, "heading") : "nunito" },
      };
    } else if (section === "catering" || section === "inn") {
      const prev = current.sections?.[section] ?? {};
      const next: Record<string, unknown> = { ...prev, title: str(f, "title"), title_am: opt(f, "title_am"), text: str(f, "text"), text_am: opt(f, "text_am") };
      if (section === "catering") Object.assign(next, { points: lines(f, "points"), points_am: lines(f, "points_am") });
      if (section === "inn") Object.assign(next, { locations: str(f, "locations"), locations_am: opt(f, "locations_am") });
      const photo = await maybeUpload(db, f, "section");
      if (photo) Object.assign(next, { image: photo.url, blur: photo.blur });
      patch = { sections: { ...current.sections, [section]: next } };
    } else if (section === "highlights") {
      const highlights = await Promise.all(
        (current.highlights ?? []).map(async (h: Record<string, string>, i: number) => {
          const photo = await maybeUpload(db, f, "highlight", `photo_${i}`);
          return { ...h, title: str(f, `title_${i}`) || h.title, title_am: opt(f, `title_am_${i}`), text: opt(f, `text_${i}`), text_am: opt(f, `text_am_${i}`), href: str(f, `href_${i}`) || h.href, ...(photo ? { image: photo.url, blur: photo.blur } : {}) };
        }),
      );
      patch = { highlights };
    } else throw new Error("Unknown settings section");
    check(await db.from("restaurant_settings").update(patch).eq("id", 1));
  });
}

/**
 * Logo upload step 1: store the logo and extract a palette from it.
 * Nothing on the website changes until the owner clicks "Apply".
 */
export async function previewLogo(_: State, f: FormData): Promise<ActionResult> {
  const admin = await getAdmin();
  if (admin?.role !== "OWNER") return { ok: false, error: "Only the owner can change the logo." };
  const file = f.get("logo");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose a logo file (PNG, JPG or WebP)." };
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) return { ok: false, error: "Logo must be PNG, JPG or WebP (SVG: convert to PNG first)." };
  if (file.size > 5 * 1024 * 1024) return { ok: false, error: "Logo file is too large (max 5 MB)." };
  try {
    const input = Buffer.from(await file.arrayBuffer());
    const png = await sharp(input).resize(600, 600, { fit: "inside", withoutEnlargement: true }).png().toBuffer();
    const { data: px } = await sharp(png).resize(200, 200, { fit: "inside" }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const result = tokensFromSwatches(extractSwatches(px));
    const { userClient } = await import("@/lib/supabase/server");
    const db = await userClient();
    const path = `logo/${crypto.randomUUID()}.png`;
    const up = await db.storage.from("media").upload(path, png, { contentType: "image/png", cacheControl: "31536000" });
    if (up.error) return { ok: false, error: up.error.message };
    const url = db.storage.from("media").getPublicUrl(path).data.publicUrl;
    return { ok: true, data: { url, ...result } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not read that image." };
  }
}

/** Logo upload step 2 (or manual color edits): save logo + tokens after checking contrast. */
export async function applyBranding(input: { logo_url?: string; tokens: DesignTokens; palette?: unknown }): Promise<ActionResult> {
  const hex = /^#[0-9A-Fa-f]{6}$/;
  if (!Object.values(input.tokens).every((v) => hex.test(v))) return { ok: false, error: "Colors must be 6-digit hex values like #DB1C2C." };
  const failing = checkTokens(input.tokens).filter((c) => !c.pass);
  if (failing.length) return { ok: false, error: `Contrast too low: ${failing.map((c) => `${c.pair} (${c.ratio}:1)`).join(", ")}` };
  return mutate({ role: "OWNER", entity: "settings", action: "update", summary: input.logo_url ? "New logo + colors" : "Updated brand colors" }, async (db) => {
    const patch: Record<string, unknown> = { tokens: input.tokens };
    if (input.logo_url) patch.logo_url = input.logo_url;
    if (input.palette) patch.palette = input.palette;
    check(await db.from("restaurant_settings").update(patch).eq("id", 1));
  });
}

/* ============================== NEEDS REVIEW ============================== */

const REVIEWABLE = ["menu_items", "branches", "events"];

export async function markReviewed(table: string, id: string): Promise<ActionResult> {
  if (!REVIEWABLE.includes(table) || !isUuid(id)) return { ok: false, error: "Invalid request." };
  return mutate({ role: table === "branches" ? "OWNER" : undefined, entity: table, action: "confirm", summary: `Confirmed data (${table})`, entityId: id }, async (db) => {
    check(await db.from(table).update({ needs_review: false, review_note: null }).eq("id", id));
  });
}

export async function resolveSettingNote(note: string): Promise<ActionResult> {
  return mutate({ role: "OWNER", entity: "settings", action: "confirm", summary: `Confirmed: ${note.slice(0, 80)}` }, async (db) => {
    const cur = check(await db.from("restaurant_settings").select("needs_review").eq("id", 1).single()) as { needs_review: string[] };
    check(await db.from("restaurant_settings").update({ needs_review: cur.needs_review.filter((n) => n !== note) }).eq("id", 1));
  });
}

/* ============================== USERS (owner) ============================== */

/**
 * Invite by email (they get a link to set a password) or create directly with
 * a temporary password (handy when staff don't use email much).
 */
export async function inviteUser(_: State, f: FormData): Promise<ActionResult> {
  const email = str(f, "email").toLowerCase();
  const role = str(f, "role") === "OWNER" ? "OWNER" : "STAFF";
  const name = opt(f, "full_name");
  const temp = String(f.get("temp_password") ?? "");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: "Enter a valid email." };
  if (temp && temp.length < 10) return { ok: false, error: "Temporary password must be at least 10 characters." };
  return mutate({ role: "OWNER", entity: "admin_user", action: "invite", summary: `${temp ? "Created" : "Invited"} ${email} as ${role}` }, async () => {
    const svc = serviceClient(); // service key: server only
    const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3100";
    let userId: string;
    if (temp) {
      const { data, error } = await svc.auth.admin.createUser({ email, password: temp, email_confirm: true, user_metadata: { full_name: name } });
      if (error) throw new Error(error.message);
      userId = data.user.id;
    } else {
      const { data, error } = await svc.auth.admin.inviteUserByEmail(email, { redirectTo: `${site}/admin/set-password/`, data: { full_name: name } });
      if (error) throw new Error(error.message);
      userId = data.user.id;
    }
    const { error } = await svc.from("admin_users").upsert({ user_id: userId, email, full_name: name, role });
    if (error) throw new Error(error.message);
  });
}

export async function setRole(userId: string, role: Role): Promise<ActionResult> {
  return mutate({ role: "OWNER", entity: "admin_user", action: "update", summary: `Changed role to ${role}`, entityId: userId }, async (db, me) => {
    if (userId === me.userId && role !== "OWNER") throw new Error("You can't remove your own owner access.");
    check(await db.from("admin_users").update({ role }).eq("user_id", userId));
  });
}

export async function removeUser(userId: string): Promise<ActionResult> {
  return mutate({ role: "OWNER", entity: "admin_user", action: "delete", summary: `Removed admin access`, entityId: userId }, async (db, me) => {
    if (userId === me.userId) throw new Error("You can't remove yourself.");
    check(await db.from("admin_users").delete().eq("user_id", userId));
    await serviceClient().auth.admin.deleteUser(userId);
  });
}

/* ============================== BOOKINGS & ENQUIRIES ============================== */

const REQUEST_STATUS = ["new", "confirmed", "declined", "done"] as const;

export async function setRequestStatus(id: string, status: (typeof REQUEST_STATUS)[number], who = ""): Promise<ActionResult> {
  if (!isUuid(id) || !REQUEST_STATUS.includes(status)) return { ok: false, error: "Invalid request." };
  return mutate({ entity: "request", action: "update", summary: `Booking/enquiry from ${who || "guest"} marked ${status}`, entityId: id }, async (db, admin) => {
    check(await db.from("requests").update({ status, handled_by: admin.userId }).eq("id", id));
  });
}

export async function saveRequestNote(_: State, f: FormData): Promise<ActionResult> {
  const id = str(f, "id");
  if (!isUuid(id)) return { ok: false, error: "Invalid request." };
  return mutate({ entity: "request", action: "update", summary: "Added a note to a booking", entityId: id }, async (db) => {
    check(await db.from("requests").update({ admin_note: opt(f, "admin_note") }).eq("id", id));
  });
}

export async function deleteRequest(id: string): Promise<ActionResult> {
  if (!isUuid(id)) return { ok: false, error: "Invalid request." };
  return mutate({ role: "OWNER", entity: "request", action: "delete", summary: "Deleted a booking/enquiry", entityId: id }, async (db) => {
    check(await db.from("requests").delete().eq("id", id));
  });
}
