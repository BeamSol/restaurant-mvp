"use client";

import { useState } from "react";
import { addClosure, deleteClosure, saveHours } from "@/app/admin/actions";
import { holidayPresets } from "@/lib/hours";
import type { Branch, Closure, Role } from "@/lib/types";
import { ActionForm, Checkbox, ConfirmButton, Field } from "./ui";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const ORDER = [1, 2, 3, 4, 5, 6, 0];

export function WeeklyHours({ branch, role }: { branch: Branch; role: Role }) {
  const [closed, setClosed] = useState<Record<number, boolean>>(Object.fromEntries(branch.hours.map((h) => [h.weekday, h.closed])));
  return (
    <ActionForm action={saveHours} submit="Save hours" className="text-[14px]">
      <input type="hidden" name="branch_id" value={branch.id} />
      <input type="hidden" name="branch_name" value={branch.name} />
      <p className="text-secondary mb-2">Use the 24-hour clock in normal (international) time. Closing after midnight? Just enter e.g. 01:00.</p>
      <div className="divide-y divide-border">
        {ORDER.map((d) => {
          const h = branch.hours.find((x) => x.weekday === d);
          return (
            <div key={d} className="grid grid-cols-[88px_1fr] items-center gap-2 py-1.5 sm:grid-cols-[120px_auto_1fr]">
              <strong>{DAYS[d]}</strong>
              <label className="flex items-center gap-2 sm:order-last">
                <input type="checkbox" name={`closed_${d}`} checked={!!closed[d]} onChange={(e) => setClosed({ ...closed, [d]: e.target.checked })} className="size-5 accent-[var(--c-primary)]" />
                Closed
              </label>
              <span className={`col-span-2 flex items-center gap-2 sm:col-span-1 ${closed[d] ? "invisible" : ""}`}>
                <input type="time" name={`open_${d}`} defaultValue={h?.open_time?.slice(0, 5) ?? "08:00"} className="field !w-32" aria-label={`${DAYS[d]} opens`} />
                –
                <input type="time" name={`close_${d}`} defaultValue={h?.close_time?.slice(0, 5) ?? "22:00"} className="field !w-32" aria-label={`${DAYS[d]} closes`} />
              </span>
            </div>
          );
        })}
      </div>
      {branch.needs_review && role === "OWNER" && <Checkbox name="mark_reviewed" label="These hours are confirmed (remove “Needs review” from this branch)" />}
    </ActionForm>
  );
}

export function Closures({ closures, branches }: { closures: Closure[]; branches: Pick<Branch, "id" | "name">[] }) {
  const year = new Date().getFullYear();
  const presets = [...holidayPresets(year), ...holidayPresets(year + 1)].filter((p) => p.date >= new Date().toISOString().slice(0, 10)).slice(0, 8);
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [nameAm, setNameAm] = useState("");
  const [mode, setMode] = useState("closed");
  return (
    <div className="space-y-4">
      <div>
        <p className="label">Quick add an Ethiopian holiday</p>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.key + p.date}
              type="button"
              className="chip"
              onClick={() => {
                setDate(p.date);
                setName(p.name);
                setNameAm(p.name_am);
              }}
            >
              {p.name.split(" (")[0]} · {new Date(`${p.date}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            </button>
          ))}
        </div>
        <p className="mt-1 text-[12px] text-muted">Fasika and Siklet are calculated for each year. Eid dates depend on the moon: enter them manually.</p>
      </div>
      <ActionForm action={addClosure} submit="Add" resetOnSuccess className="rounded-[8px] border border-border p-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Date">
            <input type="date" name="date" value={date} onChange={(e) => setDate(e.target.value)} required className="field" />
          </Field>
          <Field label="Branch">
            <select name="branch_id" className="field">
              <option value="">All branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Name (English)">
            <input name="name" value={name} onChange={(e) => setName(e.target.value)} required className="field" placeholder="e.g. Genna" />
          </Field>
          <Field label="Name (አማርኛ)">
            <input name="name_am" value={nameAm} onChange={(e) => setNameAm(e.target.value)} lang="am" className="field" />
          </Field>
          <Field label="On that day we are">
            <select name="mode" value={mode} onChange={(e) => setMode(e.target.value)} className="field">
              <option value="closed">Closed</option>
              <option value="special">Open with special hours</option>
            </select>
          </Field>
          {mode === "special" && (
            <div className="flex items-end gap-2">
              <Field label="Opens">
                <input type="time" name="open_time" defaultValue="10:00" className="field" />
              </Field>
              <Field label="Closes">
                <input type="time" name="close_time" defaultValue="18:00" className="field" />
              </Field>
            </div>
          )}
        </div>
      </ActionForm>
      <ul className="divide-y divide-border">
        {closures.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-[14px]">
            <span>
              <strong>{new Date(`${c.date}T12:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</strong> · {c.name} ·{" "}
              {c.closed ? "Closed" : `${c.open_time?.slice(0, 5)}–${c.close_time?.slice(0, 5)}`} · {branches.find((b) => b.id === c.branch_id)?.name ?? "All branches"}
            </span>
            <ConfirmButton action={() => deleteClosure(c.id)} confirm="Remove this closure?">
              Remove
            </ConfirmButton>
          </li>
        ))}
        {!closures.length && <li className="text-secondary py-2">No upcoming closures.</li>}
      </ul>
    </div>
  );
}
