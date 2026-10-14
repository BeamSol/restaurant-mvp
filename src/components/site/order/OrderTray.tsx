"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { formatPrice } from "@/lib/format";
import { phoneHref, whatsappHref } from "@/lib/links";
import type { Branch, Settings } from "@/lib/types";
import { BagIcon, CloseIcon, MinusIcon, PhoneIcon, PlusIcon, TelegramIcon, WhatsAppIcon } from "../../Icons";
import { useOrder } from "./OrderProvider";

type Mode = "pickup" | "delivery" | "dinein";

/** Floating "View order" pill + bottom sheet that composes the WhatsApp / Telegram message. */
export default function OrderTray({ settings, branches }: { settings: Settings; branches: Pick<Branch, "id" | "name" | "name_am" | "kind">[] }) {
  const { t, pick, lang } = useI18n();
  const { lines, count, total, hasUnpriced, change, clear, open, setOpen } = useOrder();
  const dialog = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<Mode>("pickup");
  const [branch, setBranch] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);
  const wa = settings.contact.whatsapp;
  const tg = settings.contact.telegram;
  const phone = settings.contact.phones?.[0];
  const money = (n: number | null) => formatPrice(n, lang, settings.currency) ?? t("menu.askPrice");
  const places = branches.filter((b) => b.kind !== "catering");

  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
    if (!open && dialog.current?.open) dialog.current.close();
  }, [open]);

  const message = () => {
    const out = [t("order.msgHello", { name: pick(settings.name, settings.name_am) })];
    for (const l of lines) out.push(`• ${l.qty} × ${pick(l.name, l.name_am)}${l.price !== null ? ` (${money(l.price * l.qty)})` : ""}`);
    out.push(`${t("order.msgTotal")}: ${money(total)}${hasUnpriced ? ` ${t("order.plusUnpriced")}` : ""}`);
    const b = places.find((x) => x.id === branch);
    out.push(b ? t("order.msgFor", { type: t(`order.${mode}`), branch: pick(b.name, b.name_am) }) : t(`order.${mode}`));
    if (name.trim()) out.push(`${t("order.msgName")}: ${name.trim()}`);
    if (mode === "delivery" && address.trim()) out.push(`${t("order.msgAddress")}: ${address.trim()}`);
    if (note.trim()) out.push(`${t("order.msgNote")}: ${note.trim()}`);
    return out.join("\n");
  };

  return (
    <>
      {count > 0 && !open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed right-4 bottom-[76px] z-40 inline-flex h-12 items-center gap-3 rounded-full bg-ink pr-5 pl-4 text-[14px] font-bold text-bg shadow-2xl shadow-black/30 animate-fade-up lg:bottom-6"
        >
          <span className="relative">
            <BagIcon size={20} />
            <span className="absolute -top-2 -right-2.5 inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] text-on-primary">{count}</span>
          </span>
          {t("order.view")} · {money(total)}
        </button>
      )}

      <dialog
        ref={dialog}
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === dialog.current && setOpen(false)}
        aria-label={t("order.tray")}
        className="m-0 mt-auto h-auto max-h-[92svh] w-full max-w-none rounded-t-[22px] bg-surface p-0 text-ink shadow-2xl sm:m-auto sm:max-w-lg sm:rounded-[22px]"
      >
        <div className="flex max-h-[92svh] flex-col">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="h3 flex items-center gap-2">
              <BagIcon size={20} /> {t("order.tray")}
              <span className="text-secondary font-sans font-normal">· {t("order.items", { count })}</span>
            </h2>
            <button type="button" onClick={() => setOpen(false)} aria-label={t("order.close")} className="btn btn-ghost btn-icon btn-sm !text-ink">
              <CloseIcon size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-3">
            {lines.length === 0 ? (
              <p className="text-secondary py-8 text-center">{t("order.empty")}</p>
            ) : (
              <ul className="divide-y divide-border">
                {lines.map((l) => (
                  <li key={l.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold">{pick(l.name, l.name_am)}</p>
                      <p className="text-secondary">{l.price !== null ? money(l.price * l.qty) : t("menu.askPrice")}</p>
                    </div>
                    <span className="inline-flex h-9 shrink-0 items-center rounded-full border border-border">
                      <button type="button" onClick={() => change(l.id, -1)} aria-label={t("order.decrease", { item: pick(l.name, l.name_am) })} className="relative inline-flex size-9 items-center justify-center after:absolute after:-inset-0.5">
                        <MinusIcon size={16} />
                      </button>
                      <span className="min-w-6 text-center text-[14px] font-bold tabular-nums">{l.qty}</span>
                      <button type="button" onClick={() => change(l.id, 1)} aria-label={t("order.increase", { item: pick(l.name, l.name_am) })} className="relative inline-flex size-9 items-center justify-center after:absolute after:-inset-0.5">
                        <PlusIcon size={16} />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {lines.length > 0 && (
              <div className="mt-2 space-y-3 pb-2">
                <div className="flex items-baseline justify-between rounded-[12px] bg-tint px-4 py-3">
                  <span className="font-semibold">{t("order.total")}</span>
                  <span className="text-[18px] font-extrabold text-primary-strong dark:text-ink">{money(total)}</span>
                </div>
                {hasUnpriced && <p className="text-secondary">{t("order.noPriceNote")}</p>}
                <fieldset>
                  <legend className="label">{t("order.type")}</legend>
                  <div className="grid grid-cols-3 gap-2">
                    {(["pickup", "delivery", "dinein"] as Mode[]).map((m) => (
                      <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)} className="chip justify-center">
                        {t(`order.${m}`)}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <label className="block">
                  <span className="label">{t("order.branch")}</span>
                  <select value={branch} onChange={(e) => setBranch(e.target.value)} className="field">
                    <option value="">—</option>
                    {places.map((b) => (
                      <option key={b.id} value={b.id}>
                        {pick(b.name, b.name_am)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="label">{t("order.name")}</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="field" autoComplete="name" />
                </label>
                {mode === "delivery" && (
                  <label className="block">
                    <span className="label">{t("order.address")}</span>
                    <input value={address} onChange={(e) => setAddress(e.target.value)} className="field" autoComplete="street-address" />
                  </label>
                )}
                <label className="block">
                  <span className="label">{t("order.note")}</span>
                  <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("order.notePh")} className="field" />
                </label>
              </div>
            )}
          </div>

          {lines.length > 0 && (
            <div className="space-y-2 border-t border-border px-5 py-4" style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}>
              {wa && (
                <a href={whatsappHref(wa, message())} target="_blank" rel="noopener noreferrer" className="btn btn-primary w-full !h-12 !text-[15px]">
                  <WhatsAppIcon /> {t("order.sendWhatsapp")}
                </a>
              )}
              <div className="flex gap-2">
                {tg && (
                  <a href={`https://t.me/share/url?url=${encodeURIComponent(settings.seo.siteUrl || "")}&text=${encodeURIComponent(message())}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary flex-1">
                    <TelegramIcon /> {t("order.sendTelegram")}
                  </a>
                )}
                <button
                  type="button"
                  className="btn btn-secondary flex-1"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(message());
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    } catch {}
                  }}
                >
                  {copied ? t("order.copied") : t("order.copy")}
                </button>
                {phone && (
                  <a href={phoneHref(phone)} className="btn btn-secondary btn-icon" aria-label={t("order.call")}>
                    <PhoneIcon />
                  </a>
                )}
              </div>
              <button type="button" onClick={clear} className="btn btn-ghost btn-sm w-full !text-muted">
                {t("order.clear")}
              </button>
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}
