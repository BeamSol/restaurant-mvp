"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";
import { formatTime } from "@/lib/format";
import type { Branch, EventRow } from "@/lib/types";
import Img from "./Img";
import SectionTitle from "./SectionTitle";
import { ClockIcon, MapPinIcon } from "../Icons";

/** Weekly music nights + one-off events, starting from today. Dark band in both themes. */
export default function Events({ events, branches, book }: { events: EventRow[]; branches: Branch[]; book: boolean }) {
  const { t, pick, lang } = useI18n();
  if (!events.length) return null;
  const today = new Date().getDay();
  const sorted = [...events].sort((a, b) => {
    const da = a.recurrence === "weekly" ? ((a.weekday ?? 0) - today + 7) % 7 : 99;
    const db = b.recurrence === "weekly" ? ((b.weekday ?? 0) - today + 7) % 7 : 99;
    return da - db || a.sort - b.sort;
  });

  return (
    <section id="events" aria-labelledby="events-title" className="section relative overflow-hidden bg-band text-on-band">
      <div className="pointer-events-none absolute -top-40 -right-40 size-[520px] rounded-full bg-primary/25 blur-[120px]" aria-hidden="true" />
      <div className="container-site relative">
        <SectionTitle
          id="events-title"
          tone="band"
          eyebrow={t("events.eyebrow")}
          title={t("events.title")}
          action={
            book ? (
              <Link href="/#book" className="btn btn-primary shrink-0">
                {t("events.book")}
              </Link>
            ) : undefined
          }
        />
      </div>
      <ul className="container-site no-scrollbar relative flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto pb-3 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible lg:grid-cols-4" data-reveal>
        {sorted.map((e, i) => {
          const branch = branches.find((b) => b.id === e.branch_id);
          const isToday = e.recurrence === "weekly" && e.weekday === today;
          const when =
            e.recurrence === "weekly"
              ? t("events.every", { day: t(`days.${e.weekday}`) })
              : new Intl.DateTimeFormat(lang === "am" ? "am-ET" : "en-GB", { weekday: "short", day: "numeric", month: "short" }).format(new Date(`${e.event_date}T12:00:00`));
          return (
            <li key={e.id} className="w-[78%] shrink-0 snap-start md:w-auto">
              <article className="img-zoom group relative flex aspect-[3/4] h-full flex-col justify-end overflow-hidden rounded-[18px] bg-white/5 ring-1 ring-white/10">
                {e.photo_url && <Img src={e.photo_url} blur={e.photo_blur} alt="" fill sizes="(min-width:1024px) 280px, 78vw" className="object-cover" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/0" />
                <span className={`absolute top-3 left-3 rounded-full px-3 py-1 text-[12px] font-bold ${isToday || i === 0 ? "bg-primary text-on-primary" : "bg-white/90 text-[#1a1112]"}`}>
                  {isToday ? `${t("status.today")} · ` : ""}
                  {when}
                </span>
                <div className="relative p-5 text-white">
                  <h3 className="h3 !text-[19px]">{pick(e.title, e.title_am)}</h3>
                  {e.description && <p className="mt-1 line-clamp-2 text-[14px] text-white/75">{pick(e.description, e.description_am)}</p>}
                  <ul className="mt-3 space-y-1 text-[13px] text-white/80">
                    {e.start_time && (
                      <li className="flex items-center gap-1.5">
                        <ClockIcon size={15} /> {t("events.from", { time: formatTime(e.start_time, lang) })}
                      </li>
                    )}
                    {branch && (
                      <li className="flex items-center gap-1.5">
                        <MapPinIcon size={15} /> {pick(branch.name, branch.name_am)}
                      </li>
                    )}
                  </ul>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
