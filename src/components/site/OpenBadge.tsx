"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { getOpenStatus, type OpenStatus } from "@/lib/hours";
import { formatTime } from "@/lib/format";
import type { Branch, Closure } from "@/lib/types";

/** Live status of ONE branch: "● Open now · until 10:00 PM". Computed in the browser, refreshed every minute. */
export function useOpenStatus(branch: Branch | undefined, closures: Closure[], timeZone: string) {
  const [status, setStatus] = useState<OpenStatus | null>(null);
  useEffect(() => {
    if (!branch) return;
    const update = () => setStatus(getOpenStatus(branch.hours, closures, branch.id, timeZone));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [branch, closures, timeZone]);
  return status;
}

export function StatusText({ status }: { status: OpenStatus }) {
  const { t, lang } = useI18n();
  if (status.isOpen) return <>{t("status.closesAt", { time: formatTime(status.closesAt, lang) })}</>;
  if (status.closedToday) return <>{t("status.closedFor", { name: status.closedToday })}</>;
  if (!status.opensAt) return null;
  const time = formatTime(status.opensAt, lang);
  return <>{status.opensDay === null ? t("status.opensAt", { time }) : t("status.opensDayAt", { day: t(`daysShort.${status.opensDay}`), time })}</>;
}

export default function OpenBadge({ branch, closures, timeZone, tone = "light" }: { branch: Branch; closures: Closure[]; timeZone: string; tone?: "light" | "plain" }) {
  const { t } = useI18n();
  const status = useOpenStatus(branch, closures, timeZone);
  const box = tone === "light" ? "bg-white/95 text-[#1a1112] shadow-sm px-3 h-8" : "text-ink";
  if (!status) return <span className={`inline-block h-8 w-40 rounded-full ${tone === "light" ? "bg-white/60" : ""}`} aria-hidden="true" />;
  return (
    <span className={`inline-flex items-center gap-2 rounded-full text-[13px] ${box}`}>
      <span className={`size-2 rounded-full ${status.isOpen ? "bg-green-500 shadow-[0_0_0_4px_rgba(34,197,94,.22)]" : "bg-red-600"}`} aria-hidden="true" />
      <span className="font-semibold">{status.isOpen ? t("status.open") : t("status.closed")}</span>
      <span className={tone === "light" ? "text-[#5f4a4b]" : "text-muted"}>
        · <StatusText status={status} />
      </span>
    </span>
  );
}

/** Hero badge: open if ANY branch is open, with a count. */
export function AnyOpenBadge({ branches, closures, timeZone }: { branches: Branch[]; closures: Closure[]; timeZone: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState<number | null>(null);
  useEffect(() => {
    const update = () => setOpen(branches.filter((b) => getOpenStatus(b.hours, closures, b.id, timeZone).isOpen).length);
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [branches, closures, timeZone]);
  if (open === null) return <span className="inline-block h-8 w-44 rounded-full bg-white/50" aria-hidden="true" />;
  return (
    <span className="inline-flex h-8 items-center gap-2 rounded-full bg-white/95 px-3 text-[13px] text-[#1a1112] shadow-sm backdrop-blur">
      <span className={`size-2 rounded-full ${open > 0 ? "bg-green-500 shadow-[0_0_0_4px_rgba(34,197,94,.25)]" : "bg-red-600"}`} aria-hidden="true" />
      <span className="font-semibold">{open > 0 ? t("status.open") : t("status.closed")}</span>
      <span className="text-[#5f4a4b]">· {t("status.branchesOpen", { count: open, total: branches.length })}</span>
    </span>
  );
}
