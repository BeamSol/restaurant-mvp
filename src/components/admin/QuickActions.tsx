"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { saveAnnouncement, setAvailable, setToday } from "@/app/admin/actions";
import type { Announcement, Branch, Closure, MenuItem } from "@/lib/types";
import { ActionForm, BiField, Checkbox, Field, SubmitButton, Toggle } from "./ui";

/** Quick "sold out" switch for any dish. */
export function SoldOutQuick({ items }: { items: Pick<MenuItem, "id" | "name" | "name_am" | "is_available" | "is_featured">[] }) {
  const [q, setQ] = useState("");
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    const list = s ? items.filter((i) => `${i.name} ${i.name_am ?? ""}`.toLowerCase().includes(s)) : items.filter((i) => !i.is_available || i.is_featured);
    return list.slice(0, 8);
  }, [q, items]);
  const soldOut = items.filter((i) => !i.is_available).length;
  return (
    <section className="card p-4">
      <h2 className="h3">Sold out today</h2>
      <p className="text-secondary">{soldOut ? `${soldOut} dish(es) marked sold out.` : "Everything is available."} Search any dish to switch it.</p>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search dish… (e.g. tibs)" className="field mt-3" aria-label="Search dishes" />
      <ul className="mt-2 divide-y divide-border">
        {shown.map((i) => (
          <li key={i.id} className="flex min-h-11 items-center justify-between gap-3 py-1.5">
            <span className="min-w-0 truncate text-[14px]">{i.name}</span>
            <Toggle checked={i.is_available} label={`${i.name} available`} onLabel="Available" offLabel="Sold out" onChange={(v) => setAvailable(i.id, v, i.name)} />
          </li>
        ))}
        {!shown.length && <li className="text-secondary py-2">No dishes found.</li>}
      </ul>
      <Link href="/admin/menu/" className="btn btn-ghost btn-sm mt-1 -ml-2">
        Open full menu →
      </Link>
    </section>
  );
}

export function AnnouncementQuick({ current }: { current?: Announcement }) {
  return (
    <section className="card p-4">
      <h2 className="h3">Announcement bar</h2>
      <p className="text-secondary">A short message shown at the top of every page, e.g. a holiday closure or the fasting buffet.</p>
      <ActionForm action={saveAnnouncement} className="mt-3 space-y-3">
        <input type="hidden" name="id" value={current?.id ?? ""} />
        <BiField name="text" label="Message" en={current?.text === "(empty)" ? "" : current?.text} am={current?.text_am} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Link (optional)" hint="e.g. /menu/?filter=fasting">
            <input name="link" defaultValue={current?.link ?? ""} className="field" />
          </Field>
          <Field label="Hide after (optional)">
            <input type="date" name="ends_at" defaultValue={current?.ends_at?.slice(0, 10) ?? ""} className="field" />
          </Field>
        </div>
        <Checkbox name="is_active" label="Show on the website" defaultChecked={current?.is_active} />
      </ActionForm>
    </section>
  );
}

/** Today's hours per branch: normal / closed / special hours. */
export function TodayHours({ branches, closures, today, tz }: { branches: Pick<Branch, "id" | "name">[]; closures: Closure[]; today: string; tz: string }) {
  return (
    <section className="card p-4">
      <h2 className="h3">Today&apos;s hours</h2>
      <p className="text-secondary">Closing early or not opening today? Change it here; the website updates immediately.</p>
      <ul className="mt-3 divide-y divide-border">
        {branches.map((b) => {
          const c = closures.find((x) => x.branch_id === b.id && x.date === today);
          const mode = !c ? "normal" : c.closed ? "closed" : "special";
          return (
            <li key={b.id} className="py-2">
              <TodayRow branch={b} mode={mode} closure={c} tz={tz} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function TodayRow({ branch, mode, closure, tz }: { branch: Pick<Branch, "id" | "name">; mode: string; closure?: Closure; tz: string }) {
  const [m, setM] = useState(mode);
  return (
    <ActionForm action={setToday} submit={null} className="text-[14px]">
      <input type="hidden" name="branch_id" value={branch.id} />
      <input type="hidden" name="branch_name" value={branch.name} />
      <input type="hidden" name="tz" value={tz} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <strong>{branch.name}</strong>
        <span className="flex items-center gap-2">
          <select name="mode" value={m} onChange={(e) => setM(e.target.value)} className="field !w-auto" aria-label={`Today at ${branch.name}`}>
            <option value="normal">Normal hours</option>
            <option value="closed">Closed today</option>
            <option value="special">Special hours today</option>
          </select>
          <SubmitButton className="btn btn-secondary btn-sm">Update</SubmitButton>
        </span>
      </div>
      {m === "closed" && <input name="reason" placeholder="Reason (optional), e.g. Private event" defaultValue={closure?.name ?? ""} className="field mt-2" />}
      {m === "special" && (
        <div className="mt-2 flex items-center gap-2">
          <input type="time" name="open_time" defaultValue={closure?.open_time?.slice(0, 5) ?? "08:00"} className="field" aria-label="Opens" />
          <span>–</span>
          <input type="time" name="close_time" defaultValue={closure?.close_time?.slice(0, 5) ?? "18:00"} className="field" aria-label="Closes" />
        </div>
      )}
    </ActionForm>
  );
}
