/**
 * Palette tests: whatever logo is uploaded, the generated tokens must pass
 * WCAG AA, and only LIGHTNESS may change (hue is preserved). Run: npm test
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { checkTokens, contrast, extractSwatches, hexToRgb, rgbToHsl, tokensFromSwatches } from "./palette.ts";

/** Fake RGBA pixels: `share` of each color. */
function pixels(colors: [string, number][], total = 2000): Uint8Array {
  const out: number[] = [];
  for (const [hex, share] of colors) {
    const [r, g, b] = hexToRgb(hex);
    for (let i = 0; i < Math.round(total * share); i++) out.push(r, g, b, 255);
  }
  return Uint8Array.from(out);
}

test("contrast ratio basics", () => {
  assert.equal(Math.round(contrast("#000000", "#FFFFFF")), 21);
  assert.equal(contrast("#777777", "#777777"), 1);
});

test("Mama's Kitchen logo (red + white): primary is the logo red, accent is a deep red", () => {
  const r = tokensFromSwatches(extractSwatches(pixels([["#E01D2D", 0.63], ["#FEFEFD", 0.33], ["#E98F96", 0.04]])));
  assert.ok(Math.abs(rgbToHsl(hexToRgb(r.tokens.primary)).h - rgbToHsl(hexToRgb("#E01D2D")).h) < 3, "primary keeps the logo hue");
  assert.ok(rgbToHsl(hexToRgb(r.tokens.accent)).l < 0.35, "accent is a deep shade (not the pink anti-aliasing)");
  assert.deepEqual(r.checks.filter((c) => !c.pass), []);
});

const logos: [string, [string, number][]][] = [
  ["teal + orange", [["#0E7C7B", 0.8], ["#F4A259", 0.2]]],
  ["yellow + black", [["#FFD400", 0.6], ["#111111", 0.4]]],
  ["light green only", [["#8BD17C", 1]]],
  ["navy + gold", [["#1B2A49", 0.7], ["#D4AF37", 0.3]]],
  ["pink + white", [["#FF6FB5", 0.5], ["#FFFFFF", 0.5]]],
  ["grey only (no color)", [["#888888", 1]]],
];

for (const [name, colors] of logos) {
  test(`any logo passes WCAG AA: ${name}`, () => {
    const r = tokensFromSwatches(extractSwatches(pixels(colors)));
    const failing = checkTokens(r.tokens).filter((c) => !c.pass);
    assert.deepEqual(failing, [], JSON.stringify(r.tokens));
  });
}

test("dark theme passes WCAG AA for every logo", async () => {
  const { darkTheme, checkTheme } = await import("./palette.ts");
  for (const [name, colors] of [["mama's red", [["#E01D2D", 0.7], ["#FFFFFF", 0.3]]], ...logos] as [string, [string, number][]][]) {
    const light = tokensFromSwatches(extractSwatches(pixels(colors))).tokens;
    const failing = checkTheme(darkTheme(light)).filter((c) => !c.pass);
    assert.deepEqual(failing, [], `${name}: ${JSON.stringify(darkTheme(light))}`);
  }
});
