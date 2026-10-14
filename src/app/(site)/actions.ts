"use server";

/**
 * Public form actions (table bookings, catering enquiries).
 * Spam protection: hidden honeypot field, field validation, and max 5
 * requests per visitor (hashed IP) per hour. Visitors can only INSERT
 * (Row Level Security); the admin sees requests in Admin → Bookings.
 */
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { publicClient } from "@/lib/supabase/public";
import { serviceClient } from "@/lib/supabase/service";
import { getZonedNow } from "@/lib/hours";
import { isDate, isTime, isUuid, str } from "@/lib/admin/form";

export type RequestState = { ok: true } | { ok: false; error: string; field?: string } | null;

const MAX_PER_HOUR = 5;

export async function sendRequest(_: RequestState, f: FormData): Promise<RequestState> {
  // Bots fill every field; humans never see this one.
  if (str(f, "company")) return { ok: true };

  const kind = str(f, "kind") === "catering" ? "catering" : "table";
  const name = str(f, "name");
  const phone = str(f, "phone");
  const date = str(f, "date");
  const time = str(f, "time");
  const guests = Number(str(f, "guests") || 0);
  const branch = str(f, "branch_id");
  const lang = str(f, "lang") === "am" ? "am" : "en";

  if (name.length < 2 || name.length > 80) return { ok: false, field: "name", error: lang === "am" ? "ስምዎን ያስገቡ።" : "Please enter your name." };
  if (!/^\+?[\d\s()-]{7,25}$/.test(phone)) return { ok: false, field: "phone", error: lang === "am" ? "ትክክለኛ ስልክ ቁጥር ያስገቡ።" : "Please enter a valid phone number." };
  const today = getZonedNow("Africa/Addis_Ababa").date;
  if (date && (!isDate(date) || date < today || date > addDays(today, 365)))
    return { ok: false, field: "date", error: lang === "am" ? "ትክክለኛ ቀን ይምረጡ።" : "Please choose a date from today on." };
  if (kind === "table") {
    if (!date) return { ok: false, field: "date", error: lang === "am" ? "ቀን ይምረጡ።" : "Please choose a date." };
    if (!isTime(time)) return { ok: false, field: "time", error: lang === "am" ? "ሰዓት ይምረጡ።" : "Please choose a time." };
    if (!(guests >= 1 && guests <= 50)) return { ok: false, field: "guests", error: lang === "am" ? "የሰው ብዛት 1–50።" : "Guests: 1 to 50 (call us for bigger groups)." };
  } else if (guests && !(guests >= 1 && guests <= 2000)) {
    return { ok: false, field: "guests", error: "Guests: 1 to 2000." };
  }

  // Rate limit per visitor (hashed IP: we never store the raw address)
  const h = await headers();
  const ip = (h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "unknown").trim();
  const ipHash = createHash("sha256").update(`${ip}|${process.env.REVALIDATE_SECRET ?? "mk"}`).digest("hex").slice(0, 32);
  const since = new Date(Date.now() - 3600_000).toISOString();
  const { count } = await serviceClient().from("requests").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", since);
  if ((count ?? 0) >= MAX_PER_HOUR) return { ok: false, error: lang === "am" ? "ብዙ ጥያቄዎች ተልከዋል። እባክዎ ይደውሉልን።" : "Too many requests from this device. Please call us instead." };

  // Insert as an anonymous visitor: RLS only allows creating new requests.
  const { error } = await publicClient()
    .from("requests")
    .insert({
      kind,
      name,
      phone,
      date: date || null,
      time: isTime(time) ? time : null,
      guests: guests || null,
      branch_id: isUuid(branch) ? branch : null,
      event_type: str(f, "event_type").slice(0, 60) || null,
      message: str(f, "message").slice(0, 1000) || null,
      lang,
      ip_hash: ipHash,
    });
  if (error) return { ok: false, error: lang === "am" ? "ችግር ተፈጥሯል። እባክዎ ይደውሉልን።" : "Something went wrong. Please call us instead." };
  return { ok: true };
}

function addDays(date: string, n: number) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
