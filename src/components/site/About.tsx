"use client";

import { useI18n } from "@/i18n/I18nProvider";
import type { Settings } from "@/lib/types";
import Img from "./Img";

/** Our story: photo with a floating logo badge + the story text. */
export default function About({ settings }: { settings: Settings }) {
  const { t, pick } = useI18n();
  const story = pick(settings.story, settings.story_am);
  if (!story) return null;
  const [first, ...rest] = story.split(/\n\s*\n/);
  return (
    <section id="about" aria-labelledby="about-title" className="section bg-surface/60 dark:bg-surface/30">
      <div className="container-site grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        {settings.about_image && (
          <div className="relative" data-reveal>
            <div className="img-zoom relative aspect-[4/3] overflow-hidden rounded-[22px] bg-border shadow-2xl shadow-black/15">
              <Img src={settings.about_image} blur={settings.about_blur} alt={pick(settings.about_image_alt, settings.about_image_alt_am)} fill sizes="(min-width:1024px) 560px, 100vw" className="object-cover" />
            </div>
            {settings.logo_url && (
              <div className="card absolute -right-2 -bottom-6 flex items-center gap-3 px-4 py-3 sm:right-6">
                <Img src={settings.logo_url} alt="" width={61} height={40} className="h-10 w-auto" />
                <span className="text-[13px] leading-tight font-semibold">
                  {pick(settings.name, settings.name_am)}
                  <span className="block font-normal text-muted">Addis Ababa</span>
                </span>
              </div>
            )}
          </div>
        )}
        <div data-reveal>
          <p className="eyebrow mb-3">{t("about.eyebrow")}</p>
          <h2 id="about-title" className="h2">
            {pick(settings.name, settings.name_am)}
          </h2>
          <p className="mt-5 text-[18px] leading-relaxed font-medium text-ink lg:text-[20px]">{first}</p>
          <div className="lead mt-4 space-y-4">
            {rest.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
