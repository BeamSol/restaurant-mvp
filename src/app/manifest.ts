import type { MetadataRoute } from "next";
import { getSiteData } from "@/lib/data";

/** Web app manifest (makes the site installable as an app). Built from the database settings. */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { settings } = await getSiteData();
  return {
    id: "/",
    name: settings.name,
    short_name: settings.name.length > 12 ? settings.name.replace(/'s\b/, "s").split(" ").slice(0, 2).join(" ") : settings.name,
    description: settings.seo.description,
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: settings.tokens.background,
    theme_color: settings.tokens.primary,
    lang: "en",
    categories: ["food", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Menu", short_name: "Menu", url: "/menu/?source=pwa", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Book a table", short_name: "Book", url: "/?source=pwa#book", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
