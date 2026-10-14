/**
 * Prints the brand palette + design tokens extracted from the logo, with
 * WCAG contrast results.   npm run palette [-- path/to/logo.png]
 * The seed SQL uses these tokens; the admin re-runs the same code on upload.
 */
import sharp from "sharp";
import { extractSwatches, tokensFromSwatches } from "../src/lib/palette.ts";

const file = process.argv[2] ?? "public/restaurant/logo.png";
const { data } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const r = tokensFromSwatches(extractSwatches(data));
console.log(`Logo: ${file}\n\nSwatches (share of logo):`);
for (const s of r.swatches) console.log(`  ${s.hex}  ${(s.share * 100).toFixed(1).padStart(5)}%   hue ${s.hsl.h.toFixed(0)}°, sat ${(s.hsl.s * 100).toFixed(0)}%, light ${(s.hsl.l * 100).toFixed(0)}%`);
console.log("\nTokens:");
for (const [k, v] of Object.entries(r.tokens)) console.log(`  ${k.padEnd(14)} ${v}`);
if (r.notes.length) console.log("\nNotes:\n  - " + r.notes.join("\n  - "));
console.log("\nWCAG contrast:");
for (const c of r.checks) console.log(`  ${c.pass ? "PASS" : "FAIL"}  ${c.ratio.toFixed(2).padStart(5)}:1  (needs ${c.required})  ${c.pair}`);
console.log("\n" + JSON.stringify(r.tokens));
