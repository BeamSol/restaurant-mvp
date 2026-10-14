import type { Metadata, Viewport } from "next";
import { getSiteData } from "@/lib/data";
import { darkTheme, lightTheme, type ThemeTokens } from "@/lib/palette";
import { ethiopic, headingFont } from "./fonts";
import "./globals.css";

// Pages render per request from CACHED data (see src/lib/data.ts), so the site
// builds without a database and admin edits show up within seconds.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getSiteData();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || settings.seo.siteUrl || "http://localhost:3000";
  return {
    metadataBase: new URL(siteUrl),
    title: { default: settings.seo.title || settings.name, template: `%s | ${settings.name}` },
    description: settings.seo.description,
    keywords: settings.seo.keywords,
    icons: {
      icon: [
        { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
        { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      ],
      apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
    },
    // Installed on an iPhone home screen: full-screen app with the restaurant name
    appleWebApp: { capable: true, title: settings.name, statusBarStyle: "default" },
    openGraph: {
      type: "website",
      siteName: settings.name,
      title: settings.seo.title || settings.name,
      description: settings.seo.description,
      locale: "en_US",
      alternateLocale: ["am_ET"],
      images: [{ url: "/restaurant/og.jpg", width: 1200, height: 630, alt: settings.name }],
    },
    twitter: { card: "summary_large_image" },
    formatDetection: { telephone: false },
  };
}

export async function generateViewport(): Promise<Viewport> {
  const { settings } = await getSiteData();
  const dark = darkTheme(settings.tokens);
  return {
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: settings.tokens.primary },
      { media: "(prefers-color-scheme: dark)", color: dark.background },
    ],
    width: "device-width",
    initialScale: 1,
  };
}

/** Design tokens → CSS variables. */
const cssVars = (t: ThemeTokens) =>
  [
    ["primary", t.primary],
    ["primary-strong", t.primaryStrong],
    ["accent", t.accent],
    ["bg", t.background],
    ["surface", t.surface],
    ["border", t.border],
    ["text", t.text],
    ["muted", t.muted],
    ["on-primary", t.onPrimary],
    ["band", t.band],
    ["on-band", t.onBand],
  ]
    .map(([k, v]) => `--c-${k}:${v};`)
    .join("");

/**
 * Chooses light/dark BEFORE the first paint (no white flash):
 * saved choice in localStorage ("light" | "dark" | "system"), default = phone setting.
 */
const themeScript = (enabled: boolean) =>
  enabled
    ? `(function(){try{var t=localStorage.getItem('theme')||'system';var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light'}catch(e){document.documentElement.dataset.theme='light'}})()`
    : `document.documentElement.dataset.theme='light'`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { settings } = await getSiteData();
  const heading = headingFont(settings.fonts?.heading);
  const darkEnabled = settings.features.darkMode !== false;
  const light = cssVars(lightTheme(settings.tokens));
  const dark = cssVars(darkTheme(settings.tokens));
  // Without JS the phone's own setting still applies (media query fallback).
  const css =
    `:root{${light}--font-heading:var(${heading.cssVar});}` +
    (darkEnabled ? `:root[data-theme="dark"]{${dark}}@media (prefers-color-scheme: dark){:root:not([data-theme]){${dark}}}` : "");

  return (
    <html lang="en" className={`${heading.font.variable} ${ethiopic.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript(darkEnabled) }} />
        <style dangerouslySetInnerHTML={{ __html: css }} />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
