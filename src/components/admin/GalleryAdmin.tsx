"use client";

import { deleteGallery, reorder, saveGalleryAlt, setPublished, uploadGallery } from "@/app/admin/actions";
import type { GalleryImage } from "@/lib/types";
import { ActionForm, BiField, ConfirmButton, Field, SortableList, Toggle } from "./ui";

export default function GalleryAdmin({ images }: { images: GalleryImage[] }) {
  return (
    <div className="space-y-4">
      <section className="card p-4">
        <h2 className="h3">Upload photos</h2>
        <ActionForm action={uploadGallery} submit="Upload" resetOnSuccess className="mt-2 space-y-3">
          <Field label="Photos (up to 10 at once)" hint="JPG/PNG/WebP, max 5 MB each. Resized to WebP automatically.">
            <input type="file" name="photos" multiple accept="image/jpeg,image/png,image/webp" required className="field !h-auto py-2" />
          </Field>
          <BiField name="alt" label="What's in the photo? (used for all uploaded photos; edit each one later)" />
        </ActionForm>
      </section>
      <section className="card p-4">
        <h2 className="h3 mb-1">Photos on the website</h2>
        <p className="text-secondary mb-2">Drag or use ↑↓ to reorder. “STOCK” photos are free sample photos: replace them with your own.</p>
        <SortableList
          items={images}
          onReorder={(ids) => reorder("gallery_images", ids)}
          render={(img) => (
            <div className="flex items-start gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="size-16 shrink-0 rounded-[6px] object-cover" loading="lazy" />
              <details className="min-w-0 flex-1">
                <summary className="cursor-pointer text-[14px]">
                  <span className="font-semibold">{img.alt}</span>{" "}
                  {img.source_status === "STOCK" && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-900">STOCK: replace</span>}
                </summary>
                <ActionForm action={saveGalleryAlt} className="mt-2">
                  <input type="hidden" name="id" value={img.id} />
                  <BiField name="alt" label="Description" en={img.alt} am={img.alt_am} />
                </ActionForm>
                <ConfirmButton action={() => deleteGallery(img.id)} confirm="Delete this photo from the gallery?">
                  Delete photo
                </ConfirmButton>
              </details>
              <Toggle checked={img.is_published} label="Show on website" onChange={(v) => setPublished("gallery_images", img.id, v)} />
            </div>
          )}
        />
      </section>
    </div>
  );
}
