/**
 * Opening-hours logic: "Open now" badges, today's hours, holiday closures,
 * fasting days and Ethiopian holiday dates.
 *
 * All calculations use the RESTAURANT's time zone (Africa/Addis_Ababa), not
 * the visitor's. No runtime imports, so it's unit-tested with plain Node (`npm test`).
 */
import type { Closure, HoursRow } from "./types";

const DAY = 24 * 60;

/** "07:30" or "07:30:00" → 450. "24:00" means midnight at the end of the day. */
export function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

/** "07:30:00" → "07:30" */
export const hhmm = (time: string | null) => (time ? time.slice(0, 5) : "");

/** Weekday (0 = Sunday), minutes since midnight and the date, in the given time zone. */
export function getZonedNow(timeZone: string, now: Date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return {
    day,
    minutes: (Number(get("hour")) % 24) * 60 + Number(get("minute")),
    date: `${get("year")}-${get("month")}-${get("day")}`,
  };
}

function addDays(date: string, n: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export interface DayPlan {
  start: number;
  end: number; // may exceed 1440 when closing after midnight
  open: string;
  close: string;
}

/**
 * Hours for one calendar date: weekly hours, overridden by a holiday closure
 * or special hours for that date (branch-specific or "all branches").
 */
export function planFor(
  hours: HoursRow[],
  closures: Closure[],
  branchId: string,
  date: string,
  weekday: number,
): { plan: DayPlan | null; closure?: Closure } {
  const closure =
    closures.find((c) => c.date === date && c.branch_id === branchId) ?? closures.find((c) => c.date === date && c.branch_id === null);
  if (closure) {
    if (closure.closed || !closure.open_time || !closure.close_time) return { plan: null, closure };
    return { plan: toPlan(closure.open_time, closure.close_time), closure };
  }
  const row = hours.find((h) => h.weekday === weekday);
  if (!row || row.closed || !row.open_time || !row.close_time) return { plan: null };
  return { plan: toPlan(row.open_time, row.close_time) };
}

function toPlan(open: string, close: string): DayPlan {
  const start = toMinutes(open);
  let end = toMinutes(close);
  if (end <= start) end += DAY; // closes after midnight
  return { start, end, open: hhmm(open), close: hhmm(close) };
}

export type OpenStatus =
  | { isOpen: true; closesAt: string }
  | { isOpen: false; opensAt: string | null; opensDay: number | null; closedToday?: string };

/** Is the branch open right now, and when does that change? */
export function getOpenStatus(
  hours: HoursRow[],
  closures: Closure[],
  branchId: string,
  timeZone: string,
  now: Date = new Date(),
): OpenStatus {
  const { day, minutes, date } = getZonedNow(timeZone, now);

  // 1. Still inside YESTERDAY's late shift (e.g. open until 01:00)?
  const y = planFor(hours, closures, branchId, addDays(date, -1), (day + 6) % 7).plan;
  if (y && y.end > DAY && minutes < y.end - DAY) return { isOpen: true, closesAt: y.close };

  // 2. Inside today's hours?
  const today = planFor(hours, closures, branchId, date, day);
  if (today.plan && minutes >= today.plan.start && minutes < today.plan.end) return { isOpen: true, closesAt: today.plan.close };

  const closedToday = today.closure && !today.plan ? today.closure.name : undefined;

  // 3. Closed: when do we open next?
  if (today.plan && minutes < today.plan.start) return { isOpen: false, opensAt: today.plan.open, opensDay: null, closedToday };
  for (let i = 1; i <= 14; i++) {
    const next = planFor(hours, closures, branchId, addDays(date, i), (day + i) % 7).plan;
    if (next) return { isOpen: false, opensAt: next.open, opensDay: (day + i) % 7, closedToday };
  }
  return { isOpen: false, opensAt: null, opensDay: null, closedToday };
}

/** Today's plan for a branch (for "Today: 8:00 AM – 10:00 PM"). */
export function todayPlan(hours: HoursRow[], closures: Closure[], branchId: string, timeZone: string, now = new Date()) {
  const { day, date } = getZonedNow(timeZone, now);
  return planFor(hours, closures, branchId, date, day);
}

/** Wednesdays and Fridays are weekly fasting days (Ethiopian Orthodox). */
export function isFastingDay(timeZone: string, now: Date = new Date()): boolean {
  const { day } = getZonedNow(timeZone, now);
  return day === 3 || day === 5;
}

/** Groups consecutive days with identical hours: "Mon–Sat 08:00–22:00, Sun closed". Monday first. */
export function groupHours(hours: HoursRow[]) {
  const order = [1, 2, 3, 4, 5, 6, 0];
  const groups: { from: number; to: number; open: string; close: string; closed: boolean }[] = [];
  for (const d of order) {
    const h = hours.find((r) => r.weekday === d);
    const closed = !h || h.closed;
    const open = hhmm(h?.open_time ?? null);
    const close = hhmm(h?.close_time ?? null);
    const last = groups[groups.length - 1];
    if (last && last.closed === closed && (closed || (last.open === open && last.close === close))) last.to = d;
    else groups.push({ from: d, to: d, open, close, closed });
  }
  return groups;
}

/* ---------------- Ethiopian holidays (for closure presets) ---------------- */

/** Orthodox Easter (Fasika), Gregorian date, for years 1900–2099 (Meeus' Julian algorithm + 13 days). */
export function orthodoxEaster(year: number): string {
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const month = Math.floor((d + e + 114) / 31); // Julian month
  const day = ((d + e + 114) % 31) + 1;
  const julian = new Date(Date.UTC(year, month - 1, day));
  julian.setUTCDate(julian.getUTCDate() + 13); // Julian → Gregorian (1900–2099)
  return julian.toISOString().slice(0, 10);
}

/**
 * Fixed-date holidays in the Gregorian calendar (valid for most years; in the
 * year before an Ethiopian leap year Enkutatash/Meskel move one day later).
 */
export function holidayPresets(year: number) {
  const iso = (m: number, d: number) => `${year}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const fasika = orthodoxEaster(year);
  return [
    { key: "genna", name: "Genna (Ethiopian Christmas)", name_am: "ገና", date: iso(1, 7) },
    { key: "timket", name: "Timket (Epiphany)", name_am: "ጥምቀት", date: iso(1, 19) },
    { key: "adwa", name: "Adwa Victory Day", name_am: "የዓድዋ ድል በዓል", date: iso(3, 2) },
    { key: "siklet", name: "Siklet (Good Friday)", name_am: "ስቅለት", date: addDays(fasika, -2) },
    { key: "fasika", name: "Fasika (Easter)", name_am: "ፋሲካ", date: fasika },
    { key: "labour", name: "Labour Day", name_am: "የሠራተኞች ቀን", date: iso(5, 1) },
    { key: "enkutatash", name: "Enkutatash (New Year)", name_am: "እንቁጣጣሽ", date: iso(9, 11) },
    { key: "meskel", name: "Meskel", name_am: "መስቀል", date: iso(9, 27) },
  ].sort((x, y) => x.date.localeCompare(y.date));
}
