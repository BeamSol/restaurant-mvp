/**
 * Fonts, self-hosted by next/font (no Google requests at runtime).
 * Heading font presets the owner can choose in Admin → Settings. Only the
 * chosen one is used on the page, so browsers only download that one.
 * Body text uses the phone's system font (fast, native look).
 */
import { Fraunces, Noto_Sans_Ethiopic, Nunito, Playfair_Display } from "next/font/google";

/** Rounded, friendly: matches the Mama's Kitchen logo lettering. */
const nunito = Nunito({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-nunito", display: "swap", preload: true });
/** Classic serif alternatives for other restaurants. */
const fraunces = Fraunces({ subsets: ["latin"], weight: ["700"], variable: "--font-fraunces", display: "swap", preload: false });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-playfair", display: "swap", preload: false });

export const ethiopic = Noto_Sans_Ethiopic({ subsets: ["ethiopic"], weight: ["400", "600", "700"], variable: "--font-ethiopic", display: "swap", preload: false });

/** `cssVar` must match the `variable` option above. */
export const HEADING_FONTS = {
  nunito: { label: "Nunito (rounded, friendly)", font: nunito, cssVar: "--font-nunito" },
  fraunces: { label: "Fraunces (elegant serif)", font: fraunces, cssVar: "--font-fraunces" },
  playfair: { label: "Playfair Display (classic serif)", font: playfair, cssVar: "--font-playfair" },
} as const;
export type HeadingFontKey = keyof typeof HEADING_FONTS;

export function headingFont(key: string | undefined) {
  return HEADING_FONTS[key as HeadingFontKey] ?? HEADING_FONTS.nunito;
}
