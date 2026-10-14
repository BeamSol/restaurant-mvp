"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";
import { phoneHref, whatsappHref } from "@/lib/links";
import type { Settings } from "@/lib/types";
import { CalendarIcon, ListIcon, PhoneIcon, WhatsAppIcon } from "../Icons";

/** Sticky bottom bar on phones/tablets: Menu · Book · WhatsApp · Call. */
export default function MobileBar({ settings }: { settings: Settings }) {
  const { t, pick } = useI18n();
  const phone = settings.contact.phones?.[0];
  const wa = settings.contact.whatsapp;
  const message = t("whatsapp.hello", { name: pick(settings.name, settings.name_am) });
  const item = "flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-bold transition-colors";
  return (
    <nav aria-label={t("nav.contact")} className="glass fixed inset-x-0 bottom-0 z-40 border-t border-border lg:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex h-[60px]">
        <Link href="/menu/" className={`${item} text-ink/80`}>
          <ListIcon size={20} />
          {t("nav.menu")}
        </Link>
        {settings.features.booking !== false && (
          <Link href="/#book" className={`${item} text-ink/80`}>
            <CalendarIcon size={20} />
            {t("nav.book")}
          </Link>
        )}
        {wa && (
          <a href={whatsappHref(wa, message)} target="_blank" rel="noopener noreferrer" className={`${item} text-[#177a41] dark:text-[#4ade80]`}>
            <WhatsAppIcon size={20} />
            {t("bar.whatsapp")}
          </a>
        )}
        {phone && (
          <a href={phoneHref(phone)} className={`${item} text-primary`}>
            <PhoneIcon size={20} />
            {t("bar.call")}
          </a>
        )}
      </div>
    </nav>
  );
}
