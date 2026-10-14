"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";
import { phoneHref } from "@/lib/links";
import type { Branch, Closure, Settings } from "@/lib/types";
import Img from "./Img";
import { AnyOpenBadge } from "./OpenBadge";
import { ArrowRightIcon, MapPinIcon, MusicIcon, PhoneIcon } from "../Icons";

/** Full-bleed photo hero with a cinematic gradient, big headline and the key actions. */
export default function Hero({ settings, branches, closures }: { settings: Settings; branches: Branch[]; closures: Closure[] }) {
  const { t, pick, lang } = useI18n();
  const phone = settings.contact.phones?.[0];
  const book = settings.features.booking !== false;
  return (
    <section className="relative isolate flex min-h-[560px] h-[86svh] max-h-[860px] items-end overflow-hidden bg-[#140c0c] text-white">
      {settings.hero_image && (
        <Img
          src={settings.hero_image}
          alt={pick(settings.hero_image_alt, settings.hero_image_alt_am)}
          fill
          preload
          fetchPriority="high"
          sizes="100vw"
          quality={70}
          className="-z-20 object-cover object-[50%_72%]"
        />
      )}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(0,0,0,.55)_0%,rgba(0,0,0,.05)_30%,rgba(0,0,0,.2)_55%,rgba(10,5,5,.92)_100%)]" />
      <div className="absolute inset-0 -z-10 hidden bg-[radial-gradient(ellipse_at_15%_85%,rgba(0,0,0,.55),transparent_60%)] lg:block" />

      <div className="container-site pb-24 lg:pb-32">
        <div className="max-w-3xl animate-fade-up">
          <AnyOpenBadge branches={branches} closures={closures} timeZone={settings.timezone} />
          <h1 className="display mt-5 [text-shadow:0_2px_30px_rgba(0,0,0,.35)]">{pick(settings.name, settings.name_am)}</h1>
          <p className={`mt-4 max-w-xl text-white/88 ${lang === "am" ? "text-[17px]" : "text-[17px] lg:text-[20px]"}`}>{pick(settings.tagline, settings.tagline_am)}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/menu/" className="btn btn-light !h-12 px-6 !text-[15px]">
              {t("hero.viewMenu")} <ArrowRightIcon />
            </Link>
            {book && (
              <Link href="/#book" className="btn btn-primary !h-12 px-6 !text-[15px]">
                {t("hero.book")}
              </Link>
            )}
            {phone && (
              <a href={phoneHref(phone)} className="btn btn-glass !h-12 !w-12 !p-0 max-sm:!hidden" aria-label={`${t("hero.call")} ${phone}`}>
                <PhoneIcon />
              </a>
            )}
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[13px] font-medium text-white/80">
            <li className="flex items-center gap-2">
              <MapPinIcon size={16} className="text-primary-soft" /> {branches.length} {t("nav.branches").toLowerCase()} · {lang === "am" ? "አዲስ አበባ" : "Addis Ababa"}
            </li>
            {settings.features.events !== false && (
              <li className="flex items-center gap-2">
                <MusicIcon size={16} className="text-primary-soft" /> {t("nav.events")}
              </li>
            )}
            {phone && (
              <li className="flex items-center gap-2" dir="ltr">
                <PhoneIcon size={16} className="text-primary-soft" /> {phone}
              </li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
