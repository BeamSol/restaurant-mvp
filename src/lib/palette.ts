/**
 * Logo → brand palette → design tokens, with WCAG contrast checks.
 *
 * Used by `scripts/extract-palette.mjs` (initial seed) and by the admin
 * "upload logo" action (re-extracts a palette and shows a preview).
 *
 * Pure functions only (no sharp import here) so it runs anywhere and is
 * unit-tested with `npm test`. Callers pass raw RGBA pixels.
 */

export type RGB = [number, number, number];
export interface HSL {
  h: number; // 0–360
  s: number; // 0–1
  l: number; // 0–1
}

export interface DesignTokens {
  primary: string; // main logo color: buttons, links, highlights
  primaryStrong: string; // hover / pressed state of primary
  accent: string; // secondary logo color, used sparingly
  background: string; // page background (warm off-white)
  surface: string; // cards, inputs
  border: string; // hairlines, card borders
  text: string; // body text (near-black tinted toward primary)
  muted: string; // secondary text
  onPrimary: string; // text on primary buttons
}

export interface ContrastCheck {
  pair: string;
  foreground: string;
  background: string;
  ratio: number;
  required: number;
  pass: boolean;
}

/* ---------------- color math ---------------- */

export function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as RGB;
}

export function rgbToHex([r, g, b]: RGB): string {
  return "#" + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("").toUpperCase();
}

export function rgbToHsl([r, g, b]: RGB): HSL {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h *= 60;
  return { h, s, l };
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0) * 255, f(8) * 255, f(4) * 255];
}

const hsl = (h: number, s: number, l: number) => rgbToHex(hslToRgb({ h, s, l }));

/** WCAG relative luminance. */
export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio, 1–21. */
export function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

/**
 * Darkens (or lightens) a color by changing only its LIGHTNESS until it
 * reaches the required contrast against `against`. Hue and saturation stay.
 */
export function ensureContrast(color: string, against: string, required = 4.5): string {
  if (contrast(color, against) >= required) return color;
  const base = rgbToHsl(hexToRgb(color));
  const darken = luminance(against) > 0.18;
  for (let step = 1; step <= 100; step++) {
    const l = darken ? base.l - step * 0.01 : base.l + step * 0.01;
    if (l < 0 || l > 1) break;
    const candidate = hsl(base.h, base.s, l);
    if (contrast(candidate, against) >= required) return candidate;
  }
  return darken ? "#000000" : "#FFFFFF";
}

/* ---------------- palette extraction ---------------- */

export interface Swatch {
  hex: string;
  share: number; // fraction of opaque pixels
  hsl: HSL;
}

/**
 * K-means over the logo's opaque pixels. Returns swatches sorted by how
 * much of the logo they cover.
 */
export function extractSwatches(rgba: Uint8Array | Buffer, k = 6): Swatch[] {
  const pixels: RGB[] = [];
  for (let i = 0; i < rgba.length; i += 4) {
    if (rgba[i + 3] < 200) continue; // skip transparent/anti-aliased edges
    pixels.push([rgba[i], rgba[i + 1], rgba[i + 2]]);
  }
  if (pixels.length === 0) return [];

  // Deterministic start: spread initial centers across the sorted pixel list.
  const sorted = [...pixels].sort((a, b) => a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]));
  let centers: RGB[] = Array.from({ length: k }, (_, i) => sorted[Math.floor(((i + 0.5) / k) * sorted.length)]);
  let assign = new Array<number>(pixels.length).fill(0);

  for (let iter = 0; iter < 20; iter++) {
    assign = pixels.map((p) => {
      let best = 0;
      let bestD = Infinity;
      centers.forEach((c, ci) => {
        const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2;
        if (d < bestD) {
          bestD = d;
          best = ci;
        }
      });
      return best;
    });
    centers = centers.map((c, ci) => {
      const members = pixels.filter((_, pi) => assign[pi] === ci);
      if (!members.length) return c;
      return [0, 1, 2].map((ch) => members.reduce((s, m) => s + m[ch], 0) / members.length) as RGB;
    });
  }

  const counts = centers.map((_, ci) => assign.filter((a) => a === ci).length);
  const swatches = centers
    .map((c, ci) => ({ hex: rgbToHex(c), share: counts[ci] / pixels.length, hsl: rgbToHsl(c) }))
    .filter((s) => s.share > 0.005);

  // Merge near-duplicates (clusters that converged to almost the same color).
  const merged: Swatch[] = [];
  for (const s of swatches.sort((a, b) => b.share - a.share)) {
    const twin = merged.find((m) => contrast(m.hex, s.hex) < 1.15 && Math.abs(m.hsl.h - s.hsl.h) < 12);
    if (twin) twin.share += s.share;
    else merged.push({ ...s });
  }
  return merged.sort((a, b) => b.share - a.share);
}

