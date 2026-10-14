import type { Metadata } from "next";
import { getSiteData } from "@/lib/data";
import MenuExplorer from "@/components/site/MenuExplorer";
import MenuHeading from "@/components/site/MenuHeading";

export async function generateMetadata(): Promise<Metadata> {
  const { settings, categories } = await getSiteData();
  return {
    title: "Menu",
    description: `${settings.name} menu with prices in ${settings.currency}: ${categories.map((c) => c.name).join(", ")}. Fasting (የጾም) dishes marked.`,
    alternates: { canonical: "/menu/" },
  };
}

export default async function MenuPage() {
  const { categories, items, branches, settings } = await getSiteData();
  return (
    <main id="main" className="container-site pt-24 pb-16 lg:pt-32 lg:pb-24">
      <MenuHeading sections={categories.length} dishes={items.length} />
      <MenuExplorer categories={categories} items={items} branches={branches} settings={settings} />
    </main>
  );
}
