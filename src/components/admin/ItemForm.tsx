"use client";

import { useRouter } from "next/navigation";
import { deleteItem, saveItem } from "@/app/admin/actions";
import { MENU_TAGS, type Branch, type Category, type MenuItem, type Role } from "@/lib/types";
import { ActionForm, BiField, Checkbox, ConfirmButton, Field, PhotoInput } from "./ui";

const TAG_LABEL: Record<string, string> = { fasting: "Fasting · የጾም (vegan)", vegetarian: "Vegetarian", spicy: "Spicy", popular: "Popular", new: "New" };

export default function ItemForm({ item, categories, branches, role, defaultCategory }: { item?: MenuItem; categories: Category[]; branches: Pick<Branch, "id" | "name">[]; role: Role; defaultCategory?: string }) {
  const router = useRouter();
  const owner = role === "OWNER";
  return (
    <>
      <ActionForm
        action={saveItem}
        submit={item ? "Save dish" : "Add dish"}
        className="card space-y-4 p-4 sm:p-5"
        onSuccess={(r) => {
          const id = (r as { data?: { id?: string } }).data?.id;
          if (!item && id) router.replace(`/admin/menu/${id}/`);
        }}
      >
        <input type="hidden" name="id" value={item?.id ?? ""} />
        {item?.needs_review && (
          <div className="rounded-[8px] bg-amber-50 p-3 text-[14px] text-amber-950">
            <strong>Needs review:</strong> {item.review_note}
            <Checkbox name="mark_reviewed" label="I checked this. Remove the “Needs review” mark when saving." />
          </div>
        )}
        <BiField name="name" label="Dish name" en={item?.name} am={item?.name_am} required />
        <BiField name="description" label="Short description" en={item?.description} am={item?.description_am} textarea rows={2} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Price (ETB)" hint={owner ? "Leave empty to show “Ask for price”." : "Only the owner can change prices."}>
            <input name="price" type="number" min="0" step="0.5" defaultValue={item?.price ?? ""} disabled={!owner} className="field disabled:opacity-60" />
          </Field>
          <Field label="Menu section">
            <select name="category_id" defaultValue={item?.category_id ?? defaultCategory} required className="field">
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <PhotoInput current={item?.photo_url} hint="Landscape photo works best. Cropped to 4:3 (800×600) WebP automatically." />
        {item?.photo_url && <Checkbox name="remove_photo" label="Remove current photo" />}
        <fieldset>
          <legend className="label">Labels</legend>
          <div className="grid gap-x-4 sm:grid-cols-3">
            {MENU_TAGS.map((t) => (
              <label key={t} className="flex min-h-10 items-center gap-2 text-[14px]">
                <input type="checkbox" name="tags" value={t} defaultChecked={item?.tags.includes(t)} className="size-5 accent-[var(--c-primary)]" />
                {TAG_LABEL[t]}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="label">Served at</legend>
          <p className="mb-1 text-[12px] text-muted">Tick nothing = all branches.</p>
          <div className="grid gap-x-4 sm:grid-cols-3">
            {branches.map((b) => (
              <label key={b.id} className="flex min-h-10 items-center gap-2 text-[14px]">
                <input type="checkbox" name="branch_ids" value={b.id} defaultChecked={item?.branch_ids.includes(b.id)} className="size-5 accent-[var(--c-primary)]" />
                {b.name}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-x-4 sm:grid-cols-3">
          <Checkbox name="is_available" label="Available (not sold out)" defaultChecked={item?.is_available ?? true} />
          <Checkbox name="is_featured" label="Signature dish (home page)" defaultChecked={item?.is_featured} />
          <Checkbox name="is_published" label="Show on website" defaultChecked={item?.is_published ?? true} />
        </div>
      </ActionForm>
      {item && owner && (
        <div className="mt-3">
          <ConfirmButton action={async () => { const r = await deleteItem(item.id); if (r.ok) router.push("/admin/menu/"); return r; }} confirm={`Delete "${item.name}" permanently? (To hide it for a while, untick “Show on website” instead.)`}>
            Delete dish
          </ConfirmButton>
        </div>
      )}
    </>
  );
}
