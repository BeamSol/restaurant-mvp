import type { Metadata } from "next";
import { getSiteData } from "@/lib/data";
import OfflineContent from "@/components/pwa/OfflineContent";

export const metadata: Metadata = { title: "Offline", robots: { index: false } };

/** Shown by the service worker when there's no internet and the page isn't saved. */
export default async function OfflinePage() {
  const { settings } = await getSiteData();
  return <OfflineContent phones={settings.contact.phones ?? []} />;
}
