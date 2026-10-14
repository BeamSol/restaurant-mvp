"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { phoneHref } from "@/lib/links";
import type { Branch, Settings } from "@/lib/types";
import Img from "./Img";
import RequestForm from "./RequestForm";
import { CheckIcon, CloseIcon, PhoneIcon } from "../Icons";

/** Catering (with an enquiry form) + Mama's Inn: large photo blocks. */
export default function PhotoFeature({ settings, branches }: { settings: Settings; branches: Branch[] }) {
  const { t, pick, lang } = useI18n();
  const [form, setForm] = useState(false);
  const { catering, inn } = settings.sections;
  const phone = settings.contact.phones?.[0];
  const showCatering = settings.features.catering !== false && catering;
  const showInn = settings.features.inn !== false && inn;
  if (!showCatering && !showInn) return null;
  const points = (lang === "am" && catering?.points_am?.length ? catering.points_am : catering?.points) ?? [];

  return (
    <section id="catering" aria-label={t("catering.eyebrow")} className="section">
      <div className="container-site space-y-6 lg:space-y-8">
        {showCatering && (
          <article className="card grid overflow-hidden lg:grid-cols-2" data-reveal>
            <div className="img-zoom relative min-h-[240px] overflow-hidden bg-border lg:min-h-[440px]">
              <Img src={catering.image} blur={catering.blur} alt="" fill sizes="(min-width:1024px) 590px, 100vw" className="object-cover" />
            </div>
            <div className="flex flex-col justify-center p-6 lg:p-12">
              <p className="eyebrow mb-3">{t("catering.eyebrow")}</p>
              <h2 className="h2">{pick(catering.title, catering.title_am)}</h2>
              <p className="lead mt-3">{pick(catering.text, catering.text_am)}</p>
              {points.length > 0 && (
                <ul className="mt-5 grid gap-2">
                  {points.map((p) => (
                    <li key={p} className="flex items-center gap-2.5 text-[15px]">
                      <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-tint text-primary-strong dark:text-primary">
                        <CheckIcon size={12} />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
              )}
              {!form && (
                <div className="mt-7 flex flex-wrap gap-3">
                  {settings.features.booking !== false && (
                    <button type="button" onClick={() => setForm(true)} className="btn btn-primary">
                      {t("cateringForm.title")}
                    </button>
                  )}
                  {phone && (
                    <a href={phoneHref(phone)} className="btn btn-secondary">
                      <PhoneIcon /> {t("header.call")}
                    </a>
                  )}
                </div>
              )}
              {form && (
                <div className="mt-6 rounded-[14px] border border-border bg-bg p-4 animate-fade-up sm:p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="font-bold">{t("cateringForm.title")}</p>
                    <button type="button" onClick={() => setForm(false)} className="btn btn-ghost btn-icon btn-sm !text-muted" aria-label={t("order.close")}>
                      <CloseIcon size={18} />
                    </button>
                  </div>
                  <RequestForm kind="catering" settings={settings} branches={branches} />
                </div>
              )}
            </div>
          </article>
        )}

        {showInn && (
          <article id="inn" className="img-zoom relative isolate flex min-h-[380px] items-end overflow-hidden rounded-[var(--radius-card)] text-white lg:min-h-[460px]" data-reveal>
            <Img src={inn.image} blur={inn.blur} alt="" fill sizes="100vw" className="-z-10 object-cover" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/85 via-black/55 to-black/10" />
            <div className="max-w-xl p-6 lg:p-12">
              <p className="eyebrow mb-3 !text-primary-soft">{t("inn.eyebrow")}</p>
              <h2 className="h2">{pick(inn.title, inn.title_am)}</h2>
              <p className="mt-3 text-[16px] text-white/85">{pick(inn.text, inn.text_am)}</p>
              {pick(inn.locations, inn.locations_am) && <p className="mt-3 text-[14px] text-white/70">{pick(inn.locations, inn.locations_am)}</p>}
              {phone && (
                <a href={phoneHref(phone)} className="btn btn-light mt-6">
                  <PhoneIcon /> {t("inn.cta")}
                </a>
              )}
            </div>
          </article>
        )}
      </div>
    </section>
  );
}
