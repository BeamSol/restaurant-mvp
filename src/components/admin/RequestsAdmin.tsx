"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteRequest, saveRequestNote, setRequestStatus } from "@/app/admin/actions";
import { phoneHref, whatsappHref } from "@/lib/links";
import type { Branch, RequestRow, Role } from "@/lib/types";
import { ActionForm, ConfirmButton } from "./ui";
import { CalendarIcon, ClockIcon, MapPinIcon, PhoneIcon, UsersSmallIcon, WhatsAppIcon } from "../Icons";

const STATUS: Record<RequestRow["status"], { label: string; cls: string }> = {
  new: { label: "New", cls: "bg-primary text-on-primary" },
  confirmed: { label: "Confirmed", cls: "bg-green-600 text-white" },
  declined: { label: "Declined", cls: "bg-ink/70 text-bg" },
  done: { label: "Done", cls: "bg-border text-ink" },
};
const TABS = [
  ["open", "To do"],
  ["new", "New"],
  ["confirmed", "Confirmed"],
  ["all", "All"],
] as const;

export default function RequestsAdmin({ requests, branches, role }: { requests: RequestRow[]; branches: Pick<Branch, "id" | "name">[]; role: Role }) {
  const [tab, setTab] = useState<(typeof TABS)[number][0]>("open");
  const [kind, setKind] = useState<"all" | "table" | "catering">("all");
  const [pending, start] = useTransition();
  const router = useRouter();
  const list = useMemo(
    () =>
      requests.filter(
        (r) => (kind === "all" || r.kind === kind) && (tab === "all" || (tab === "open" ? r.status === "new" || r.status === "confirmed" : r.status === tab)),
      ),
    [requests, tab, kind],
  );
  const count = (k: string) => requests.filter((r) => (k === "open" ? r.status === "new" || r.status === "confirmed" : k === "all" ? true : r.status === k)).length;
  const set = (r: RequestRow, s: RequestRow["status"]) => start(async () => {
    await setRequestStatus(r.id, s, r.name);
    router.refresh();
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="tablist">
          {TABS.map(([k, label]) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className="chip">
              {label} <span className="text-[12px] opacity-60">{count(k)}</span>
            </button>
          ))}
        </div>
        <select value={kind} onChange={(e) => setKind(e.target.value as typeof kind)} className="field !h-10 !w-auto" aria-label="Type">
          <option value="all">Bookings + catering</option>
          <option value="table">Table bookings</option>
          <option value="catering">Catering enquiries</option>
        </select>
      </div>

      {list.length === 0 && (
        <div className="card p-10 text-center">
          <p className="h3">Nothing here</p>
          <p className="text-secondary mt-1">New bookings from the website will appear here (and as a red badge in the menu).</p>
        </div>
      )}

      <ul className={`grid gap-3 lg:grid-cols-2 ${pending ? "opacity-70" : ""}`}>
        {list.map((r) => {
          const branch = branches.find((b) => b.id === r.branch_id);
          const when = r.date ? new Date(`${r.date}T12:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }) : null;
          const reply =
            r.lang === "am"
              ? `ሰላም ${r.name}፣ ከማማስ ኪችን ነው። ${r.kind === "table" ? "የጠረጴዛ ጥያቄዎ" : "የምግብ ዝግጅት ጥያቄዎ"} ደርሶናል።`
              : `Hello ${r.name}, this is Mama's Kitchen about your ${r.kind === "table" ? "table booking" : "catering enquiry"}${when ? ` for ${when}` : ""}.`;
          return (
            <li key={r.id} className={`card p-4 sm:p-5 ${r.status === "new" ? "ring-2 ring-primary/40" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${STATUS[r.status].cls}`}>{STATUS[r.status].label}</span>
                    <span className="text-[12px] font-bold tracking-wide text-muted uppercase">{r.kind === "table" ? "Table" : "Catering"}</span>
                  </p>
                  <p className="mt-1.5 text-[17px] font-extrabold">{r.name}</p>
                  <a href={phoneHref(r.phone)} className="text-[14px] font-semibold text-primary hover:underline" dir="ltr">
                    {r.phone}
                  </a>
                </div>
                <p className="shrink-0 text-right text-[12px] text-muted">
                  {new Date(r.created_at).toLocaleString("en-GB", { timeZone: "Africa/Addis_Ababa", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[14px]">
                {when && (
                  <li className="flex items-center gap-1.5">
                    <CalendarIcon size={15} className="text-muted" /> {when}
                  </li>
                )}
                {r.time && (
                  <li className="flex items-center gap-1.5">
                    <ClockIcon size={15} className="text-muted" /> {r.time.slice(0, 5)}
                  </li>
                )}
                {r.guests && (
                  <li className="flex items-center gap-1.5">
                    <UsersSmallIcon size={15} className="text-muted" /> {r.guests} guests
                  </li>
                )}
                {branch && (
                  <li className="flex items-center gap-1.5">
                    <MapPinIcon size={15} className="text-muted" /> {branch.name}
                  </li>
                )}
              </ul>
              {r.event_type && <p className="mt-2 text-[14px] font-semibold">{r.event_type}</p>}
              {r.message && <p className="mt-2 rounded-[10px] bg-bg p-3 text-[14px]">“{r.message}”</p>}

              <div className="mt-4 flex flex-wrap gap-2">
                <a href={phoneHref(r.phone)} className="btn btn-secondary btn-sm">
                  <PhoneIcon size={16} /> Call
                </a>
                <a href={whatsappHref(r.phone, reply)} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                  <WhatsAppIcon size={16} /> WhatsApp
                </a>
                {r.status !== "confirmed" && (
                  <button type="button" onClick={() => set(r, "confirmed")} className="btn btn-primary btn-sm">
                    Confirm
                  </button>
                )}
                {r.status !== "done" && r.status !== "new" && (
                  <button type="button" onClick={() => set(r, "done")} className="btn btn-secondary btn-sm">
                    Mark done
                  </button>
                )}
                {r.status === "new" && (
                  <button type="button" onClick={() => set(r, "declined")} className="btn btn-ghost btn-sm !text-muted">
                    Decline
                  </button>
                )}
                {r.status !== "new" && (
                  <button type="button" onClick={() => set(r, "new")} className="btn btn-ghost btn-sm !text-muted">
                    Reopen
                  </button>
                )}
              </div>
              <details className="mt-3">
                <summary className="cursor-pointer text-[13px] font-semibold text-muted">{r.admin_note ? `Note: ${r.admin_note}` : "Add internal note"}</summary>
                <ActionForm action={saveRequestNote} submit="Save note" className="mt-2">
                  <input type="hidden" name="id" value={r.id} />
                  <textarea name="admin_note" defaultValue={r.admin_note ?? ""} rows={2} className="field" placeholder="e.g. Called, confirmed table 4 by the window" />
                </ActionForm>
                {role === "OWNER" && (
                  <ConfirmButton action={() => deleteRequest(r.id)} confirm={`Delete the request from ${r.name}?`}>
                    Delete
                  </ConfirmButton>
                )}
              </details>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
