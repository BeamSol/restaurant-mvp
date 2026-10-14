"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";

export default function NotFoundContent() {
  const { t } = useI18n();
  return (
    <main id="main" className="container-site flex min-h-[70svh] flex-col items-center justify-center pt-24 text-center">
      <p className="font-display text-[96px] leading-none font-extrabold text-primary/20">404</p>
      <h1 className="h1 mt-2">{t("notFound.title")}</h1>
      <p className="lead mt-3 max-w-md">{t("notFound.text")}</p>
      <div className="mt-7 flex gap-3">
        <Link href="/menu/" className="btn btn-primary">
          {t("nav.menu")}
        </Link>
        <Link href="/" className="btn btn-secondary">
          {t("notFound.home")}
        </Link>
      </div>
    </main>
  );
}
