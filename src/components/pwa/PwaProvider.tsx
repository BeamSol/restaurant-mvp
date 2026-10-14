"use client";

/**
 * PWA glue: registers the service worker (public/sw.js) and offers
 * "Install app": the native prompt on Android/Chrome, a short how-to on iPhone.
 * Shown once, a little after the guest starts browsing; never inside the installed app.
 */
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { CloseIcon } from "../Icons";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };
const DISMISS_KEY = "pwa-install-dismissed";

export default function PwaProvider({ logo, name }: { logo: string | null; name: string }) {
  const { t } = useI18n();
  const [deferred, setDeferred] = useState<InstallEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Register only after the page has fully loaded and the phone is idle, so
    // saving pages for offline use never slows down the first visit.
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      const register = () => navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {});
      const idle = () => ("requestIdleCallback" in window ? requestIdleCallback(register, { timeout: 8000 }) : setTimeout(register, 3000));
      if (document.readyState === "complete") setTimeout(idle, 2500);
      else window.addEventListener("load", () => setTimeout(idle, 2500), { once: true });
    }
    const standalone = matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone;
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISS_KEY) === "1";
    } catch {}
    if (standalone || dismissed) return;

    const onPrompt = (e: Event) => {
      e.preventDefault(); // we show our own, nicer prompt
      setDeferred(e as InstallEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent);
    setIos(isIos);
    // Don't interrupt right away: wait until they've looked around a bit.
    const timer = setTimeout(() => setShow(true), 12000);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      clearTimeout(timer);
    };
  }, []);

  const dismiss = () => {
    setShow(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  };

  if (!show || (!deferred && !ios)) return null;
  return (
    <div role="dialog" aria-label={t("pwa.installTitle")} className="card fixed inset-x-3 bottom-[80px] z-50 flex items-start gap-3 p-4 animate-fade-up sm:right-6 sm:left-auto sm:w-[380px] lg:bottom-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {logo && <img src="/icons/icon-192.png" alt="" className="size-12 shrink-0 rounded-[12px] ring-1 ring-border" />}
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-extrabold">{t("pwa.installTitle").replace("Mama's Kitchen", name)}</p>
        <p className="text-secondary mt-0.5">{ios && !deferred ? t("pwa.iosHint") : t("pwa.installText")}</p>
        <div className="mt-3 flex gap-2">
          {deferred && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={async () => {
                await deferred.prompt();
                await deferred.userChoice.catch(() => null);
                setDeferred(null);
                dismiss();
              }}
            >
              {t("pwa.install")}
            </button>
          )}
          <button type="button" className="btn btn-ghost btn-sm !text-muted" onClick={dismiss}>
            {t("pwa.later")}
          </button>
        </div>
      </div>
      <button type="button" onClick={dismiss} aria-label={t("pwa.later")} className="btn btn-ghost btn-icon btn-sm -mt-1 -mr-1 !text-muted">
        <CloseIcon size={18} />
      </button>
    </div>
  );
}
