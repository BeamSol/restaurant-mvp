import { I18nProvider } from "@/i18n/I18nProvider";
import { getSiteData } from "@/lib/data";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import MobileBar from "@/components/site/MobileBar";
import JsonLd from "@/components/site/JsonLd";
import RevealObserver from "@/components/site/RevealObserver";
import { OrderProvider } from "@/components/site/order/OrderProvider";
import OrderTray from "@/components/site/order/OrderTray";

/** Public website shell: header (+announcement), footer, mobile bar, order tray, JSON-LD. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const data = await getSiteData();
  const { settings } = data;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || settings.seo.siteUrl || "").replace(/\/$/, "");
  const orders = settings.features.orders !== false && !!(settings.contact.whatsapp || settings.contact.telegram);
  return (
    <I18nProvider>
      <OrderProvider>
        <JsonLd data={data} siteUrl={siteUrl} />
        <a href="#main" className="sr-only z-[60] rounded-[10px] bg-ink px-4 py-2 text-bg focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
          Skip to content
        </a>
        <Header settings={settings} announcement={data.announcements[0]} />
        {children}
        <Footer settings={settings} branches={data.branches} />
        <MobileBar settings={settings} />
        {orders && <OrderTray settings={settings} branches={data.branches} />}
        <RevealObserver />
      </OrderProvider>
    </I18nProvider>
  );
}
