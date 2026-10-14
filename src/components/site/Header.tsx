"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import type { Announcement, Settings } from "@/lib/types";
import AnnouncementBar from "./AnnouncementBar";
import Img from "./Img";
import LanguageToggle from "./LanguageToggle";
import ThemeToggle from "../shared/ThemeToggle";
import { CloseIcon, MenuIcon } from "../Icons";

/**
 * Fixed header. On the home page it floats transparently over the hero photo
 * and turns into frosted glass once you scroll; on other pages it's glass.
 */
export default function Header({ settings, announcement }: { settings: Settings; announcement?: Announcement }) {
  const { t, pick } = useI18n();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const f = settings.features;
  const overlay = path === "/" && !scrolled && !open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);
  useEffect(() => setOpen(false), [path]);

  const links = [
    { href: "/menu/", key: "nav.menu" },
    ...(f.events !== false ? [{ href: "/#events", key: "nav.events" }] : []),
    { href: "/#branches", key: "nav.branches" },
    ...(f.catering !== false ? [{ href: "/#catering", key: "nav.catering" }] : []),
    ...(f.gallery !== false ? [{ href: "/#gallery", key: "nav.gallery" }] : []),
  ];
  const bookHref = f.booking !== false ? "/#book" : settings.contact.phones?.[0] ? `tel:${settings.contact.phones[0].replace(/\s/g, "")}` : "/#branches";

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,color] duration-300 ${overlay ? "bg-transparent text-white" : "glass text-ink shadow-[0_1px_0_var(--c-border)]"}`}>
      {settings.features.announcements !== false && <AnnouncementBar announcement={announcement} />}
      <div className="container-site flex h-16 items-center gap-3">
        <Link href="/" className="flex h-10 shrink-0 items-center" aria-label={pick(settings.name, settings.name_am)}>
          {settings.logo_url ? (
            <Img src={settings.logo_url} alt={pick(settings.name, settings.name_am)} width={61} height={40} preload className="h-10 w-auto drop-shadow-sm" />
          ) : (
            <span className="h3">{pick(settings.name, settings.name_am)}</span>
          )}
        </Link>

        <nav aria-label={t("nav.main")} className="ml-6 hidden lg:block">
          <ul className="flex items-center gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={l.href === "/menu/" && path.startsWith("/menu") ? "page" : undefined}
                  className={`rounded-full px-3.5 py-2 text-[14px] font-semibold transition-colors aria-[current=page]:bg-tint ${overlay ? "text-white/90 hover:bg-white/12 hover:text-white" : "text-ink/75 hover:bg-tint hover:text-ink"}`}
                >
                  {t(l.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <LanguageToggle onDark={overlay} />
          {f.darkMode !== false && <ThemeToggle className={overlay ? "hover:!bg-white/12" : ""} />}
          <Link href={bookHref} className={`btn btn-sm hidden sm:inline-flex ${overlay ? "btn-light" : "btn-primary"}`}>
            {t("header.bookTable")}
          </Link>
          <button
            type="button"
            className={`relative inline-flex size-10 items-center justify-center rounded-[10px] lg:hidden ${overlay ? "hover:bg-white/12" : "hover:bg-tint"}`}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t("header.closeMenu") : t("header.openMenu")}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Phone menu: full-height sheet */}
      <nav id="mobile-nav" aria-label={t("nav.main")} hidden={!open} className="h-[calc(100svh-64px)] overflow-y-auto border-t border-border bg-bg lg:hidden">
        <ul className="container-site py-4">
          {links.map((l, i) => (
            <li key={l.href} className="animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
              <Link href={l.href} onClick={() => setOpen(false)} className="flex h-14 items-center justify-between border-b border-border text-[20px] font-bold font-display">
                {t(l.key)} <span aria-hidden="true" className="text-muted">→</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="container-site">
          <Link href={bookHref} onClick={() => setOpen(false)} className="btn btn-primary !h-12 w-full !text-[15px]">
            {t("header.bookTable")}
          </Link>
        </div>
      </nav>
    </header>
  );
}
