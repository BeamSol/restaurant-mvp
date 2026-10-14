"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { formatPrice } from "@/lib/format";
import { isFastingDay } from "@/lib/hours";
import type { Branch, Category, MenuItem, MenuTag, Settings } from "@/lib/types";
import Img from "./Img";
import { FlameIcon, HeartIcon, LeafIcon, SearchIcon } from "../Icons";
import AddButton from "./order/AddButton";

const FILTERS: { tag: MenuTag; Icon: typeof LeafIcon }[] = [
  { tag: "fasting", Icon: LeafIcon },
  { tag: "vegetarian", Icon: LeafIcon },
  { tag: "spicy", Icon: FlameIcon },
  { tag: "popular", Icon: HeartIcon },
];

const haystack = (i: MenuItem) => [i.name, i.name_am, i.description, i.description_am].filter(Boolean).join(" ").toLowerCase();

const TAG_STYLE: Record<string, string> = {
  fasting: "bg-green-600/10 text-green-800 dark:text-green-300",
  vegetarian: "bg-lime-600/10 text-lime-800 dark:text-lime-300",
  spicy: "bg-red-600/10 text-red-800 dark:text-red-300",
  popular: "bg-amber-500/12 text-amber-900 dark:text-amber-300",
};

function Row({ item, settings }: { item: MenuItem; settings: Settings }) {
  const { t, pick, lang } = useI18n();
  const name = pick(item.name, item.name_am);
  const other = lang === "am" ? item.name : item.name_am;
  const price = formatPrice(item.price, lang, settings.currency);
  const orders = settings.features.orders !== false && !!(settings.contact.whatsapp || settings.contact.telegram);

  return (
    <article className={`flex gap-4 rounded-[14px] p-2 transition-colors hover:bg-surface sm:p-3 ${item.is_available ? "" : "opacity-60"}`}>
      {item.photo_url ? (
        <div className="relative size-[76px] shrink-0 overflow-hidden rounded-[12px] bg-border sm:size-20">
          <Img src={item.photo_url} blur={item.photo_blur} alt={name} fill sizes="80px" className="object-cover" />
        </div>
      ) : (
        <div className="hidden size-20 shrink-0 sm:block" aria-hidden="true" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="h3 !text-[15.5px]">
            {name}
            {item.tags.includes("new") && <span className="ml-2 rounded-full bg-accent px-2 py-0.5 align-middle text-[11px] font-bold text-white">{t("tags.new")}</span>}
            {!item.is_available && <span className="ml-2 rounded-full bg-ink px-2 py-0.5 align-middle text-[11px] font-bold text-bg">{t("menu.soldOut")}</span>}
          </h3>
          <span className="shrink-0 text-[15px] font-extrabold whitespace-nowrap text-primary">{price ?? <span className="text-[13px] font-semibold text-muted">{t("menu.askPrice")}</span>}</span>
        </div>
        {other && (
          <p lang={lang === "am" ? "en" : "am"} className="text-[13px] text-muted">
            {other}
          </p>
        )}
        {item.description && <p className="text-secondary mt-1 line-clamp-2">{pick(item.description, item.description_am)}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {item.tags
            .filter((tag) => tag !== "new")
            .map((tag) => (
              <span key={tag} className={`rounded-full px-2 py-0.5 text-[11.5px] font-bold ${TAG_STYLE[tag] ?? "bg-tint text-muted"}`}>
                {t(`tags.${tag}`)}
              </span>
            ))}
          {orders && (
            <span className="ml-auto">
              <AddButton item={item} compact />
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export default function MenuExplorer({ categories, items, branches, settings }: { categories: Category[]; items: MenuItem[]; branches: Branch[]; settings: Settings }) {
  const { t, pick } = useI18n();
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<MenuTag[]>([]);
  const [branch, setBranch] = useState("");
  const [fastingToday, setFastingToday] = useState(false);

  // Links like /menu/?filter=fasting, ?q=five, ?branch=4-killo
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const f = p.get("filter");
    if (f && FILTERS.some((x) => x.tag === f)) setFilters([f as MenuTag]);
    if (p.get("q")) setQuery(p.get("q")!);
    const b = branches.find((x) => x.slug === p.get("branch"));
    if (b) setBranch(b.id);
    setFastingToday(isFastingDay(settings.timezone));
  }, [branches, settings.timezone]);

  const toggle = (tag: MenuTag) => setFilters((c) => (c.includes(tag) ? c.filter((x) => x !== tag) : [...c, tag]));

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return categories
      .filter((c) => category === "all" || c.id === category)
      .map((c) => ({
        ...c,
        items: items.filter(
          (i) =>
            i.category_id === c.id &&
            (!q || haystack(i).includes(q)) &&
            filters.every((f) => i.tags.includes(f)) &&
            (!branch || i.branch_ids.length === 0 || i.branch_ids.includes(branch)),
        ),
      }))
      .filter((c) => c.items.length);
  }, [categories, items, category, query, filters, branch]);
  const count = groups.reduce((n, g) => n + g.items.length, 0);
  const menuBranches = branches.filter((b) => b.kind !== "catering");

  return (
    <div>
      <div className="glass sticky top-16 z-20 -mx-4 space-y-2.5 border-b border-border px-4 py-3 sm:-mx-6 sm:rounded-b-[16px] sm:px-6">
        <div className="flex gap-2">
          <label className="relative flex-1">
            <span className="sr-only">{t("menu.searchLabel")}</span>
            <SearchIcon size={18} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("menu.search")} className="field !pl-9" />
          </label>
          <label className="w-[42%] max-w-56">
            <span className="sr-only">{t("menu.branch")}</span>
            <select value={branch} onChange={(e) => setBranch(e.target.value)} className="field !text-[14px]">
              <option value="">{t("menu.allBranches")}</option>
              {menuBranches.map((b) => (
                <option key={b.id} value={b.id}>
                  {pick(b.name, b.name_am)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div role="group" aria-label={t("menu.categories")} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-0.5 sm:mx-0 sm:px-0">
          <button type="button" aria-pressed={category === "all"} onClick={() => setCategory("all")} className="chip">
            {t("menu.all")}
          </button>
          {categories.map((c) => (
            <button key={c.id} type="button" aria-pressed={category === c.id} onClick={() => setCategory(c.id)} className="chip">
              {pick(c.name, c.name_am)}
            </button>
          ))}
        </div>
        <div role="group" aria-label={t("menu.filters")} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-0.5 sm:mx-0 sm:px-0">
          {FILTERS.map(({ tag, Icon }) => (
            <button key={tag} type="button" aria-pressed={filters.includes(tag)} onClick={() => toggle(tag)} className="chip !border-dashed aria-pressed:!border-solid">
              <Icon /> {t(`tags.${tag}`)}
            </button>
          ))}
        </div>
      </div>

      {fastingToday && !filters.includes("fasting") && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[12px] bg-green-50 p-3 text-[14px] text-green-900 ring-1 ring-green-700/20">
          <p className="flex items-center gap-2 font-medium">
            <LeafIcon size={18} /> {t("menu.fastingDay")}
          </p>
          <button type="button" onClick={() => setFilters(["fasting"])} className="btn btn-sm bg-green-800 text-white hover:bg-green-900">
            {t("menu.showFasting")}
          </button>
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {t("menu.count", { count })}
      </p>

      {groups.length === 0 ? (
        <div className="card mt-6 p-8 text-center">
          <p>{t("menu.noResults")}</p>
          <button
            type="button"
            className="btn btn-secondary mt-3"
            onClick={() => {
              setQuery("");
              setFilters([]);
              setCategory("all");
              setBranch("");
            }}
          >
            {t("menu.clear")}
          </button>
        </div>
      ) : (
        <div className="mt-4 grid gap-x-10 lg:grid-cols-2">
          {groups.map((g) => (
            <section key={g.id} aria-labelledby={`cat-${g.slug}`} className="mt-4 break-inside-avoid">
              <h2 id={`cat-${g.slug}`} className="h2 mb-2 flex items-center gap-3 !text-[21px] lg:!text-[24px]">
                {pick(g.name, g.name_am)}
                <span className="h-px flex-1 bg-border" aria-hidden="true" />
                <span className="text-[13px] font-semibold text-muted">{g.items.length}</span>
              </h2>
              {g.items.map((i) => (
                <Row key={i.id} item={i} settings={settings} />
              ))}
            </section>
          ))}
        </div>
      )}
      <p className="text-secondary mt-8">{t("menu.pricesNote", { currency: settings.currency })}</p>
    </div>
  );
}