const isChromatic = (s: Swatch) => s.hsl.s > 0.25 && s.hsl.l > 0.12 && s.hsl.l < 0.9;
const hueDistance = (a: number, b: number) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));

/* ---------------- tokens ---------------- */

export interface PaletteResult {
  swatches: Swatch[];
  tokens: DesignTokens;
  checks: ContrastCheck[];
  notes: string[];
}

/**
 * Builds design tokens from logo swatches:
 *  primary    = most common colorful logo color
 *  accent     = second, clearly different logo color, or, for one-color
 *               logos, a deep shade of the primary (same hue, darker)
 *  background = warm off-white in the primary's hue
 *  text       = near-black tinted toward the primary
 * Then every text/background pair is checked against WCAG AA and fixed by
 * adjusting lightness only.
 */
export function tokensFromSwatches(swatches: Swatch[]): PaletteResult {
  const notes: string[] = [];
  const chromatic = swatches.filter(isChromatic);
  const primarySwatch = chromatic[0];
  if (!primarySwatch) notes.push("Logo has no strong color; using a neutral fallback primary.");
  const P = primarySwatch?.hsl ?? { h: 20, s: 0.5, l: 0.35 };

  // A real second brand color must cover a meaningful part of the logo;
  // tiny clusters are just anti-aliasing at the edges of the primary.
  const accentSwatch = chromatic
    .slice(1)
    .find((s) => s.share >= 0.05 && (hueDistance(s.hsl.h, P.h) > 25 || Math.abs(s.hsl.l - P.l) > 0.2));
  let accent: string;
  if (accentSwatch) {
    accent = accentSwatch.hex;
  } else {
    // One-color logo (e.g. red + white): derive a deep shade of the same hue.
    accent = hsl(P.h, Math.min(0.75, P.s), 0.26);
    notes.push("Logo is effectively one color + white; accent derived as a deep shade of the primary (same hue).");
  }

  const background = hsl(P.h, 0.45, 0.975);
  const surface = "#FFFFFF";
  const border = hsl(P.h, 0.35, 0.9);
  const text = hsl(P.h, 0.3, 0.12);
  let primary = primarySwatch?.hex ?? hsl(P.h, P.s, P.l);
  let muted = hsl(P.h, 0.12, 0.38);

  // --- WCAG AA fixes (lightness only)
  // Primary is used for links (on the background) AND as a button color with
  // white text, so it must pass both. Bright logo colors (yellow, pink, light
  // green) get darkened; the hue stays the same.
  const onPrimary = "#FFFFFF";
  const fixedPrimary = ensureContrast(ensureContrast(primary, background, 4.5), onPrimary, 4.5);
  if (fixedPrimary !== primary) notes.push(`Primary darkened ${primary} → ${fixedPrimary} so links and white button text pass WCAG AA.`);
  primary = fixedPrimary;
  muted = ensureContrast(muted, background, 4.5);
  // The accent is used as a background behind white text (announcement bar),
  // so darken it (lightness only) until white text on it passes AA.
  accent = ensureContrast(accent, "#FFFFFF", 4.5);
  const primaryStrong = hsl(rgbToHsl(hexToRgb(primary)).h, rgbToHsl(hexToRgb(primary)).s, Math.max(0.15, rgbToHsl(hexToRgb(primary)).l - 0.08));

  const tokens: DesignTokens = { primary, primaryStrong, accent, background, surface, border, text, muted, onPrimary };
  return { swatches, tokens, checks: checkTokens(tokens), notes };
}

