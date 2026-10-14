"use client";

import { saveSettings } from "@/app/admin/actions";
import type { Settings } from "@/lib/types";
import { ActionForm, BiField, Checkbox, Field, PhotoInput } from "./ui";

const FONTS = [
  ["nunito", "Nunito (rounded, friendly, matches the logo)"],
  ["fraunces", "Fraunces (elegant serif)"],
  ["playfair", "Playfair Display (classic serif)"],
];

export function GeneralForm({ s }: { s: Settings }) {
  return (
    <ActionForm action={saveSettings} className="space-y-4">
      <input type="hidden" name="section" value="general" />
      <BiField name="name" label="Restaurant name" en={s.name} am={s.name_am} required />
      <BiField name="tagline" label="Tagline (one line under the name)" en={s.tagline} am={s.tagline_am} />
      <BiField name="story" label="Our story (blank line = new paragraph)" en={s.story} am={s.story_am} textarea rows={6} />
      <div className="grid gap-4 sm:grid-cols-2">
        <PhotoInput name="hero_photo" current={s.hero_image} label="Big photo at the top (hero)" hint="Your best food or interior photo, landscape, ideally 1600px wide or more." />
        <PhotoInput name="about_photo" current={s.about_image} label="“Our story” photo" hint="People, kitchen or interior." />
      </div>
      <BiField name="hero_image_alt" label="Describe the hero photo (for blind visitors & Google)" en={s.hero_image_alt} am={s.hero_image_alt_am} />
      <BiField name="about_image_alt" label="Describe the story photo" en={s.about_image_alt} am={s.about_image_alt_am} />
    </ActionForm>
  );
}

export function ContactForm({ s }: { s: Settings }) {
  return (
    <ActionForm action={saveSettings} className="space-y-4">
      <input type="hidden" name="section" value="contact" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Main phone numbers" hint="One per line. The first one is used for “Call” and “Book a table”.">
          <textarea name="phones" rows={3} defaultValue={s.contact.phones?.join("\n")} className="field" />
        </Field>
        <div className="space-y-4">
          <Field label="WhatsApp number" hint="International format, e.g. +251 911 222 097. Empty = hide WhatsApp buttons.">
            <input name="whatsapp" defaultValue={s.contact.whatsapp ?? ""} className="field" />
          </Field>
          <Field label="Telegram username (optional)">
            <input name="telegram" defaultValue={s.contact.telegram ?? ""} className="field" placeholder="mamaskitchen" />
          </Field>
        </div>
        <Field label="Email (optional)">
          <input name="email" type="email" defaultValue={s.contact.email ?? ""} className="field" />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {(["facebook", "instagram", "tiktok", "youtube"] as const).map((k) => (
          <Field key={k} label={k[0].toUpperCase() + k.slice(1) + " link"}>
            <input name={k} type="url" defaultValue={s.socials[k] ?? ""} className="field" />
          </Field>
        ))}
      </div>
    </ActionForm>
  );
}

export function SeoForm({ s }: { s: Settings }) {
  return (
    <ActionForm action={saveSettings} className="space-y-4">
      <input type="hidden" name="section" value="seo" />
      <Field label="Website address" hint="e.g. https://mamaskitchenethiopia.com (used for Google and social previews)">
        <input name="siteUrl" type="url" defaultValue={s.seo.siteUrl ?? ""} className="field" />
      </Field>
      <Field label="Google title" hint="~60 characters. What people see in Google results.">
        <input name="title" defaultValue={s.seo.title ?? ""} maxLength={80} className="field" />
      </Field>
      <Field label="Google description" hint="~155 characters.">
        <textarea name="description" rows={3} maxLength={200} defaultValue={s.seo.description ?? ""} className="field" />
      </Field>
      <Field label="Keywords" hint="One per line">
        <textarea name="keywords" rows={4} defaultValue={s.seo.keywords?.join("\n")} className="field" />
      </Field>
    </ActionForm>
  );
}

