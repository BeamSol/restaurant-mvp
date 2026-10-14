"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { bulkPrice, deleteCategory, reorder, saveCategory, setAvailable, setFeatured } from "@/app/admin/actions";
import type { Category, MenuItem, Role } from "@/lib/types";
import { ActionForm, BiField, Checkbox, ConfirmButton, Field, ReviewBadge, SortableList, Toggle } from "./ui";
import { PlusIcon, StarIcon } from "../Icons";

export default function MenuManager({ categories, items, role }: { categories: Category[]; items: MenuItem[]; role: Role }) {
  const [active, setActive] = useState(categories[0]?.id ?? "");
  const [showSections, setShowSections] = useState(false);
  const router = useRouter();
  const owner = role === "OWNER";
  const cat = categories.find((c) => c.id === active);
  const catItems = items.filter((i) => i.category_id === active);

  return (
    <div className="space-y-4">
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="Menu sections">
        {categories.map((c) => (
          <button key={c.id} role="tab" aria-selected={c.id === active} onClick={() => setActive(c.id)} className="chip">
            {c.name} <span className="text-[12px] opacity-60">{items.filter((i) => i.category_id === c.id).length}</span>
          </button>
        ))}
      </div>

      {cat && (
        <section className="card p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h2 className="h3">
              {cat.name} {cat.name_am && <span className="text-muted">· {cat.name_am}</span>}
            </h2>
            <Link href={`/admin/menu/new/?category=${cat.id}`} className="btn btn-primary btn-sm">
              <PlusIcon size={16} /> Add dish
            </Link>
          </div>
          <p className="text-secondary mb-2">Drag (or use ↑↓) to change the order on the website. Switch off “Available” when a dish is sold out.</p>
          <SortableList
            items={catItems}
            onReorder={(ids) => reorder("menu_items", ids)}
            render={(i) => (
              <div className="flex items-center gap-3">
                <div className="size-11 shrink-0 overflow-hidden rounded-[6px] bg-bg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {i.photo_url && <img src={i.photo_url} alt="" className="size-full object-cover" loading="lazy" />}
                </div>
                <Link href={`/admin/menu/${i.id}/`} className="min-w-0 flex-1 hover:text-primary">
                  <span className="block truncate text-[14px] font-semibold">
                    {i.name} {!i.is_published && <span className="text-[12px] font-normal text-muted">(hidden)</span>}
                  </span>
                  <span className="flex flex-wrap items-center gap-2 text-[12px] text-muted">
                    {i.price === null ? "No price" : `ETB ${i.price}`}
                    {i.needs_review && <ReviewBadge note={i.review_note} />}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setFeatured(i.id, !i.is_featured, i.name).then(() => router.refresh())}
                  aria-label={i.is_featured ? "Remove from signature dishes" : "Add to signature dishes"}
                  aria-pressed={i.is_featured}
                  title="Signature dish (home page)"
                  className={`hidden size-10 items-center justify-center rounded-[8px] sm:inline-flex ${i.is_featured ? "text-primary" : "text-border hover:text-muted"}`}
                >
                  <StarIcon size={18} filled={i.is_featured} />
                </button>
                <Toggle checked={i.is_available} label={`${i.name} available`} onChange={(v) => setAvailable(i.id, v, i.name)} />
              </div>
            )}
          />
          {!catItems.length && <p className="text-secondary py-4">No dishes in this section yet.</p>}
        </section>
      )}

      {owner && (
        <>
          <section className="card p-4">
            <h2 className="h3">Change prices by %</h2>
            <p className="text-secondary">For price increases: every dish with a price gets the same % change, rounded. Dishes without a price are skipped.</p>
            <ActionForm action={bulkPrice} submit="Apply price change" className="mt-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Change (%)" hint="e.g. 10 = +10%, -5 = −5%">
                  <input name="percent" type="number" step="0.5" min="-50" max="200" required className="field" />
                </Field>
                <Field label="Which dishes">
                  <select name="category_id" className="field">
                    <option value="">Whole menu</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Round to">
                  <select name="round" className="field" defaultValue="5">
                    <option value="1">1 birr</option>
                    <option value="5">5 birr</option>
                    <option value="10">10 birr</option>
                  </select>
                </Field>
              </div>
            </ActionForm>
          </section>

          <section className="card p-4">
            <div className="flex items-center justify-between">
              <h2 className="h3">Menu sections</h2>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowSections((v) => !v)} aria-expanded={showSections}>
                {showSections ? "Close" : "Edit sections"}
              </button>
            </div>
            {showSections && (
              <div className="mt-3 space-y-4">
                <SortableList
                  items={categories}
                  onReorder={(ids) => reorder("menu_categories", ids)}
                  render={(c) => (
                    <details>
                      <summary className="cursor-pointer py-1 text-[14px] font-semibold">
                        {c.name} {!c.is_published && <span className="font-normal text-muted">(hidden)</span>}
                      </summary>
                      <ActionForm action={saveCategory} className="mt-2 space-y-2">
                        <input type="hidden" name="id" value={c.id} />
                        <BiField name="name" label="Section name" en={c.name} am={c.name_am} required />
                        <Checkbox name="is_published" label="Show on website" defaultChecked={c.is_published} />
                      </ActionForm>
                      <ConfirmButton action={() => deleteCategory(c.id)} confirm={`Delete section "${c.name}"? It must be empty.`}>
                        Delete section
                      </ConfirmButton>
                    </details>
                  )}
                />
                <details className="rounded-[8px] border border-dashed border-border p-3">
                  <summary className="cursor-pointer text-[14px] font-semibold text-primary">+ New section</summary>
                  <ActionForm action={saveCategory} className="mt-2 space-y-2" resetOnSuccess>
                    <BiField name="name" label="Section name" required />
                    <Checkbox name="is_published" label="Show on website" defaultChecked />
                  </ActionForm>
                </details>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
