"use client";

import { useI18n } from "@/i18n/I18nProvider";

export default function MenuHeading({ sections, dishes }: { sections: number; dishes: number }) {
  const { t, lang } = useI18n();
  return (
    <div className="mb-6 animate-fade-up">
      <p className="eyebrow mb-3">{t("menu.eyebrow")}</p>
      <h1 className="h1">{t("menu.title")}</h1>
      <p className="lead mt-2">
        {lang === "am" ? `${sections} ክፍሎች · ${dishes} ምግቦች` : `${sections} sections · ${dishes} dishes`}
      </p>
    </div>
  );
}
