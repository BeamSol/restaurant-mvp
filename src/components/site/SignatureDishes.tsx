"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";
import type { MenuItem } from "@/lib/types";
import DishCard from "./DishCard";
import SectionTitle from "./SectionTitle";
import { ArrowRightIcon } from "../Icons";

export default function SignatureDishes({ items, currency, orders }: { items: MenuItem[]; currency: string; orders: boolean }) {
  const { t } = useI18n();
  if (!items.length) return null;
  return (
    <section aria-labelledby="signature-title" className="section">
      <div className="container-site">
        <SectionTitle
          id="signature-title"
          eyebrow={t("signature.eyebrow")}
          title={t("signature.title")}
          action={
            <Link href="/menu/" className="btn btn-secondary shrink-0">
              {t("signature.seeMenu")} <ArrowRightIcon />
            </Link>
          }
        />
      </div>
      <ul className="container-site no-scrollbar flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto pb-3 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible lg:grid-cols-3" data-reveal>
        {items.map((item) => (
          <li key={item.id} className="w-[78%] shrink-0 snap-start sm:w-auto">
            <DishCard item={item} currency={currency} orders={orders} />
          </li>
        ))}
      </ul>
    </section>
  );
}
