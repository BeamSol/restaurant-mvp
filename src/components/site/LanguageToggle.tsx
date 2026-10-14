"use client";

import { useI18n } from "@/i18n/I18nProvider";

/** "EN | አማ" segmented toggle. `onDark` = over the hero photo. */
export default function LanguageToggle({ onDark = false }: { onDark?: boolean }) {
  const { lang, setLang, t } = useI18n();
  return (
    <div
      role="group"
      aria-label={t("header.language")}
      className={`flex h-9 items-center rounded-full p-0.5 text-[12px] font-bold transition-colors ${onDark ? "bg-white/12 ring-1 ring-white/25" : "bg-bg ring-1 ring-border"}`}
    >
      {(["en", "am"] as const).map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={lang === l}
          onClick={() => setLang(l)}
          className={`relative h-full min-w-10 rounded-full px-2.5 transition-colors after:absolute after:-inset-y-0.5 after:inset-x-0 ${
            lang === l ? (onDark ? "bg-white text-[#1a1112]" : "bg-ink text-bg") : onDark ? "text-white/80 hover:text-white" : "text-muted hover:text-ink"
          }`}
        >
          {l === "en" ? "EN" : "አማ"}
        </button>
      ))}
    </div>
  );
}
