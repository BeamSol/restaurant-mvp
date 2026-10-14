"use client";

import { useI18n } from "@/i18n/I18nProvider";
import type { MenuItem } from "@/lib/types";
import { CheckIcon, MinusIcon, PlusIcon } from "../../Icons";
import { useOrder } from "./OrderProvider";

/**
 * "+ Add" button; becomes a − 2 + stepper once the dish is in the order.
 * Hidden for sold-out dishes.
 */
export default function AddButton({ item, compact = false }: { item: MenuItem; compact?: boolean }) {
  const { t, pick } = useI18n();
  const { lines, add, change, lastAdded } = useOrder();
  if (!item.is_available) return null;
  const name = pick(item.name, item.name_am);
  const line = lines.find((l) => l.id === item.id);

  if (line) {
    return (
      <span className="inline-flex h-9 items-center rounded-full bg-tint text-primary-strong dark:text-ink" role="group" aria-label={name}>
        <button type="button" onClick={() => change(item.id, -1)} aria-label={t("order.decrease", { item: name })} className="relative inline-flex size-9 items-center justify-center rounded-full hover:bg-primary/10 after:absolute after:-inset-0.5">
          <MinusIcon size={16} />
        </button>
        <span className="min-w-5 text-center text-[14px] font-bold tabular-nums" aria-live="polite">
          {lastAdded === item.id ? <CheckIcon size={15} className="inline" /> : line.qty}
        </span>
        <button type="button" onClick={() => change(item.id, 1)} aria-label={t("order.increase", { item: name })} className="relative inline-flex size-9 items-center justify-center rounded-full hover:bg-primary/10 after:absolute after:-inset-0.5">
          <PlusIcon size={16} />
        </button>
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={() => add({ id: item.id, name: item.name, name_am: item.name_am, price: item.price })}
      aria-label={t("order.addItem", { item: name })}
      className={`btn btn-sm ${compact ? "btn-secondary !h-9 !px-3" : "btn-primary"}`}
    >
      <PlusIcon size={16} />
      {t("order.add")}
    </button>
  );
}
