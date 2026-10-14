"use client";

import { deleteReview, reorder, saveReview } from "@/app/admin/actions";
import type { Testimonial } from "@/lib/types";
import { ActionForm, BiField, Checkbox, ConfirmButton, Field, SortableList } from "./ui";

function ReviewForm({ r }: { r?: Testimonial }) {
  return (
    <ActionForm action={saveReview} resetOnSuccess={!r} className="space-y-3">
      <input type="hidden" name="id" value={r?.id ?? ""} />
      <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
        <Field label="Guest name (first name is fine)">
          <input name="name" defaultValue={r?.name ?? ""} required className="field" />
        </Field>
        <Field label="Stars">
          <select name="rating" defaultValue={r?.rating ?? 5} className="field">
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </Field>
      </div>
      <BiField name="text" label="Review (keep it short)" en={r?.text} am={r?.text_am} textarea rows={2} required />
      <Field label="Where is it from?" hint="e.g. “Google review, March 2026” or “Told to our manager”">
        <input name="source" defaultValue={r?.source ?? ""} className="field" />
      </Field>
      <Checkbox name="permission" label="The guest agreed that we can publish this review" defaultChecked={!!r && !r.is_sample} />
      <Checkbox name="is_sample" label="This is a SAMPLE (shown with a “Sample review” label)" defaultChecked={r?.is_sample} />
      <Checkbox name="is_published" label="Show on website" defaultChecked={r?.is_published ?? true} />
    </ActionForm>
  );
}

export default function ReviewsAdmin({ reviews }: { reviews: Testimonial[] }) {
  return (
    <div className="space-y-4">
      <div className="rounded-[8px] bg-amber-50 p-3 text-[14px] text-amber-950">Only publish real reviews, with the guest&apos;s permission. Never write reviews yourself. The website shows the first 3.</div>
      <section className="card p-4">
        <SortableList
          items={reviews}
          onReorder={(ids) => reorder("testimonials", ids)}
          render={(r) => (
            <details>
              <summary className="cursor-pointer text-[14px]">
                <strong>{r.name}</strong> · {"★".repeat(r.rating)} {r.is_sample && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-900">SAMPLE</span>}{" "}
                {!r.is_published && <span className="text-muted">(hidden)</span>}
                <span className="text-secondary block truncate">{r.text}</span>
              </summary>
              <div className="mt-2">
                <ReviewForm r={r} />
                <ConfirmButton action={() => deleteReview(r.id)} confirm="Delete this review?">
                  Delete
                </ConfirmButton>
              </div>
            </details>
          )}
        />
      </section>
      <section className="card p-4">
        <h2 className="h3 mb-2">Add a real review</h2>
        <ReviewForm />
      </section>
    </div>
  );
}
