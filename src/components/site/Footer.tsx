"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";
import { formatTime } from "@/lib/format";
import { groupHours } from "@/lib/hours";
import { phoneHref, whatsappHref } from "@/lib/links";
import type { Branch, Settings } from "@/lib/types";
import Img from "./Img";
import { FacebookIcon, InstagramIcon, MailIcon, PhoneIcon, TikTokIcon, WhatsAppIcon, YouTubeIcon } from "../Icons";

/** Four-column footer on a dark band: brand · explore · hours · contact. */
export default function Footer({ settings, branches }: { settings: Settings; branches: Branch[] }) {
  const { t, pick, lang } = useI18n();
  const f = settings.features;
  const socials = [
    { href: settings.socials.facebook, label: "Facebook", Icon: FacebookIcon },
    { href: settings.socials.instagram, label: "Instagram", Icon: InstagramIcon },
    { href: settings.socials.tiktok, label: "TikTok", Icon: TikTokIcon },
    { href: settings.socials.youtube, label: "YouTube", Icon: YouTubeIcon },
  ].filter((s) => s.href);
  const name = pick(settings.name, settings.name_am);
  // Hours of the first restaurant branch as a representative summary
  const main = branches.find((b) => b.kind === "restaurant") ?? branches[0];
  const links = [
    { href: "/menu/", label: t("nav.menu") },
    ...(f.booking !== false ? [{ href: "/#book", label: t("booking.title") }] : []),
    ...(f.events !== false ? [{ href: "/#events", label: t("nav.events") }] : []),
    { href: "/#branches", label: t("footer2.allBranches") },
    ...(f.catering !== false ? [{ href: "/#catering", label: t("nav.catering") }] : []),
    ...(f.gallery !== false ? [{ href: "/#gallery", label: t("nav.gallery") }] : []),
  ];
  const col = "text-[12px] font-extrabold tracking-[0.14em] uppercase text-on-band/50 mb-4";

  return (
    <footer id="contact" className="bg-band pt-14 pb-28 text-[14px] text-on-band/80 lg:pt-20 lg:pb-10">
      <div className="container-site grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          {settings.logo_url && <Img src={settings.logo_url} alt={name} width={76} height={50} className="h-12 w-auto" />}
          <p className="mt-4 max-w-xs text-[15px] leading-relaxed">{pick(settings.tagline, settings.tagline_am)}</p>
          {socials.length > 0 && (
            <ul className="mt-6 flex gap-2" aria-label={t("footer.follow")}>
              {socials.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="inline-flex size-10 items-center justify-center rounded-full bg-white/8 text-on-band ring-1 ring-white/10 transition-colors hover:bg-primary hover:text-on-primary">
                    <Icon size={18} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <nav aria-label={t("footer2.explore")}>
          <p className={col}>{t("footer2.explore")}</p>
          <ul>
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-block py-2.5 hover:text-on-band">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {main && (
          <div>
            <p className={col}>{t("footer2.hours")}</p>
            <ul className="space-y-1.5">
              {groupHours(main.hours).map((g) => (
                <li key={g.from} className="flex justify-between gap-4">
                  <span>{g.from === 1 && g.to === 0 ? t("footer2.everyDay") : `${t(`daysShort.${g.from}`)}${g.to !== g.from ? `–${t(`daysShort.${g.to}`)}` : ""}`}</span>
                  <span className="tabular-nums text-on-band">{g.closed ? t("branches.closed") : `${formatTime(g.open, lang)} – ${formatTime(g.close, lang)}`}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[13px] text-on-band/55">{pick(main.name, main.name_am)}</p>
          </div>
        )}
        <div>
          <p className={col}>{t("footer2.contact")}</p>
          <ul>
            {settings.contact.phones?.map((p) => (
              <li key={p}>
                <a href={phoneHref(p)} className="inline-flex items-center gap-2 py-2.5 text-on-band hover:underline" dir="ltr">
                  <PhoneIcon size={16} /> {p}
                </a>
              </li>
            ))}
            {settings.contact.whatsapp && (
              <li>
                <a href={whatsappHref(settings.contact.whatsapp)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 py-2.5 hover:text-on-band">
                  <WhatsAppIcon size={16} /> WhatsApp
                </a>
              </li>
            )}
            {settings.contact.email && (
              <li>
                <a href={`mailto:${settings.contact.email}`} className="inline-flex items-center gap-2 py-2.5 hover:text-on-band">
                  <MailIcon size={16} /> {settings.contact.email}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="container-site mt-12 flex flex-col gap-1 border-t border-white/10 pt-6 text-[13px] text-on-band/55 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {name}. {t("footer.rights")}
        </p>
        <p className="flex flex-wrap items-center gap-x-5">
          {settings.agency && (
            <span>
              {t("footer.websiteBy")}{" "}
              <a href={settings.agency.url} target="_blank" rel="noopener" className="inline-block py-2.5 text-on-band/80 hover:text-on-band">
                {settings.agency.name}
              </a>
            </span>
          )}
          <Link href="/admin/" className="inline-block py-2.5 hover:text-on-band" rel="nofollow">
            {t("footer.admin")}
          </Link>
        </p>
      </div>
    </footer>
  );
}
