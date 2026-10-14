"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { formatPrice } from "@/lib/format";
import type { MenuItem } from "@/lib/types";
import Img from "./Img";
import AddButton from "./order/AddButton";

/** Photo card for "Signature dishes": price chip on the photo, add-to-order button. */
export default function DishCard({ item, currency, orders }: { item: MenuItem; currency: string; orders: boolean }) {
  const { t, pick, lang } = useI18n();
  const other = lang === "am" ? item.name : item.name_am;
  const price = formatPrice(item.price, lang, currency);
  return (
    <article className="card card-hover img-zoom flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden bg-border">
        {item.photo_url && <Img src={item.photo_url} blur={item.photo_blur} alt={pick(item.name, item.name_am)} fill sizes="(min-width:1024px) 370px, (min-width:640px) 50vw, 78vw" className="object-cover" />}
        <span className="absolute bottom-3 left-3 rounded-full bg-black/65 px-3 py-1 text-[13px] font-bold text-white backdrop-blur">{price ?? t("menu.askPrice")}</span>
        {!item.is_available && <span className="absolute top-3 left-3 rounded-full bg-white px-2.5 py-0.5 text-[12px] font-bold text-[#1a1112]">{t("menu.soldOut")}</span>}
        {item.tags.includes("fasting") && <span className="absolute top-3 right-3 rounded-full bg-green-700 px-2.5 py-0.5 text-[12px] font-bold text-white">{t("tags.fasting")}</span>}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="h3">{pick(item.name, item.name_am)}</h3>
        {other && (
          <p lang={lang === "am" ? "en" : "am"} className="text-[13px] text-muted">
            {other}
          </p>
        )}
        {item.description && <p className="text-secondary mt-2 line-clamp-2">{pick(item.description, item.description_am)}</p>}
        {orders && (
          <div className="mt-auto flex justify-end pt-4">
            <AddButton item={item} />
          </div>
        )}
      </div>
    </article>
  );
}
