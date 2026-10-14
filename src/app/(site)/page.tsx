import { getSiteData } from "@/lib/data";
import Hero from "@/components/site/Hero";
import Highlights from "@/components/site/Highlights";
import SignatureDishes from "@/components/site/SignatureDishes";
import Events from "@/components/site/Events";
import Booking from "@/components/site/Booking";
import Branches from "@/components/site/Branches";
import PhotoFeature from "@/components/site/PhotoFeature";
import About from "@/components/site/About";
import Reviews from "@/components/site/Reviews";

export default async function HomePage() {
  const data = await getSiteData();
  const { settings } = data;
  const f = settings.features;
  const featured = data.items.filter((i) => i.is_featured).slice(0, 6);
  const orders = f.orders !== false && !!(settings.contact.whatsapp || settings.contact.telegram);
  // Booking photo: a lounge/interior shot from the gallery if there is one
  const bookPhoto = data.gallery.find((g) => /vip|lounge|room|dining/i.test(g.url)) ?? data.gallery[0];
  return (
    <main id="main">
      <Hero settings={settings} branches={data.branches.filter((b) => b.kind !== "catering")} closures={data.closures} />
      <Highlights items={settings.highlights} />
      <SignatureDishes items={featured} currency={settings.currency} orders={orders} />
      {f.events !== false && <Events events={data.events} branches={data.branches} book={f.booking !== false} />}
      {f.booking !== false && <Booking settings={settings} branches={data.branches} photo={bookPhoto ? { url: bookPhoto.url, blur: bookPhoto.blur } : undefined} />}
      <Branches branches={data.branches} closures={data.closures} timeZone={settings.timezone} />
      <PhotoFeature settings={settings} branches={data.branches} />
      <About settings={settings} />
      {f.reviews !== false && <Reviews reviews={data.testimonials} />}
    </main>
  );
}