/** Every text/background pair the UI actually uses. */
export function checkTokens(t: DesignTokens): ContrastCheck[] {
  const pairs: [string, string, string, number][] = [
    ["text on background", t.text, t.background, 4.5],
    ["text on surface", t.text, t.surface, 4.5],
    ["muted on background", t.muted, t.background, 4.5],
    ["muted on surface", t.muted, t.surface, 4.5],
    ["primary (links) on background", t.primary, t.background, 4.5],
    ["primary (links) on surface", t.primary, t.surface, 4.5],
    ["button text on primary", t.onPrimary, t.primary, 4.5],
    ["button text on primary hover", t.onPrimary, t.primaryStrong, 4.5],
    ["background text on dark (footer)", t.background, t.text, 4.5],
    ["accent (large/decorative) on background", t.accent, t.background, 3],
    ["white on accent", "#FFFFFF", t.accent, 4.5],
  ];
  return pairs.map(([pair, fg, bg, required]) => {
    const ratio = Math.round(contrast(fg, bg) * 100) / 100;
    return { pair, foreground: fg, background: bg, ratio, required, pass: ratio >= required };
  });
}

/* ---------------- dark mode ---------------- */

export interface ThemeTokens extends DesignTokens {
  /** Background of dark "band" sections (events, footer) and its text color. */
  band: string;
  onBand: string;
}

/** Light theme: bands are the dark text color with light text on top. */
export function lightTheme(t: DesignTokens): ThemeTokens {
  return { ...t, band: t.text, onBand: t.background };
}

/**
 * Dark theme derived from the (light) brand tokens, same hue. The logo red is
 * too dark to read on near-black, so primary is lightened until links pass AA;
 * button text then switches to whichever of white / near-black is readable.
 */
export function darkTheme(t: DesignTokens): ThemeTokens {
  const P = rgbToHsl(hexToRgb(t.primary));
  const background = hsl(P.h, 0.16, 0.07);
  const surface = hsl(P.h, 0.14, 0.11);
  const border = hsl(P.h, 0.12, 0.2);
  const text = hsl(P.h, 0.2, 0.94);
  const muted = ensureContrast(hsl(P.h, 0.1, 0.66), surface, 4.5);
  const primary = ensureContrast(ensureContrast(t.primary, background, 4.6), surface, 4.6);
  const darkText = hsl(P.h, 0.3, 0.08);
  const onPrimary = contrast("#FFFFFF", primary) >= 4.5 ? "#FFFFFF" : darkText;
  const pl = rgbToHsl(hexToRgb(primary));
  // hover: a little lighter, kept readable with the button text
  let primaryStrong = hsl(pl.h, pl.s, Math.min(0.85, pl.l + 0.06));
  if (contrast(onPrimary, primaryStrong) < 4.5) primaryStrong = primary;
  const accent = t.accent; // deep shade; used behind white text
  return { primary, primaryStrong, accent, background, surface, border, text, muted, onPrimary, band: hsl(P.h, 0.18, 0.1), onBand: text };
}

/** Contrast checks for a full theme (adds the band pair). */
export function checkTheme(t: ThemeTokens): ContrastCheck[] {
  // The accent is only ever a BACKGROUND behind white text (announcement bar,
  // "New" badge), so its contrast as text on the page doesn't apply here.
  return checkTokens(t)
    .filter((c) => c.pair !== "background text on dark (footer)" && !c.pair.startsWith("accent (large"))
    .concat(
      [["text on band (events, footer)", t.onBand, t.band, 4.5] as const].map(([pair, fg, bg, required]) => {
        const ratio = Math.round(contrast(fg, bg) * 100) / 100;
        return { pair, foreground: fg, background: bg, ratio, required, pass: ratio >= required };
      }),
    );
}
