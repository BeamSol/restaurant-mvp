"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { phoneHref } from "@/lib/links";
import { PhoneIcon } from "../Icons";

export default function OfflineContent({ phones }: { phones: string[] }) {
  const { t } = useI18n();
  return (
    <main id="main" className="container-site flex min-h-[80svh] flex-col items-center justify-center pt-24 pb-16 text-center">
      <span className="inline-flex size-16 items-center justify-center rounded-full bg-tint text-[30px]" aria-hidden="true">
        ⌁
      </span>
      <h1 className="h1 mt-5">{t("offline.title")}</h1>
      <p className="lead mt-3 max-w-md">{t("offline.text")}</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => location.reload()} className="btn btn-primary">
          {t("offline.retry")}
        </button>
        <a href="/menu/" className="btn btn-secondary">
          {t("offline.menu")}
        </a>
      </div>
      <ul className="mt-8 space-y-1">
        {phones.map((p) => (
          <li key={p}>
            <a href={phoneHref(p)} className="inline-flex items-center gap-2 py-2 text-[17px] font-bold text-primary" dir="ltr">
              <PhoneIcon /> {p}
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
