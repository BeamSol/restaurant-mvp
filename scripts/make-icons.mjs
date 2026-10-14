/**
 * App (PWA) icons from the logo: square PNGs on a white tile.
 *   node scripts/make-icons.mjs [path/to/logo.png]
 * "maskable" has extra padding so Android can crop it into a circle/squircle.
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const logo = process.argv[2] ?? "public/restaurant/logo.png";
await mkdir("public/icons", { recursive: true });

async function icon(size, file, { pad, bg = "#ffffff", radius = 0 }) {
  const inner = Math.round(size * (1 - pad * 2));
  const art = await sharp(logo).resize(inner, inner, { fit: "inside" }).toBuffer();
  const meta = await sharp(art).metadata();
  const mask = radius ? Buffer.from(`<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="#fff"/></svg>`) : null;
  let img = sharp({ create: { width: size, height: size, channels: 4, background: bg } }).composite([
    { input: art, left: Math.round((size - meta.width) / 2), top: Math.round((size - meta.height) / 2) },
    ...(mask ? [{ input: mask, blend: "dest-in" }] : []),
  ]);
  await img.png({ compressionLevel: 9, palette: true }).toFile(`public/icons/${file}`);
  console.log("✓", file);
}

await icon(192, "icon-192.png", { pad: 0.08 });
await icon(512, "icon-512.png", { pad: 0.08 });
await icon(512, "maskable-512.png", { pad: 0.2 }); // safe zone = inner 80%
await icon(180, "apple-touch-icon.png", { pad: 0.1 });
await icon(32, "favicon-32.png", { pad: 0.02 });
