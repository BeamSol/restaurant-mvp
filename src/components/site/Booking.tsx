"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { phoneHref } from "@/lib/links";
import type { Branch, Settings } from "@/lib/types";
import Img from "./Img";
import RequestForm from "./RequestForm";
import { CheckIcon, PhoneIcon } from "../Icons";

/** "Book a table" section: photo + perks on one side, the request form on the other. */
export default function Booking({ settings, branches, photo }: { settings: Settings; branches: Branch[]; photo?: { url: string; blur?: string | null } }) {
  const { t } = useI18n();
  const phone = settings.contact.phones?.[0];
  return (
    <section id="book" aria-labelledby="book-title" className="section">
      <div className="container-site">
        <div className="card grid overflow-hidden lg:grid-cols-[1fr_1.15fr]">
          <div className="relative min-h-[260px] overflow-hidden bg-band text-white lg:min-h-full">
            {photo && <Img src={photo.url} blur={photo.blur} alt="" fill sizes="(min-width:1024px) 520px, 100vw" className="object-cover opacity-70" />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
            <div className="relative flex h-full flex-col justify-end p-6 lg:p-10">
              <p className="eyebrow mb-3 !text-primary-soft">{t("booking.eyebrow")}</p>
              <h2 id="book-title" className="h2">
                {t("booking.title")}
              </h2>
              <p className="mt-3 max-w-md text-[15px] text-white/80">{t("booking.lead")}</p>
              <ul className="mt-5 space-y-2 text-[14px] text-white/85">
                {["perks1", "perks2", "perks3"].map((k) => (
                  <li key={k} className="flex items-center gap-2">
                    <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary text-on-primary">
                      <CheckIcon size={12} />
                    </span>
                    {t(`booking.${k}`)}
                  </li>
                ))}
              </ul>
              {phone && (
                <a href={phoneHref(phone)} className="btn btn-glass mt-6 w-fit" dir="ltr">
                  <PhoneIcon /> {phone}
                </a>
              )}
            </div>
          </div>
          <div className="p-5 sm:p-8 lg:p-10">
            <RequestForm kind="table" settings={settings} branches={branches} />
          </div>
        </div>
      </div>
    </section>
  );
}
