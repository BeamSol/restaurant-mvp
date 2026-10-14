"use client";

import { useRouter } from "next/navigation";
import { deleteBranch, saveBranch } from "@/app/admin/actions";
import type { Branch } from "@/lib/types";
import { ActionForm, BiField, Checkbox, ConfirmButton, Field, PhotoInput } from "./ui";

export default function BranchForm({ branch }: { branch?: Omit<Branch, "hours"> }) {
  const router = useRouter();
  return (
    <>
      <ActionForm
        action={saveBranch}
        submit={branch ? "Save branch" : "Add branch"}
        className="card space-y-4 p-4 sm:p-5"
        onSuccess={(r) => {
          const id = (r as { data?: { id?: string } }).data?.id;
          if (!branch && id) router.replace(`/admin/branches/${id}/`);
        }}
      >
        <input type="hidden" name="id" value={branch?.id ?? ""} />
        {branch?.needs_review && (
          <div className="rounded-[8px] bg-amber-50 p-3 text-[14px] text-amber-950">
            <strong>Needs review:</strong> {branch.review_note}
            <Checkbox name="mark_reviewed" label="I checked this. Remove the “Needs review” mark when saving." />
          </div>
        )}
        <BiField name="name" label="Branch name" en={branch?.name} am={branch?.name_am} required />
        <BiField name="address" label="Address / landmark" en={branch?.address} am={branch?.address_am} required />
        <BiField name="description" label="Short description" en={branch?.description} am={branch?.description_am} textarea rows={2} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone numbers" hint="One per line, e.g. +251 911 222 097">
            <textarea name="phones" rows={2} defaultValue={branch?.phones.join("\n")} className="field" />
          </Field>
          <Field label="Type">
            <select name="kind" defaultValue={branch?.kind ?? "restaurant"} className="field">
              <option value="restaurant">Restaurant</option>
              <option value="lounge">Lounge / live music</option>
              <option value="catering">Catering (no dine-in)</option>
            </select>
          </Field>
        </div>
        <Field label="Google Maps search text" hint="What to search in Google Maps for this branch, e.g. “Mama's Kitchen 4 Kilo Addis Ababa”. Used for the map and the Directions button.">
          <input name="map_query" defaultValue={branch?.map_query ?? ""} className="field" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Latitude (optional)" hint="From Google Maps → right-click the pin">
            <input name="lat" inputMode="decimal" defaultValue={branch?.lat ?? ""} className="field" />
          </Field>
          <Field label="Longitude (optional)">
            <input name="lng" inputMode="decimal" defaultValue={branch?.lng ?? ""} className="field" />
          </Field>
        </div>
        <PhotoInput current={branch?.photo_url} label="Branch photo" hint="A photo of THIS branch (outside or inside). Cropped to 3:2 automatically." />
        <Field label="Photo description (for blind visitors and Google)">
          <input name="photo_alt" defaultValue={branch?.photo_alt ?? ""} className="field" />
        </Field>
        <Checkbox name="is_published" label="Show on website" defaultChecked={branch?.is_published ?? true} />
      </ActionForm>
      {branch && (
        <div className="mt-3">
          <ConfirmButton action={async () => { const r = await deleteBranch(branch.id); if (r.ok) router.push("/admin/branches/"); return r; }} confirm={`Delete branch "${branch.name}" and its hours? To hide it temporarily, untick “Show on website” instead.`}>
            Delete branch
          </ConfirmButton>
        </div>
      )}
    </>
  );
}
