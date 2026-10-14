"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import type { GalleryImage } from "@/lib/types";
import Img from "./Img";
import SectionTitle from "./SectionTitle";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "../Icons";

/** Photo grid + native <dialog> lightbox (Esc, arrows, swipe). */
export default function Gallery({ images }: { images: GalleryImage[] }) {
  const { t, pick } = useI18n();
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState<number | null>(null);
  const touchX = useRef<number | null>(null);
  const step = useCallback((d: number) => setIndex((i) => (i === null ? i : (i + d + images.length) % images.length)), [images.length]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => (e.key === "ArrowRight" ? step(1) : e.key === "ArrowLeft" ? step(-1) : null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, step]);

  if (!images.length) return null;
  const current = index !== null ? images[index] : null;

  return (
    <section id="gallery" aria-labelledby="gallery-title" className="section">
      <div className="container-site">
        <SectionTitle id="gallery-title" eyebrow={t("gallery.eyebrow")} title={t("gallery.title")} />
        <ul className="grid auto-rows-[1fr] grid-cols-3 gap-2 lg:grid-cols-5 lg:gap-3" data-reveal>
          {images.map((img, i) => (
            <li key={img.id} className={i === 0 ? "col-span-2 row-span-2" : ""}>
              <button
                type="button"
                onClick={() => {
                  setIndex(i);
                  dialog.current?.showModal();
                }}
                aria-label={t("gallery.open", { n: i + 1 })}
                className="img-zoom group relative block aspect-square size-full overflow-hidden rounded-[12px] bg-border lg:rounded-[16px]"
              >
                <Img src={img.url} blur={img.blur} alt={pick(img.alt, img.alt_am)} fill sizes={i === 0 ? "(min-width:1024px) 460px, 66vw" : "(min-width:1024px) 230px, 33vw"} className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <dialog
        ref={dialog}
        onClose={() => setIndex(null)}
        aria-label={t("gallery.title")}
        className="m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 text-white"
      >
        {current && index !== null && (
          <div
            className="flex h-full flex-col items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
              touchX.current = null;
            }}
          >
            <div className="relative h-[70vh] w-full max-w-5xl">
              <Img src={current.url} blur={current.blur} alt={pick(current.alt, current.alt_am)} fill sizes="100vw" className="object-contain" />
            </div>
            <p className="mt-3 text-center text-[14px] text-white/80">
              {pick(current.alt, current.alt_am)} · {t("gallery.counter", { n: index + 1, total: images.length })}
            </p>
            <button type="button" onClick={() => dialog.current?.close()} aria-label={t("gallery.close")} className="absolute top-3 right-3 inline-flex size-10 items-center justify-center rounded-full bg-white/15 hover:bg-white/25">
              <CloseIcon size={20} />
            </button>
            <button type="button" onClick={() => step(-1)} aria-label={t("gallery.prev")} className="absolute top-1/2 left-2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 hover:bg-white/25">
              <ChevronLeftIcon size={20} />
            </button>
            <button type="button" onClick={() => step(1)} aria-label={t("gallery.next")} className="absolute top-1/2 right-2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 hover:bg-white/25">
              <ChevronRightIcon size={20} />
            </button>
          </div>
        )}
      </dialog>
    </section>
  );
}
