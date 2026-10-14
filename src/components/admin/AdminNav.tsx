"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Role } from "@/lib/types";
import { logout } from "@/app/admin/auth-actions";
import ThemeToggle from "../shared/ThemeToggle";
import { ExternalIcon, LogOutIcon, MenuIcon, SidebarIcon } from "../Icons";
import { NAV } from "./nav-items";

type Counts = { requests: number; review: number };

/**
 * Admin shell: collapsible sidebar (desktop) + top bar + bottom tabs (phone).
 * Collapsed state is kept in a cookie so the page renders the same way on reload.
 */
export default function AdminNav({ role, name, email, counts, collapsed: initial, logo, siteName }: { role: Role; name: string; email: string; counts: Counts; collapsed: boolean; logo: string | null; siteName: string }) {
  const path = usePathname();
  const [collapsed, setCollapsed] = useState(initial);
  const [userMenu, setUserMenu] = useState(false);
  const items = NAV.filter((i) => !i.owner || role === "OWNER");
  const active = (href: string) => (href === "/admin/" ? path === "/admin" || path === "/admin/" : path.startsWith(href.replace(/\/$/, "")));
  const current = items.find((i) => active(i.href)) ?? (path.includes("/more") ? { label: "More" } : null);
  const groups = [...new Set(items.map((i) => i.group))];
  const initials = (name || email).split(/[\s@.]/).filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("");

  useEffect(() => {
    document.cookie = `admin_sidebar=${collapsed ? "collapsed" : "open"}; path=/admin; max-age=31536000; samesite=lax`;
    document.documentElement.style.setProperty("--admin-sidebar", collapsed ? "76px" : "256px");
  }, [collapsed]);
  useEffect(() => setUserMenu(false), [path]);

  const badge = (key?: keyof Counts) => (key && counts[key] > 0 ? counts[key] : 0);

  return (
    <>
      {/* ---------- Desktop sidebar ---------- */}
      <aside className={`fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-border bg-surface transition-[width] duration-300 lg:flex ${collapsed ? "w-[76px]" : "w-64"}`}>
        <div className={`flex h-16 items-center border-b border-border ${collapsed ? "justify-center px-2" : "gap-3 px-5"}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {logo && <img src={logo} alt="" className="h-8 w-auto" />}
          {!collapsed && (
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-[14px] font-extrabold">{siteName}</span>
              <span className="block text-[12px] text-muted">Admin</span>
            </span>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Admin">
          {groups.map((g) => (
            <div key={g} className="mb-4">
              {!collapsed && <p className="mb-1.5 px-3 text-[11px] font-bold tracking-[0.12em] text-muted uppercase">{g}</p>}
              {items
                .filter((i) => i.group === g)
                .map(({ href, label, Icon, badge: b }) => (
                  <Link
                    key={href}
                    href={href}
                    title={collapsed ? label : undefined}
                    aria-current={active(href) ? "page" : undefined}
                    className={`group relative mb-0.5 flex h-10 items-center gap-3 rounded-[10px] text-[14px] font-semibold transition-colors ${collapsed ? "justify-center" : "px-3"} ${
                      active(href) ? "bg-primary text-on-primary shadow-md shadow-primary/25" : "text-ink/75 hover:bg-tint hover:text-ink"
                    }`}
                  >
                    <Icon size={19} className="shrink-0" />
                    {!collapsed && <span className="truncate">{label}</span>}
                    {badge(b) > 0 &&
                      (collapsed ? (
                        <span className="absolute top-1.5 right-2.5 size-2 rounded-full bg-amber-500 ring-2 ring-surface" />
                      ) : (
                        <span className={`ml-auto rounded-full px-2 text-[11px] font-bold ${active(href) ? "bg-white/25 text-on-primary" : b === "requests" ? "bg-primary text-on-primary" : "bg-amber-100 text-amber-900"}`}>{badge(b)}</span>
                      ))}
                    {collapsed && (
                      <span className="pointer-events-none absolute left-full z-50 ml-3 hidden rounded-[8px] bg-ink px-2.5 py-1.5 text-[12px] whitespace-nowrap text-bg shadow-lg group-hover:block">{label}</span>
                    )}
                  </Link>
                ))}
            </div>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className={`flex h-10 w-full items-center gap-3 rounded-[10px] text-[13px] font-semibold text-muted hover:bg-tint hover:text-ink ${collapsed ? "justify-center" : "px-3"}`}
          >
            <SidebarIcon size={19} />
            {!collapsed && "Collapse"}
          </button>
        </div>
      </aside>

      {/* ---------- Top bar ---------- */}
      <header className="glass sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border px-4 sm:px-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {logo && <img src={logo} alt="" className="h-8 w-auto lg:hidden" />}
        <p className="truncate text-[16px] font-extrabold">{current?.label ?? "Admin"}</p>
        <div className="ml-auto flex items-center gap-1.5">
          <Link href="/" target="_blank" className="btn btn-secondary btn-sm hidden sm:inline-flex">
            View website <ExternalIcon size={15} />
          </Link>
          <ThemeToggle />
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenu((v) => !v)}
              aria-expanded={userMenu}
              aria-haspopup="menu"
              aria-label="Account menu"
              className="inline-flex size-10 items-center justify-center rounded-full bg-tint text-[13px] font-extrabold text-primary-strong ring-1 ring-border dark:text-ink"
            >
              {initials || "?"}
            </button>
            {userMenu && (
              <div role="menu" className="card absolute top-12 right-0 z-50 w-60 p-2 animate-fade-up">
                <div className="px-3 py-2">
                  <p className="truncate text-[14px] font-bold">{name || email}</p>
                  <p className="truncate text-[12px] text-muted">{email}</p>
                  <p className="mt-1 inline-block rounded-full bg-tint px-2 py-0.5 text-[11px] font-bold text-primary-strong dark:text-ink">{role === "OWNER" ? "Owner" : "Staff"}</p>
                </div>
                <Link href="/" target="_blank" role="menuitem" className="flex h-10 items-center gap-2 rounded-[8px] px-3 text-[14px] hover:bg-tint sm:hidden">
                  <ExternalIcon size={16} /> View website
                </Link>
                <form action={logout}>
                  <button role="menuitem" className="flex h-10 w-full items-center gap-2 rounded-[8px] px-3 text-[14px] text-[#b42318] hover:bg-tint dark:text-[#ff8a80]">
                    <LogOutIcon size={16} /> Log out
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ---------- Phone bottom tabs ---------- */}
      <nav aria-label="Admin" className="glass fixed inset-x-0 bottom-0 z-30 flex h-16 border-t border-border lg:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {items
          .filter((i) => i.tab)
          .map(({ href, label, Icon, badge: b }) => (
            <Link key={href} href={href} aria-current={active(href) ? "page" : undefined} className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-bold ${active(href) ? "text-primary" : "text-muted"}`}>
              <Icon size={21} />
              {label.split(" ")[0]}
              {badge(b) > 0 && <span className="absolute top-1.5 left-[calc(50%+6px)] min-w-4 rounded-full bg-primary px-1 text-center text-[10px] leading-4 text-on-primary">{badge(b)}</span>}
            </Link>
          ))}
        <Link href="/admin/more/" aria-current={active("/admin/more/") ? "page" : undefined} className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-bold ${active("/admin/more/") ? "text-primary" : "text-muted"}`}>
          <MenuIcon size={21} />
          More
          {counts.review > 0 && <span className="absolute top-2 left-[calc(50%+8px)] size-2 rounded-full bg-amber-500" />}
        </Link>
      </nav>
    </>
  );
}
