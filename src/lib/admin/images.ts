import "server-only";
import sharp from "sharp";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Output sizes per use. Photos are cropped to fill (cover); gallery keeps its shape. */
export const IMAGE_PRESETS = {
  menu: { width: 800, height: 600, fit: "cover" as const },
  branch: { width: 900, height: 600, fit: "cover" as const },
  event: { width: 800, height: 600, fit: "cover" as const },
  hero: { width: 1600, height: 900, fit: "cover" as const },
  section: { width: 1200, height: 800, fit: "cover" as const },
  highlight: { width: 800, height: 600, fit: "cover" as const },
  gallery: { width: 1600, height: 1600, fit: "inside" as const },
};
export type ImagePreset = keyof typeof IMAGE_PRESETS;

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/** Validates, auto-crops/resizes to WebP (≤ ~120 KB target), makes a blur placeholder, uploads to Storage. */
export async function uploadPhoto(db: SupabaseClient, file: File, preset: ImagePreset) {
  if (!ALLOWED.includes(file.type)) throw new Error("Please upload a JPG, PNG or WebP photo.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Photo is too large (max 5 MB).");
  const input = Buffer.from(await file.arrayBuffer());
  const meta = await sharp(input).metadata(); // throws if not a real image
  if (!meta.width || !meta.height) throw new Error("That file is not a readable image.");

  const p = IMAGE_PRESETS[preset];
  let quality = 76;
  let out: Buffer;
  do {
    out = await sharp(input)
      .rotate() // respect phone orientation
      .resize(p.width, p.height, { fit: p.fit, position: "attention", withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();
    quality -= 8;
  } while (out.length > (preset === "hero" ? 250 : 120) * 1024 && quality > 40);

  const tiny = await sharp(out).resize(16).webp({ quality: 40 }).toBuffer();
  const info = await sharp(out).metadata();
  const path = `${preset}/${crypto.randomUUID()}.webp`;
  const { error } = await db.storage.from("media").upload(path, out, { contentType: "image/webp", cacheControl: "31536000", upsert: false });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  const { data } = db.storage.from("media").getPublicUrl(path);
  return { url: data.publicUrl, blur: `data:image/webp;base64,${tiny.toString("base64")}`, width: info.width, height: info.height };
}

/** Returns the uploaded photo if the form contained one (field name `photo` by default). */
export async function maybeUpload(db: SupabaseClient, form: FormData, preset: ImagePreset, field = "photo") {
  const file = form.get(field);
  if (file instanceof File && file.size > 0) return uploadPhoto(db, file, preset);
  return null;
}
