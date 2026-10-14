/**
 * Display helpers for prices and times.
 */
import type { Lang } from "./types";

/** 350 → "ETB 350" (English) or "350 ብር" (Amharic). Null → null (show "Ask for price"). */
export function formatPrice(price: number | null, lang: Lang, currency = "ETB"): string | null {
  if (price === null || price === undefined) return null;
  const amount = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(price);
  if (currency === "ETB") return lang === "am" ? `${amount} ብር` : `ETB ${amount}`;
  return `${currency} ${amount}`;
}

/** "22:00" / "22:00:00" → "10:00 PM" (English) or "10:00 ከሰዓት" (Amharic). */
export function formatTime(time: string | null, lang: Lang): string {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const date = new Date(Date.UTC(2000, 0, 1, h % 24, m || 0));
  return new Intl.DateTimeFormat(lang === "am" ? "am-ET" : "en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(date);
}

/** Google Maps embed + directions links from a search text (no API key needed). */
export const mapEmbedUrl = (query: string) => `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
export const directionsUrl = (query: string) => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
