import Image from "next/image";
import { getSiteData } from "@/lib/data";
import ThemeToggle from "../shared/ThemeToggle";

/** Split-screen card used by login / forgot / set-password pages. */
export default async function AuthCard({ title, children }: { title: string; children: React.ReactNode }) {
  const { settings } = await getSiteData();
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-band lg:block">
        {settings.hero_image && <Image src={settings.hero_image} alt="" fill sizes="50vw" className="object-cover opacity-80" priority />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white">
          <p className="eyebrow mb-3 !text-primary-soft">Admin</p>
          <p className="h2 max-w-md">Update your menu, hours and events in seconds.</p>
          <p className="mt-3 max-w-md text-white/75">Changes appear on the website right away, in English and Amharic.</p>
        </div>
      </div>
      <div className="relative flex items-center justify-center p-5">
        <ThemeToggle className="absolute top-4 right-4" />
        <div className="w-full max-w-sm animate-fade-up">
          {settings.logo_url && <Image src={settings.logo_url} alt={settings.name} width={84} height={56} className="h-14 w-auto" unoptimized />}
          <h1 className="h1 mt-6 !text-[30px]">{title}</h1>
          <p className="text-secondary mt-1">{settings.name} · website admin</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </main>
  );
}
