import QRCode from "qrcode";
import { requirePageAdmin } from "@/lib/admin/auth";
import { userClient } from "@/lib/supabase/server";
import { PageTitle } from "@/components/admin/ui";
import PrintButton from "@/components/admin/PrintButton";

/**
 * Printable QR codes for tables, flyers and the door: scanning opens the
 * menu (optionally pre-filtered for one branch). Generated on the server.
 */
export default async function QrPage() {
  await requirePageAdmin();
  const db = await userClient();
  const [{ data: settings }, { data: branches }] = await Promise.all([
    db.from("restaurant_settings").select("name, name_am, logo_url, seo").eq("id", 1).single(),
    db.from("branches").select("slug, name, name_am, kind").eq("is_published", true).order("sort"),
  ]);
  const site = (process.env.NEXT_PUBLIC_SITE_URL || settings?.seo?.siteUrl || "").replace(/\/$/, "");
  const targets = [
    { key: "menu", title: "Full menu", title_am: "ሙሉ ምግብ ዝርዝር", url: `${site}/menu/` },
    ...(branches ?? []).filter((b) => b.kind !== "catering").map((b) => ({ key: b.slug, title: b.name, title_am: b.name_am, url: `${site}/menu/?branch=${b.slug}` })),
  ];
  const codes = await Promise.all(targets.map(async (t) => ({ ...t, svg: await QRCode.toString(t.url, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#1a1112", light: "#ffffff" } }) })));

  return (
    <>
      <PageTitle title="QR codes" lead="Print these for tables, the entrance or flyers. Guests scan with their phone camera and the menu opens (in English or Amharic).">
        <PrintButton />
      </PageTitle>
      {!process.env.NEXT_PUBLIC_SITE_URL && <p className="mb-4 rounded-[10px] bg-amber-50 p-3 text-[14px] text-amber-900">Set NEXT_PUBLIC_SITE_URL to your real domain before printing.</p>}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-2 print:gap-6">
        {codes.map((c) => (
          <li key={c.key} className="card flex flex-col items-center p-6 text-center break-inside-avoid print:border-2 print:shadow-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {settings?.logo_url && <img src={settings.logo_url} alt="" className="h-10 w-auto" />}
            <p className="mt-3 text-[13px] font-bold tracking-[0.12em] text-muted uppercase">Scan for our menu · ምግብ ዝርዝር</p>
            <div className="mt-3 w-full max-w-[220px] rounded-[12px] bg-white p-3" dangerouslySetInnerHTML={{ __html: c.svg }} />
            <p className="h3 mt-3">{c.title}</p>
            {c.title_am && <p className="text-[14px] text-muted">{c.title_am}</p>}
            <p className="mt-2 text-[11px] break-all text-muted">{c.url}</p>
            <a href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(c.svg)}`} download={`qr-${c.key}.svg`} className="btn btn-secondary btn-sm mt-3 print:hidden">
              Download SVG
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