export function FeaturesForm({ s }: { s: Settings }) {
  const f = s.features;
  return (
    <ActionForm action={saveSettings} className="space-y-3">
      <input type="hidden" name="section" value="features" />
      <Field label="Heading font">
        <select name="heading" defaultValue={s.fonts?.heading ?? "nunito"} className="field">
          {FONTS.map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </select>
      </Field>
      <p className="label mt-2">Sections shown on the website</p>
      <div className="grid sm:grid-cols-2">
        <Checkbox name="events" label="Live music & events" defaultChecked={f.events !== false} />
        <Checkbox name="catering" label="Catering" defaultChecked={f.catering !== false} />
        <Checkbox name="inn" label="Mama's Inn (hotel)" defaultChecked={f.inn !== false} />
        <Checkbox name="gallery" label="Gallery" defaultChecked={f.gallery !== false} />
        <Checkbox name="reviews" label="Reviews" defaultChecked={f.reviews !== false} />
        <Checkbox name="announcements" label="Announcement bar" defaultChecked={f.announcements !== false} />
        <Checkbox name="booking" label="Online table booking & catering forms" defaultChecked={f.booking !== false} hint="Requests appear in Admin → Bookings" />
        <Checkbox name="orders" label="Order tray (send order on WhatsApp)" defaultChecked={f.orders !== false} hint="Needs a WhatsApp number or Telegram" />
        <Checkbox name="darkMode" label="Dark mode switch on the website" defaultChecked={f.darkMode !== false} />
      </div>
    </ActionForm>
  );
}

export function SectionForm({ s, section }: { s: Settings; section: "catering" | "inn" }) {
  const d = s.sections[section] as Record<string, unknown> | undefined;
  const v = (k: string) => (d?.[k] as string | undefined) ?? "";
  return (
    <ActionForm action={saveSettings} className="space-y-4">
      <input type="hidden" name="section" value={section} />
      <BiField name="title" label="Title" en={v("title")} am={v("title_am")} />
      <BiField name="text" label="Text" en={v("text")} am={v("text_am")} textarea rows={3} />
      {section === "catering" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Bullet points (English, one per line)">
            <textarea name="points" rows={3} defaultValue={((d?.points as string[]) ?? []).join("\n")} className="field" />
          </Field>
          <Field label="Bullet points (አማርኛ)">
            <textarea name="points_am" lang="am" rows={3} defaultValue={((d?.points_am as string[]) ?? []).join("\n")} className="field" />
          </Field>
        </div>
      )}
      {section === "inn" && <BiField name="locations" label="Locations" en={v("locations")} am={v("locations_am")} />}
      <PhotoInput current={v("image")} />
    </ActionForm>
  );
}

export function HighlightsForm({ s }: { s: Settings }) {
  return (
    <ActionForm action={saveSettings} className="space-y-4">
      <input type="hidden" name="section" value="highlights" />
      {s.highlights.map((h, i) => (
        <fieldset key={h.key} className="space-y-2 rounded-[8px] border border-border p-3">
          <legend className="px-1 text-[13px] font-semibold">Highlight {i + 1}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <input name={`title_${i}`} defaultValue={h.title} className="field" aria-label="Title (English)" />
            <input name={`title_am_${i}`} defaultValue={h.title_am ?? ""} lang="am" className="field" aria-label="Title (Amharic)" />
            <input name={`text_${i}`} defaultValue={h.text ?? ""} className="field" aria-label="Short text (English)" placeholder="Short text" />
            <input name={`text_am_${i}`} defaultValue={h.text_am ?? ""} lang="am" className="field" aria-label="Short text (Amharic)" />
          </div>
          <Field label="Link" hint="e.g. /menu/?filter=fasting or /#events">
            <input name={`href_${i}`} defaultValue={h.href} className="field" />
          </Field>
          <PhotoInput name={`photo_${i}`} current={h.image} label="Photo" />
        </fieldset>
      ))}
    </ActionForm>
  );
}
