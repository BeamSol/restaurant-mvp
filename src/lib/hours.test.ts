/**
 * Tests for opening-hours logic. Run with `npm test`.
 * Addis Ababa is UTC+3 all year (no daylight saving).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { getOpenStatus, getZonedNow, groupHours, holidayPresets, isFastingDay, orthodoxEaster, toMinutes } from "./hours.ts";
import type { Closure, HoursRow } from "./types";

const TZ = "Africa/Addis_Ababa";
const B = "branch-1";
const at = (iso: string) => new Date(`${iso}+03:00`); // local Addis time

// Mon–Thu 08–22, Fri 08–01 (after midnight), Sat 08–23, Sun closed
const week: HoursRow[] = [
  { branch_id: B, weekday: 1, open_time: "08:00:00", close_time: "22:00:00", closed: false },
  { branch_id: B, weekday: 2, open_time: "08:00:00", close_time: "22:00:00", closed: false },
  { branch_id: B, weekday: 3, open_time: "08:00:00", close_time: "22:00:00", closed: false },
  { branch_id: B, weekday: 4, open_time: "08:00:00", close_time: "22:00:00", closed: false },
  { branch_id: B, weekday: 5, open_time: "08:00:00", close_time: "01:00:00", closed: false },
  { branch_id: B, weekday: 6, open_time: "08:00:00", close_time: "23:00:00", closed: false },
  { branch_id: B, weekday: 0, open_time: null, close_time: null, closed: true },
];
const none: Closure[] = [];
const closure = (date: string, extra: Partial<Closure> = {}): Closure => ({
  id: "c", branch_id: null, date, name: "Genna", name_am: null, closed: true, open_time: null, close_time: null, ...extra,
});

// 2026-09-28 is a Monday
test("toMinutes", () => {
  assert.equal(toMinutes("07:30:00"), 450);
  assert.equal(toMinutes("24:00"), 1440);
});

test("uses the restaurant time zone", () => {
  assert.deepEqual(getZonedNow(TZ, new Date("2026-09-28T21:30:00Z")), { day: 2, minutes: 30, date: "2026-09-29" });
});

test("open / closed during a normal day", () => {
  assert.deepEqual(getOpenStatus(week, none, B, TZ, at("2026-09-28T12:00:00")), { isOpen: true, closesAt: "22:00" });
  assert.equal(getOpenStatus(week, none, B, TZ, at("2026-09-28T22:00:00")).isOpen, false);
  assert.deepEqual(getOpenStatus(week, none, B, TZ, at("2026-09-28T06:00:00")), { isOpen: false, opensAt: "08:00", opensDay: null, closedToday: undefined });
});

test("after-midnight hours carry into the next day", () => {
  assert.deepEqual(getOpenStatus(week, none, B, TZ, at("2026-10-03T00:30:00")), { isOpen: true, closesAt: "01:00" });
  assert.equal(getOpenStatus(week, none, B, TZ, at("2026-10-03T01:30:00")).isOpen, false);
});

test("closed day is skipped: Saturday night → opens Monday", () => {
  const s = getOpenStatus(week, none, B, TZ, at("2026-10-03T23:30:00"));
  assert.deepEqual(s, { isOpen: false, opensAt: "08:00", opensDay: 1, closedToday: undefined });
});

test("holiday closure (all branches) closes a normal day", () => {
  const s = getOpenStatus(week, [closure("2026-09-28")], B, TZ, at("2026-09-28T12:00:00"));
  assert.deepEqual(s, { isOpen: false, opensAt: "08:00", opensDay: 2, closedToday: "Genna" });
});

test("closure for ANOTHER branch does not apply", () => {
  const s = getOpenStatus(week, [closure("2026-09-28", { branch_id: "other" })], B, TZ, at("2026-09-28T12:00:00"));
  assert.equal(s.isOpen, true);
});

test("special hours on a date replace weekly hours", () => {
  const special = [closure("2026-09-28", { closed: false, open_time: "14:00:00", close_time: "18:00:00" })];
  assert.equal(getOpenStatus(week, special, B, TZ, at("2026-09-28T12:00:00")).isOpen, false);
  assert.deepEqual(getOpenStatus(week, special, B, TZ, at("2026-09-28T15:00:00")), { isOpen: true, closesAt: "18:00" });
});

test("fasting days are Wednesday and Friday", () => {
  assert.equal(isFastingDay(TZ, at("2026-09-30T10:00:00")), true);
  assert.equal(isFastingDay(TZ, at("2026-10-02T10:00:00")), true);
  assert.equal(isFastingDay(TZ, at("2026-10-01T10:00:00")), false);
});

test("groupHours", () => {
  assert.deepEqual(
    groupHours(week).map((g) => `${g.from}-${g.to}:${g.closed ? "closed" : `${g.open}-${g.close}`}`),
    ["1-4:08:00-22:00", "5-5:08:00-01:00", "6-6:08:00-23:00", "0-0:closed"],
  );
});

test("Orthodox Easter (Fasika) dates", () => {
  assert.equal(orthodoxEaster(2024), "2024-05-05");
  assert.equal(orthodoxEaster(2025), "2025-04-20");
  assert.equal(orthodoxEaster(2026), "2026-04-12");
  assert.equal(orthodoxEaster(2027), "2027-05-02");
});

test("holiday presets include Genna and Siklet", () => {
  const p = holidayPresets(2027);
  assert.equal(p.find((h) => h.key === "genna")?.date, "2027-01-07");
  assert.equal(p.find((h) => h.key === "siklet")?.date, "2027-04-30");
});
