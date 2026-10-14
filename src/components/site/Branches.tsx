"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { directionsUrl, formatTime, mapEmbedUrl } from "@/lib/format";
import { groupHours, todayPlan } from "@/lib/hours";
import { phoneHref } from "@/lib/links";
import type { Branch, Closure } from "@/lib/types";
import Img from "./Img";
import OpenBadge from "./OpenBadge";
import SectionTitle from "./SectionTitle";
import { ClockIcon, MapPinIcon, PhoneIcon } from "../Icons";

const KIND_LABEL: Record<string, [string, string]> = { lounge: ["Lounge · live music", "ላውንጅ · ሙዚቃ"], catering: ["Catering", "የምግብ ዝግጅት"] };

function BranchCard({ branch, closures, timeZone }: { branch: Branch; closures: Closure[]; timeZone: string }) {
  const { t, pick, lang } = useI18n();
  const [showMap, setShowMap] = useState(false);
  const [showHours, setShowHours] = useState(false);
  const query = branch.map_query || `${branch.name}, Addis Ababa`;
  const today = todayPlan(branch.hours, closures, branch.id, timeZone).plan;
  const name = pick(branch.name, branch.name_am);
  const kind = KIND_LABEL[branch.kind];

  return (
    <article className="card card-hover flex h-full flex-col overflow-hidden">
      <div className="img-zoom relative aspect-[16/10] overflow-hidden bg-border">
        {showMap ? (
          <iframe src={mapEmbedUrl(query)} title={t("branches.mapTitle", { name })} loading="lazy" className="absolute inset-0 size-full border-0" referrerPolicy="no-referrer-when-downgrade" />
        ) : (
          branch.photo_url && <Img src={branch.photo_url} blur={branch.photo_blur} alt={branch.photo_alt ?? ""} fill sizes="(min-width:1024px) 370px, (min-width:640px) 50vw, 85vw" className="object-cover" />
        )}
        {kind && !showMap && <span className="absolute top-3 left-3 rounded-full bg-black/60 px-2.5 py-0.5 text-[12px] font-bold text-white backdrop-blur">{lang === "am" ? kind[1] : kind[0]}</span>}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="h3">{name}</h3>
        <p className="text-secondary mt-1 flex gap-1.5">
          <MapPinIcon size={16} className="mt-[3px] shrink-0" />
          {pick(branch.address, branch.address_am)}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[10px] bg-bg px-3 py-2">
          <OpenBadge branch={branch} closures={closures} timeZone={timeZone} tone="plain" />
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 text-[14px]">
          <span className="flex items-center gap-1.5 text-muted">
            <ClockIcon size={15} />
            {t("branches.today")}: {today ? `${formatTime(today.open, lang)} – ${formatTime(today.close, lang)}` : t("branches.closed")}
          </span>
        </div>
        <div className="mt-1 flex gap-4 text-[14px] font-semibold text-primary">
          <button type="button" className="relative py-2 after:absolute after:-inset-y-1 after:inset-x-0 hover:underline" aria-expanded={showHours} onClick={() => setShowHours((v) => !v)}>
            {t("branches.hours")}
          </button>
          <button type="button" className="relative py-2 after:absolute after:-inset-y-1 after:inset-x-0 hover:underline" aria-pressed={showMap} onClick={() => setShowMap((v) => !v)}>
            {showMap ? t("branches.hideMap") : t("branches.map")}
          </button>
        </div>
        {showHours && (
          <ul className="text-secondary mb-2 space-y-0.5 animate-fade-up">
            {groupHours(branch.hours).map((g) => (
              <li key={g.from} className="flex justify-between gap-3">
                <span>
                  {t(`daysShort.${g.from}`)}
                  {g.to !== g.from && `–${t(`daysShort.${g.to}`)}`}
                </span>
                <span className="tabular-nums">{g.closed ? t("branches.closed") : `${formatTime(g.open, lang)} – ${formatTime(g.close, lang)}`}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto flex gap-2 pt-3">
          {branch.phones[0] && (
            <a href={phoneHref(branch.phones[0])} className="btn btn-primary flex-1">
              <PhoneIcon />
              {t("branches.call")}
            </a>
          )}
          <a href={directionsUrl(query)} target="_blank" rel="noopener noreferrer" className="btn btn-secondary flex-1">
            {t("branches.directions")}
          </a>
        </div>
      </div>
    </article>
  );
}

export default function Branches({ branches, closures, timeZone }: { branches: Branch[]; closures: Closure[]; timeZone: string }) {
  const { t } = useI18n();
  return (
    <section id="branches" aria-labelledby="branches-title" className="section bg-surface/60 dark:bg-surface/30">
      <div className="container-site">
        <SectionTitle id="branches-title" eyebrow={t("branches.eyebrow")} title={t("branches.title")} />
      </div>
      <ul className="container-site no-scrollbar flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto pb-3 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible lg:grid-cols-3" data-reveal>
        {branches.map((b) => (
          <li key={b.id} className="w-[85%] shrink-0 snap-start sm:w-auto">
            <BranchCard branch={b} closures={closures} timeZone={timeZone} />
          </li>
        ))}
      </ul>
    </section>
  );
}
