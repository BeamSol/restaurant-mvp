"use client";

import { useI18n } from "@/i18n/I18nProvider";
import type { Testimonial } from "@/lib/types";
import SectionTitle from "./SectionTitle";
import { StarIcon } from "../Icons";

/** Up to 3 short reviews. Sample reviews are clearly labelled. */
export default function Reviews({ reviews }: { reviews: Testimonial[] }) {
  const { t, pick } = useI18n();
  if (!reviews.length) return null;
  return (
    <section aria-labelledby="reviews-title" className="section bg-surface/60 dark:bg-surface/30">
      <div className="container-site">
        <SectionTitle id="reviews-title" eyebrow={t("reviews.eyebrow")} title={t("reviews.title")} center />
        <ul className="grid gap-4 md:grid-cols-3 md:gap-6" data-reveal>
          {reviews.slice(0, 3).map((r) => (
            <li key={r.id}>
              <figure className="card flex h-full flex-col p-6 lg:p-7">
                <span aria-hidden="true" className="font-display text-[48px] leading-none text-primary/30">“</span>
                <blockquote className="-mt-3 flex-1 text-[16px] leading-relaxed">{pick(r.text, r.text_am)}</blockquote>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <figcaption className="text-[14px] font-bold">{r.name}</figcaption>
                  <div className="flex gap-0.5 text-[#f5a524]" role="img" aria-label={t("reviews.rating", { n: r.rating })}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <StarIcon key={i} size={15} filled={i < r.rating} className={i < r.rating ? "" : "text-border"} />
                    ))}
                  </div>
                </div>
                {r.is_sample && <p className="mt-3 w-fit rounded-full bg-tint px-2.5 py-0.5 text-[12px] font-semibold text-primary-strong dark:text-ink">{t("reviews.sample")}</p>}
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
