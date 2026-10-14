import { mapEmbedUrl } from "@/lib/format";
import type { SiteData } from "@/lib/types";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Structured data for Google: one Organization + one Restaurant per branch
 * (address, phone, hours, menu). Generated from the database.
 */
export default function JsonLd({ data, siteUrl }: { data: SiteData; siteUrl: string }) {
  const { settings, branches } = data;
  const org = `${siteUrl}/#org`;
  const graph = [
    {
      "@type": "Organization",
      "@id": org,
      name: settings.name,
      alternateName: settings.name_am ?? undefined,
      url: `${siteUrl}/`,
      logo: settings.logo_url ? `${siteUrl}${settings.logo_url}` : undefined,
      sameAs: Object.values(settings.socials).filter(Boolean),
    },
    ...branches
      .filter((b) => b.kind !== "catering")
      .map((b) => ({
        "@type": "Restaurant",
        "@id": `${siteUrl}/#branch-${b.slug}`,
        name: `${settings.name}, ${b.name}`,
        parentOrganization: { "@id": org },
        image: b.photo_url ? `${siteUrl}${b.photo_url}` : undefined,
        url: `${siteUrl}/#branches`,
        telephone: b.phones[0],
        servesCuisine: ["Ethiopian", "International"],
        priceRange: "$$",
        currenciesAccepted: settings.currency,
        acceptsReservations: true,
        hasMap: mapEmbedUrl(b.map_query ?? b.name).replace("&output=embed", ""),
        address: { "@type": "PostalAddress", streetAddress: b.address, addressLocality: "Addis Ababa", addressCountry: "ET" },
        ...(b.lat && b.lng ? { geo: { "@type": "GeoCoordinates", latitude: b.lat, longitude: b.lng } } : {}),
        openingHoursSpecification: b.hours
          .filter((h) => !h.closed && h.open_time && h.close_time)
          .map((h) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: DAYS[h.weekday], opens: h.open_time!.slice(0, 5), closes: h.close_time!.slice(0, 5) })),
        hasMenu: `${siteUrl}/menu/`,
      })),
  ];
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c") }}
    />
  );
}
