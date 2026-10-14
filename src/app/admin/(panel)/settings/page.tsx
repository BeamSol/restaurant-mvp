import { requirePageAdmin } from "@/lib/admin/auth";
import { userClient } from "@/lib/supabase/server";
import BrandingEditor from "@/components/admin/BrandingEditor";
import { ContactForm, FeaturesForm, GeneralForm, HighlightsForm, SectionForm, SeoForm } from "@/components/admin/SettingsForms";
import { PageTitle } from "@/components/admin/ui";
import type { Settings } from "@/lib/types";

const SECTIONS = [
  ["branding", "Logo & colors"],
  ["general", "Name, story & main photos"],
  ["contact", "Phones, WhatsApp & social media"],
  ["highlights", "Home page highlights"],
  ["catering", "Catering section"],
  ["inn", "Mama's Inn section"],
  ["features", "Font & sections on/off"],
  ["seo", "Google & sharing (SEO)"],
] as const;

export default async function SettingsPage() {
  await requirePageAdmin("OWNER");
  const db = await userClient();
  const { data } = await db.from("restaurant_settings").select("*").eq("id", 1).single();
  const s = data as Settings;
  const body: Record<string, React.ReactNode> = {
    branding: <BrandingEditor logoUrl={s.logo_url} tokens={s.tokens} palette={s.palette} />,
    general: <GeneralForm s={s} />,
    contact: <ContactForm s={s} />,
    highlights: <HighlightsForm s={s} />,
    catering: <SectionForm s={s} section="catering" />,
    inn: <SectionForm s={s} section="inn" />,
    features: <FeaturesForm s={s} />,
    seo: <SeoForm s={s} />,
  };
  return (
    <>
      <PageTitle title="Settings" lead="Owner only. Each section saves separately." />
      <div className="space-y-3">
        {SECTIONS.map(([key, label], i) => (
          <details key={key} className="card p-4" open={i === 0}>
            <summary className="cursor-pointer text-[15px] font-semibold">{label}</summary>
            <div className="mt-4">{body[key]}</div>
          </details>
        ))}
      </div>
    </>
  );
}
