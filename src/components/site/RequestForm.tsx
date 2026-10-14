"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { sendRequest, type RequestState } from "@/app/(site)/actions";
import { useI18n } from "@/i18n/I18nProvider";
import { getZonedNow } from "@/lib/hours";
import { phoneHref, whatsappHref } from "@/lib/links";
import type { Branch, Settings } from "@/lib/types";
import { CheckIcon, PhoneIcon, WhatsAppIcon } from "../Icons";

/** Table booking (kind="table") or catering enquiry (kind="catering") form. */
export default function RequestForm({ kind, settings, branches }: { kind: "table" | "catering"; settings: Settings; branches: Pick<Branch, "id" | "name" | "name_am" | "kind">[] }) {
  const { t, pick, lang } = useI18n();
  const [state, action, pending] = useActionState<RequestState, FormData>(sendRequest, null);
  const [summary, setSummary] = useState("");
  const [today, setToday] = useState("");
  const form = useRef<HTMLFormElement>(null);
  const places = branches.filter((b) => (kind === "catering" ? true : b.kind !== "catering"));
  const phone = settings.contact.phones?.[0];
  const wa = settings.contact.whatsapp;
  useEffect(() => setToday(getZonedNow(settings.timezone).date), [settings.timezone]);

  if (state?.ok) {
    return (
      <div className="flex flex-col items-start gap-3 py-4" role="status">
        <span className="inline-flex size-12 items-center justify-center rounded-full bg-green-600 text-white">
          <CheckIcon size={24} />
        </span>
        <p className="text-[16px] font-semibold">{kind === "table" ? t("booking.success") : t("cateringForm.success")}</p>
        <div className="flex flex-wrap gap-2">
          {wa && summary && (
            <a href={whatsappHref(wa, summary)} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
              <WhatsAppIcon /> {t("booking.alsoWhatsapp")}
            </a>
          )}
          {phone && (
            <a href={phoneHref(phone)} className="btn btn-secondary">
              <PhoneIcon /> {t("booking.callNow")}
            </a>
          )}
        </div>
      </div>
    );
  }

  const err = state && !state.ok ? state : null;
  const invalid = (f: string) => (err?.field === f ? { "aria-invalid": true as const, "aria-describedby": "form-error" } : {});

  return (
    <form
      ref={form}
      action={action}
      onSubmit={() => {
        // Prepare a WhatsApp copy of the request for the thank-you screen
        const d = new FormData(form.current!);
        const b = places.find((x) => x.id === d.get("branch_id"));
        setSummary(
          [
            kind === "table" ? "Table booking request" : "Catering enquiry",
            `${d.get("name")} · ${d.get("phone")}`,
            [d.get("date"), d.get("time"), d.get("guests") && `${d.get("guests")} guests`].filter(Boolean).join(" · "),
            b ? pick(b.name, b.name_am) : "",
            String(d.get("event_type") || ""),
            String(d.get("message") || ""),
          ]
            .filter(Boolean)
            .join("\n"),
        );
      }}
      className="grid gap-3 sm:grid-cols-2"
      noValidate
    >
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="lang" value={lang} />
      {/* honeypot: hidden from people, bots fill it */}
      <label className="absolute -left-[9999px]" aria-hidden="true">
        Company <input name="company" tabIndex={-1} autoComplete="off" />
      </label>

      <label className="block">
        <span className="label">{t("booking.name")}</span>
        <input name="name" required autoComplete="name" className="field" {...invalid("name")} />
      </label>
      <label className="block">
        <span className="label">{t("booking.phone")}</span>
        <input name="phone" required type="tel" inputMode="tel" autoComplete="tel" placeholder="09…" className="field" {...invalid("phone")} />
      </label>

      {kind === "catering" && (
        <label className="block sm:col-span-2">
          <span className="label">{t("cateringForm.eventType")}</span>
          <input name="event_type" placeholder={t("cateringForm.eventPh")} className="field" />
        </label>
      )}

      {kind === "table" ? (
        <div className="grid grid-cols-2 gap-3 sm:col-span-2 sm:grid-cols-3">
          <label className="col-span-2 block sm:col-span-1">
            <span className="label">{t("booking.date")}</span>
            <input name="date" type="date" min={today || undefined} required className="field" {...invalid("date")} />
          </label>
          <label className="block">
            <span className="label">{t("booking.time")}</span>
            <input name="time" type="time" defaultValue="19:30" required className="field" {...invalid("time")} />
          </label>
          <label className="block">
            <span className="label">{t("booking.guests")}</span>
            <select name="guests" defaultValue="2" className="field" {...invalid("guests")}>
              {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
        </div>
      ) : (
        <>
        <label className="block">
          <span className="label">{t("cateringForm.date")}</span>
          <input name="date" type="date" min={today || undefined} className="field" {...invalid("date")} />
        </label>
        <label className="block">
          <span className="label">{t("cateringForm.guests")}</span>
          <input name="guests" type="number" min={1} max={2000} inputMode="numeric" className="field" {...invalid("guests")} />
        </label>
        </>
      )}

      <label className="block sm:col-span-2">
        <span className="label">{t("booking.branch")}</span>
        <select name="branch_id" className="field" defaultValue="">
          <option value="">{t("menu.allBranches")}</option>
          {places.map((b) => (
            <option key={b.id} value={b.id}>
              {pick(b.name, b.name_am)}
            </option>
          ))}
        </select>
      </label>
      <label className="block sm:col-span-2">
        <span className="label">{t("booking.message")}</span>
        <textarea name="message" rows={2} maxLength={1000} placeholder={kind === "table" ? t("booking.messagePh") : t("cateringForm.eventPh")} className="field" />
      </label>

      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <button type="submit" disabled={pending} className="btn btn-primary !h-12 px-6 !text-[15px]">
          {pending ? t("booking.sending") : kind === "table" ? t("booking.submit") : t("cateringForm.submit")}
        </button>
        {err && (
          <p id="form-error" role="alert" className="text-[14px] font-medium text-[#d92d20] dark:text-[#ff8a80]">
            {err.error}
          </p>
        )}
      </div>
    </form>
  );
}
