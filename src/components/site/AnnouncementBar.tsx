"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";
import type { Announcement } from "@/lib/types";

/** Slim bar at the very top for the newest active announcement (Admin → Dashboard). */
export default function AnnouncementBar({ announcement }: { announcement?: Announcement }) {
  const { pick } = useI18n();
  if (!announcement) return null;
  const text = pick(announcement.text, announcement.text_am);
  return (
    <div className="bg-accent text-[13px] font-medium text-white">
      <div className="container-site flex min-h-9 items-center justify-center py-1.5 text-center">
        {announcement.link ? (
          <Link href={announcement.link} className="underline-offset-2 hover:underline">
            {text} <span aria-hidden="true">→</span>
          </Link>
        ) : (
          <p>{text}</p>
        )}
      </div>
    </div>
  );
}
