"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";
import type { Highlight } from "@/lib/types";
import Img from "./Img";
import { ArrowRightIcon } from "../Icons";

/** Four signature offers as photo cards overlapping the bottom of the hero. */
export default function Highlights({ items }: { items: Highlight[] }) {
  const { t, pick } = useI18n();
  if (!items.length) return null;
  return (
    <section aria-label={t("highlights.title")} className="container-site relative z-10 -mt-16 lg:-mt-20">
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
        {items.map((h, i) => (
          <li key={h.key} className="animate-fade-up" style={{ animationDelay: `${120 + i * 70}ms` }}>
            <Link href={h.href} className="card card-hover img-zoom group flex h-full flex-col overflow-hidden">
              <span className="relative block aspect-[16/10] overflow-hidden bg-border">
                <Img src={h.image} blur={h.blur} alt="" fill sizes="(min-width:1024px) 280px, 50vw" className="object-cover" />
              </span>
              <span className="flex flex-1 items-start justify-between gap-2 p-3.5 lg:p-4">
                <span className="min-w-0">
                  <span className="block text-[14px] leading-snug font-extrabold lg:text-[15px]">{pick(h.title, h.title_am)}</span>
                  {h.text && <span className="mt-0.5 block text-[13px] leading-snug text-muted">{pick(h.text, h.text_am)}</span>}
                </span>
                <ArrowRightIcon size={16} className="mt-0.5 hidden shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary sm:block" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
