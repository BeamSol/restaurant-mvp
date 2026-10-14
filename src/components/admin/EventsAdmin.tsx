"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteEvent, reorder, saveEvent, setPublished } from "@/app/admin/actions";
import type { Branch, EventRow } from "@/lib/types";
import { ActionForm, BiField, Checkbox, ConfirmButton, Field, PhotoInput, ReviewBadge, SortableList, Toggle } from "./ui";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function EventList({ events }: { events: EventRow[] }) {
  return (
    <div className="card p-4">
      <SortableList
        items={events}
        onReorder={(ids) => reorder("events", ids)}
        render={(e) => (
          <div className="flex items-center gap-3">
            <div className="size-12 shrink-0 overflow-hidden rounded-[6px] bg-bg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {e.photo_url && <img src={e.photo_url} alt="" className="size-full object-cover" />}
            </div>
            <Link href={`/admin/events/${e.id}/`} className="min-w-0 flex-1 hover:text-primary">
              <span className="block truncate text-[14px] font-semibold">{e.title}</span>
              <span className="flex flex-wrap items-center gap-2 text-[12px] text-muted">
                {e.recurrence === "weekly" ? `Every ${DAYS[e.weekday ?? 0]}` : e.event_date}
                {e.start_time && ` · ${e.start_time.slice(0, 5)}`}
                {e.needs_review && <ReviewBadge note={e.review_note} />}
              </span>
            </Link>
            <Toggle checked={e.is_published} label={`Show ${e.title}`} onChange={(v) => setPublished("events", e.id, v)} />
          </div>
        )}
      />
      {!events.length && <p className="text-secondary">No events yet.</p>}
    </div>
  );
}

export function EventForm({ event, branches }: { event?: EventRow; branches: Pick<Branch, "id" | "name">[] }) {
  const router = useRouter();
  const [rec, setRec] = useState(event?.recurrence ?? "weekly");
  return (
    <>
      <ActionForm
        action={saveEvent}
        submit={event ? "Save event" : "Add event"}
        className="card space-y-4 p-4 sm:p-5"
        onSuccess={(r) => {
          const id = (r as { data?: { id?: string } }).data?.id;
          if (!event && id) router.replace(`/admin/events/${id}/`);
        }}
      >
        <input type="hidden" name="id" value={event?.id ?? ""} />
        {event?.needs_review && (
          <div className="rounded-[8px] bg-amber-50 p-3 text-[14px] text-amber-950">
            <strong>Needs review:</strong> {event.review_note}
            <Checkbox name="mark_reviewed" label="Confirmed: remove the “Needs review” mark when saving." />
          </div>
        )}
        <BiField name="title" label="Title" en={event?.title} am={event?.title_am} required />
        <BiField name="description" label="Short description" en={event?.description} am={event?.description_am} textarea rows={2} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="How often">
            <select name="recurrence" value={rec} onChange={(e) => setRec(e.target.value as "weekly" | "once")} className="field">
              <option value="weekly">Every week</option>
              <option value="once">One date only</option>
            </select>
          </Field>
          {rec === "weekly" ? (
            <Field label="Day">
              <select name="weekday" defaultValue={event?.weekday ?? 5} className="field">
                {DAYS.map((d, i) => (
                  <option key={d} value={i}>
                    {d}
                  </option>
                ))}
              </select>
            </Field>
          ) : (
            <Field label="Date">
              <input type="date" name="event_date" defaultValue={event?.event_date ?? ""} className="field" required />
            </Field>
          )}
          <Field label="Starts">
            <input type="time" name="start_time" defaultValue={event?.start_time?.slice(0, 5) ?? "20:00"} className="field" />
          </Field>
          <Field label="Ends (optional)">
            <input type="time" name="end_time" defaultValue={event?.end_time?.slice(0, 5) ?? ""} className="field" />
          </Field>
          <Field label="Where">
            <select name="branch_id" defaultValue={event?.branch_id ?? ""} className="field">
              <option value="">(no branch)</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <PhotoInput current={event?.photo_url} hint="Band, singer or crowd photo. Cropped to 4:3 automatically." />
        <Checkbox name="is_published" label="Show on website" defaultChecked={event?.is_published ?? true} />
      </ActionForm>
      {event && (
        <div className="mt-3">
          <ConfirmButton action={async () => { const r = await deleteEvent(event.id); if (r.ok) router.push("/admin/events/"); return r; }} confirm={`Delete "${event.title}"?`}>
            Delete event
          </ConfirmButton>
        </div>
      )}
    </>
  );
}
