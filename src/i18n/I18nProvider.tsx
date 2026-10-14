"use client";

/**
 * English / Amharic switching without page reloads.
 *  - UI strings: `t("section.key")` from en.json / am.json
 *  - Database content: `pick(row.name, row.name_am)` (falls back to English)
 *  - Remembered for the browser session; `?lang=am` opens the site in Amharic.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Lang } from "@/lib/types";
import { fill } from "@/lib/links";
import en from "./en.json";
import am from "./am.json";

const dictionaries: Record<Lang, typeof en> = { en, am };
export const LANGS: Lang[] = ["en", "am"];
const STORAGE_KEY = "lang";

interface I18nValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
  pick: (en?: string | null, am?: string | null) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

function lookup(dict: unknown, key: string): string | undefined {
  const v = key.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], dict);
  return typeof v === "string" ? v : undefined;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = new URLSearchParams(window.location.search).get("lang") ?? sessionStorage.getItem(STORAGE_KEY);
    } catch {
      /* storage blocked: keep English */
    }
    if (saved === "am") setLangState("am");
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      sessionStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      setLang,
      t: (key, values) => {
        const text = lookup(dictionaries[lang], key) ?? lookup(dictionaries.en, key) ?? key;
        return values ? fill(text, Object.fromEntries(Object.entries(values).map(([k, v]) => [k, String(v)]))) : text;
      },
      pick: (enText, amText) => (lang === "am" && amText ? amText : (enText ?? "")),
    }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
