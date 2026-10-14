/**
 * Seed data for Mama's Kitchen, from the research in RESEARCH_NOTES.md.
 *
 * Anything not confirmed on the official site has `needs_review: true` and a
 * `review_note` explaining what to check. These appear in Admin → Needs review.
 *
 * Loaded into the database by `npm run db:seed`.
 */

const R = (note: string) => ({ needs_review: true, review_note: note });
const PRICE_NOTE = "Price from Foodtolo delivery app (date unknown, may include VAT/app markup). Confirm current price.";

export const settings = {
  name: "Mama's Kitchen",
  name_am: "ማማስ ኪችን",
  tagline: "Healthy, tasty food in a classy setting, all across Addis Ababa.",
  tagline_am: "ጤናማና ጣፋጭ ምግብ በሚያምር ቦታ፣ በመላው አዲስ አበባ።",
  story:
    "For years, Mama's Kitchen has been one of Addis Ababa's favourite places to eat. Our chefs are known for a five-course meal you won't find anywhere else: a warming soup, courses served with fresh fruit and salad, and our special tea to bring it all together.\n\nCome for the fasting lunch buffet, a steak or a plate of tibs; stay for a cocktail and live music with some of the best bands in town. We buy from local farms, donate food to charitable causes, and let one rule guide everything we cook: taste.",
  story_am:
    "ማማስ ኪችን ለዓመታት በአዲስ አበባ ከሚወደዱ የምግብ ቦታዎች አንዱ ነው። ሼፎቻችን በሌላ ቦታ በማያገኙት ባለ አምስት ኮርስ ምግብ ይታወቃሉ፤ በሚያሞቅ ሾርባ ይጀምራል፣ በትኩስ ፍራፍሬና ሰላጣ የታጀቡ ምግቦች ይከተላሉ፣ በልዩ ሻያችን ይጠናቀቃል።\n\nለጾም ምሳ ቡፌ፣ ለስቴክ ወይም ለጥብስ ይምጡ፤ በከተማው ካሉ ምርጥ ባንዶች ጋር ለኮክቴልና ለቀጥታ ሙዚቃ ይቆዩ። ከአካባቢው ገበሬዎች እንገዛለን፣ ለበጎ አድራጎት ምግብ እንለግሳለን፣ የምናበስለውን ሁሉ የሚመራው አንድ ሕግ ነው፤ ጣዕም።",
  logo_url: "/restaurant/logo.png",
  hero_image: "/restaurant/hero.webp",
  hero_image_alt: "Grilled chicken breast with vegetables in the dining room of our Ministry of Mines branch",
  hero_image_alt_am: "በማዕድን ሚኒስቴር ቅርንጫፋችን የተጠበሰ የዶሮ ፍርምባ ከአትክልት ጋር",
  about_image: "/restaurant/about.webp",
  about_image_alt: "Leather sofas and wooden walls in one of our lounges",
  about_image_alt_am: "በአንዱ ላውንጃችን ውስጥ የቆዳ ሶፋዎችና የእንጨት ግድግዳዎች",
  fonts: { heading: "nunito" },
  contact: {
    phones: ["+251 911 222 097", "+251 911 222 098"],
    whatsapp: "+251 911 222 097",
    telegram: "",
    email: "",
  },
  socials: {
    facebook: "https://www.facebook.com/MamasKitchenAddisAbaba",
    instagram: "https://www.instagram.com/mamaskitchenaddisababa/",
    youtube: "https://www.youtube.com/watch?v=81jHVkKy4ws",
    tiktok: "",
  },
  seo: {
    siteUrl: "https://mamaskitchenethiopia.com",
    title: "Mama's Kitchen Addis Ababa | Restaurant, Live Music & Catering",
    description:
      "Mama's Kitchen: healthy, tasty food at branches across Addis Ababa. Five-course meals, fasting (የጾም) lunch buffet, steaks, pizza, cocktails, live music nights and catering.",
    keywords: ["Mama's Kitchen", "Addis Ababa restaurant", "fasting buffet", "የጾም ምግብ", "live music Addis", "catering Addis Ababa", "ማማስ ኪችን"],
  },
  features: { events: true, gallery: true, reviews: true, catering: true, inn: true, announcements: true, booking: true, orders: true, darkMode: true },
  highlights: [
    { key: "five-course", title: "Five-course meal", title_am: "ባለ አምስት ኮርስ ምግብ", text: "Soup to special tea", text_am: "ከሾርባ እስከ ልዩ ሻይ", image: "/restaurant/highlights/five-course.webp", href: "/menu/?q=five" },
    { key: "fasting-buffet", title: "Fasting buffet", title_am: "የጾም ቡፌ", text: "Lunch, Mon–Fri", text_am: "ምሳ፣ ሰኞ–ዓርብ", image: "/restaurant/highlights/fasting-buffet.webp", href: "/menu/?filter=fasting" },
    { key: "live-music", title: "Live music nights", title_am: "የቀጥታ ሙዚቃ ምሽቶች", text: "Jazz, bands & jam", text_am: "ጃዝ፣ ባንድና ጃም", image: "/restaurant/highlights/live-music.webp", href: "/#events" },
    { key: "catering", title: "Catering", title_am: "የምግብ ዝግጅት", text: "Offices & events", text_am: "ለቢሮና ለዝግጅቶች", image: "/restaurant/highlights/catering.webp", href: "/#catering" },
  ],
  sections: {
    catering: {
      title: "Catering for offices, weddings & events",
      title_am: "ለቢሮ፣ ለሠርግና ለዝግጅቶች የምግብ አገልግሎት",
      text: "From a daily staff cafeteria to take-away trays and after-wedding parties, our catering team brings Mama's Kitchen food and service to you: generous portions, fresh ingredients, no preservatives.",
      text_am: "ከዕለታዊ የሠራተኞች ካፊቴሪያ እስከ ይዞ መሄጃ ትሪዎችና ከሠርግ በኋላ ግብዣዎች ድረስ የምግብ ዝግጅት ቡድናችን የማማስ ኪችንን ምግብና መስተንግዶ ወደ እርስዎ ያመጣል፤ በቂ መጠን፣ ትኩስ ግብዓቶች፣ ምንም ማቆያ ኬሚካል የሌለው።",
      image: "/restaurant/catering.webp",
      points: ["Office & staff cafeterias", "Take-away catering trays", "Weddings & after-wedding parties"],
      points_am: ["የቢሮና የሠራተኞች ካፊቴሪያ", "ይዞ መሄጃ የምግብ ትሪዎች", "ሠርግና ከሠርግ በኋላ ግብዣ"],
    },
    inn: {
      title: "Stay at Mama's Inn",
      title_am: "በማማስ ኢን ያርፉ",
      text: "Neat, comfortable rooms at our boutique hotel, with Mama's Kitchen food and drinks downstairs.",
      text_am: "በቡቲክ ሆቴላችን ንጹሕና ምቹ ክፍሎች፣ ከማማስ ኪችን ምግብና መጠጥ ጋር።",
      image: "/restaurant/mamas-inn.webp",
      locations: "Hayahulet (22) · Meskel Flower",
      locations_am: "ሃያ ሁለት · መስቀል ፍላወር",
    },
  },
  timezone: "Africa/Addis_Ababa",
  currency: "ETB",
  agency: { name: "[OUR AGENCY NAME]", url: "https://example.com" },
  needs_review: [
    "contact.whatsapp: WhatsApp assumed on +251 911 222 097; not published anywhere. Confirm.",
    "contact.email: official email info@mamaskitchenethiopia.com uses the expired domain; left empty.",
    "seo.siteUrl: mamaskitchenethiopia.com is suspended/expired (2025). Renew or choose a new domain.",
    "sections.inn: Mama's Inn locations from a Tripadvisor caption; is the hotel still operating?",
    "highlights.fasting-buffet: 'Mon–Fri' from a 2018 poster; confirm days & price.",
  ],
};

/* ------------------------------------------------------------------ */

const PHONES = ["+251 911 222 097", "+251 911 222 098"];
const HOURS_NOTE = "No official opening hours were ever published; seeded 08:00–22:00 daily. Confirm.";

export const branches = [
  {
    slug: "bole-medhanialem",
    name: "Bole Medhanialem (Baritone Lounge)",
    name_am: "ቦሌ መድኃኔዓለም (ባሪቶን ላውንጅ)",
    kind: "restaurant",
    address: "Bole Medhanialem, behind Mafi Mall",
    address_am: "ቦሌ መድኃኔዓለም፣ ከማፊ ሞል ጀርባ",
    description: "Our Baritone Lounge: fine dining for lunch and dinner, the fasting lunch buffet and a sports bar.",
    description_am: "ባሪቶን ላውንጅ፤ ለምሳና ለእራት፣ የጾም ምሳ ቡፌና የስፖርት ባር።",
    phones: PHONES,
    map_query: "Mama's Kitchen Bole Medhanialem Mafi Mall Addis Ababa",
    photo_url: "/restaurant/branches/bole-medhanialem.webp",
    photo_alt: "Mama's Kitchen building at Bole Medhanialem",
    features: ["buffet", "vip"],
    hours: "08:00-22:00",
    ...R(HOURS_NOTE + " Your brief said Baritone is 'near Bole Rock' and Tripadvisor says 'Cameroon Street'; the official site says 'behind Mafi Mall'."),
  },
  {
    slug: "4-killo",
    name: "4 Killo",
    name_am: "4 ኪሎ",
    kind: "restaurant",
    address: "4 Killo, in front of Menelik II Secondary School",
    address_am: "4 ኪሎ፣ ከዳግማዊ ምኒልክ ሁለተኛ ደረጃ ትምህርት ቤት ፊት ለፊት",
    description: "A classy restaurant in the centre of Addis: healthy, tasty food and the variety you want.",
    description_am: "በአዲስ አበባ እምብርት የሚገኝ ውብ ምግብ ቤት፤ ጤናማና ጣፋጭ ምግብ በብዙ ምርጫ።",
    phones: PHONES,
    map_query: "Mama's Kitchen 4 Kilo Addis Ababa",
    photo_url: "/restaurant/branches/4-killo.webp",
    photo_alt: "Covered terrace at the 4 Killo branch",
    features: [],
    hours: "08:00-22:00",
    ...R(HOURS_NOTE),
  },
  {
    slug: "ministry-of-mines",
    name: "Ministry of Mines",
    name_am: "ማዕድን ሚኒስቴር",
    kind: "restaurant",
    address: "Salite Mihret, inside the Ministry of Mines compound",
    address_am: "ሰላም ምሕረት (ሳሊተ ምሕረት)፣ በማዕድን ሚኒስቴር ግቢ ውስጥ",
    description: "Our newest branch (opened Nov 2021): bright, classy and affordable, with an open kitchen.",
    description_am: "አዲሱ ቅርንጫፋችን (ኅዳር 2014 የተከፈተ)፤ ብሩህ፣ ውብና ተመጣጣኝ፣ ክፍት ኩሽና ያለው።",
    phones: PHONES,
    map_query: "Ministry of Mines Addis Ababa",
    photo_url: "/restaurant/branches/ministry-of-mines.webp",
    photo_alt: "Long wooden dining table at the Ministry of Mines branch",
    features: [],
    hours: "08:00-22:00",
    ...R(HOURS_NOTE + " Amharic area name 'ሰላም ምሕረት / ሳሊተ ምሕረት' to confirm."),
  },
  {
    slug: "entoto-park",
    name: "Entoto Park",
    name_am: "እንጦጦ ፓርክ",
    kind: "restaurant",
    address: "Inside Entoto Park",
    address_am: "በእንጦጦ ፓርክ ውስጥ",
    description: "Garden dining in the fresh air of Entoto: the best place to host events.",
    description_am: "በእንጦጦ ንጹሕ አየር ውስጥ የአትክልት ስፍራ ምግብ ቤት፤ ዝግጅቶችን ለማዘጋጀት ምርጡ ቦታ።",
    phones: PHONES,
    map_query: "Entoto Park Addis Ababa",
    photo_url: "/restaurant/branches/entoto.webp",
    photo_alt: "Garden seating under umbrellas at the Entoto Park branch",
    features: ["garden", "events"],
    hours: "08:00-22:00",
    ...R(HOURS_NOTE),
  },
  {
    slug: "unity-park",
    name: "Unity Park",
    name_am: "አንድነት ፓርክ",
    kind: "restaurant",
    address: "Inside Unity Park",
    address_am: "በአንድነት ፓርክ ውስጥ",
    description: "Eat well while you explore Unity Park.",
    description_am: "አንድነት ፓርክን ሲጎበኙ በደንብ ይመገቡ።",
    phones: PHONES,
    map_query: "Unity Park Addis Ababa",
    photo_url: "/restaurant/gallery/fruit-carving.webp",
    photo_alt: "Fruit display by Mama's Kitchen",
    features: [],
    hours: "08:00-22:00",
    ...R("NEEDS PHOTO of this branch (currently a food photo). " + HOURS_NOTE + " Park opening hours may limit ours."),
  },
  {
    slug: "22-area",
    name: "22 Area",
    name_am: "ሃያ ሁለት",
    kind: "restaurant",
    address: "22 Area, next to Yohannes Kitfo",
    address_am: "ሃያ ሁለት፣ ከዮሐንስ ክትፎ አጠገብ",
    description: "Mama's Kitchen favourites in the heart of 22.",
    description_am: "የማማስ ኪችን ተወዳጅ ምግቦች በሃያ ሁለት።",
    phones: PHONES,
    map_query: "Yohannes Kitfo 22 Addis Ababa",
    photo_url: "/restaurant/gallery/lamb-tibs.webp",
    photo_alt: "Lamb tibs with injera from Mama's Kitchen",
    features: [],
    hours: "08:00-22:00",
    ...R("NEEDS PHOTO of this branch (currently a food photo). " + HOURS_NOTE),
  },
  {
    slug: "meskel-flower",
    name: "Meskel Flower",
    name_am: "መስቀል ፍላወር",
    kind: "restaurant",
    address: "Meskel Flower, around Dreamliner Hotel",
    address_am: "መስቀል ፍላወር፣ ድሪምላይነር ሆቴል አካባቢ",
    description: "Near Dreamliner Hotel, home of our second Mama's Inn.",
    description_am: "ከድሪምላይነር ሆቴል አጠገብ፤ የሁለተኛው ማማስ ኢን መገኛ።",
    phones: PHONES,
    map_query: "Dreamliner Hotel Meskel Flower Addis Ababa",
    photo_url: "/restaurant/gallery/buffet-lounge.webp",
    photo_alt: "Buffet set up in a Mama's Kitchen lounge",
    features: [],
    hours: "08:00-22:00",
    ...R("NEEDS PHOTO. Listed in the 2022 footer but missing from the 2023 one: is this branch still open? " + HOURS_NOTE),
  },
  {
    slug: "royal-lounge",
    name: "Royal Lounge (Wollo Sefer)",
    name_am: "ሮያል ላውንጅ (ወሎ ሰፈር)",
    kind: "lounge",
    address: "Wollo Sefer, in front of Tebaber Berta, Dani Plaza building",
    address_am: "ወሎ ሰፈር፣ ከተባበር በርታ ፊት ለፊት፣ ዳኒ ፕላዛ ሕንፃ",
    description: "Live music and DJs every night, cocktails and a VIP lounge.",
    description_am: "በየምሽቱ የቀጥታ ሙዚቃና ዲጄ፣ ኮክቴሎችና የቪአይፒ ላውንጅ።",
    phones: ["+251 911 222 133", "+251 911 222 097"],
    map_query: "Dani Plaza Wollo Sefer Addis Ababa",
    photo_url: "/restaurant/branches/royal-lounge.webp",
    photo_alt: "Warm-lit bar and seating at the Royal Lounge",
    features: ["live_music", "vip"],
    hours: "12:00-01:00",
    ...R("Royal Lounge appears in 2018–2021 material but NOT in the 2022–2023 branch list. Still open? Hours seeded 12:00–01:00 (assumption)."),
  },
  {
    slug: "catering-bole-moenco",
    name: "Catering (Bole Moenco)",
    name_am: "የምግብ ዝግጅት (ቦሌ ሞኤንኮ)",
    kind: "catering",
    address: "Bole Moenco",
    address_am: "ቦሌ ሞኤንኮ",
    description: "Our first branch, now home of Mama's Kitchen catering for offices and events.",
    description_am: "የመጀመሪያው ቅርንጫፋችን፤ አሁን ለቢሮና ለዝግጅቶች የማማስ ኪችን የምግብ ዝግጅት ማዕከል።",
    phones: PHONES,
    map_query: "Bole Moenco Addis Ababa",
    photo_url: "/restaurant/branches/catering-moenco.webp",
    photo_alt: "Catering fruit display by Mama's Kitchen",
    features: ["catering"],
    hours: "08:00-18:00",
    ...R("Branches page says catering is 'at Bole Medhanialem in front of Kebe Pastry'; the footer says 'Bole Moenco'. Which is current? NEEDS PHOTO of the catering site."),
  },
];

/* ------------------------------------------------------------------ */

type Tag = "fasting" | "vegetarian" | "spicy" | "popular" | "new";
interface Item {
  slug: string;
  name: string;
  name_am: string;
  description?: string;
  description_am?: string;
  price: number | null;
  photo?: string;
  tags?: Tag[];
  featured?: boolean;
  branches?: string[]; // branch slugs; empty = all
  note?: string;
}

const I = (slug: string, name: string, name_am: string, price: number | null, extra: Partial<Item> = {}): Item => ({ slug, name, name_am, price, ...extra });

export const menu: { slug: string; name: string; name_am: string; items: Item[] }[] = [
  {
    slug: "specials",
    name: "Mama's Kitchen Specials",
    name_am: "የማማስ ኪችን ልዩ ምግቦች",
    items: [
      I("five-course-meal", "Five-Course Meal", "ባለ አምስት ኮርስ ምግብ", null, {
        description: "Our signature: soup, courses with fresh fruit and salad, finished with our special tea.",
        description_am: "ልዩ መለያችን፤ ሾርባ፣ በፍራፍሬና በሰላጣ የታጀቡ ምግቦች፣ በልዩ ሻያችን ይጠናቀቃል።",
        photo: "/restaurant/highlights/five-course.webp",
        tags: ["popular"],
        featured: true,
        note: "Described on the official About page; courses and price not published. Confirm what's included and the price.",
      }),
      I("fasting-lunch-buffet", "Fasting Lunch Buffet", "የጾም ምሳ ቡፌ", null, {
        description: "A generous vegetarian buffet with many healthy fasting dishes, breads and salads.",
        description_am: "ብዙ ጤናማ የጾም ምግቦች፣ ዳቦና ሰላጣ ያሉበት የተትረፈረፈ የአትክልት ቡፌ።",
        photo: "/restaurant/highlights/fasting-buffet.webp",
        tags: ["fasting", "vegetarian", "popular"],
        featured: true,
        branches: ["bole-medhanialem"],
        note: "Official posts (2018–2021) and 'EVERY MONDAY–FRIDAY' poster. Confirm days, branches and price.",
      }),
      I("mamas-fasting-combo", "Mama's Fasting Combo", "የማማስ የጾም ኮምቦ", 230, {
        description: "A colourful selection of our fasting stews on injera.",
        description_am: "በእንጀራ ላይ የሚቀርቡ የተለያዩ የጾም ወጦቻችን።",
        photo: "/restaurant/menu/fasting-combo.webp",
        tags: ["fasting", "vegetarian", "popular"],
        featured: true,
      }),
      I("mamas-special-combo", "Mama's Special Combo", "የማማስ ልዩ ኮምቦ", 305, { description: "A tasting plate of our house favourites.", description_am: "የቤታችን ተወዳጅ ምግቦች ስብስብ።", tags: ["popular"] }),
      I("mixed-grill", "Mixed Grill", "ሚክስድ ግሪል", 300, {
        description: "Sizzling platter of grilled meats with vegetables.",
        description_am: "ከአትክልት ጋር የተጠበሱ የተለያዩ ሥጋዎች በጋለ ሳህን።",
        photo: "/restaurant/menu/mixed-grill.webp",
        featured: true,
      }),
      I("mixed-kebab", "Mixed Chicken & Beef Kebab", "የዶሮና የበሬ ኬባብ", 296),
      I("beef-or-chicken-kebab", "Beef or Chicken Kebab", "የበሬ ወይም የዶሮ ኬባብ", 230),
    ],
  },
  {
    slug: "national-fasting",
    name: "National Fasting Corner",
    name_am: "የሀገር ውስጥ የጾም ምግቦች",
    items: [
      I("shiro-with-tomato", "Shiro with Tomato", "ሽሮ በቲማቲም", 150, { description: "Chickpea stew with fresh tomato, served with injera.", description_am: "ከትኩስ ቲማቲም ጋር የተሰራ ሽሮ ከእንጀራ ጋር።", tags: ["fasting", "vegetarian", "popular"] }),
      I("qebetu-shiro", "Qebetu Shiro", "ቀበቶ ሽሮ", 139, { tags: ["fasting", "vegetarian"], note: "Name spelled 'Qebetu' on Foodtolo; confirm spelling (EN and Amharic) and description." }),
      I("fasting-firfir", "Fasting Firfir", "የጾም ፍርፍር", 139, { description: "Injera tossed in a spiced fasting sauce.", description_am: "በቅመም የጾም ወጥ የተለወሰ እንጀራ።", tags: ["fasting", "vegetarian", "spicy"] }),
      I("dullet", "Dullet", "ዱለት", 143, { tags: ["spicy"], note: "Listed under 'National Fasting Corner' on Foodtolo, but dullet is normally made with tripe/liver (not fasting). NOT tagged fasting. Confirm: fasting version or wrong category?" }),
      I("bozena-shiro", "Bozena Shiro", "ቦዘና ሽሮ", 150, { note: "Listed under 'National Fasting Corner' on Foodtolo, but bozena shiro normally contains meat. NOT tagged fasting. Confirm category." }),
    ],
  },
  {
    slug: "national-non-fasting",
    name: "National Non-Fasting Corner",
    name_am: "የሀገር ውስጥ የፍስክ ምግቦች",
    items: [
      I("chopped-lamb-tibs", "Chopped Lamb Tibs", "የበግ ጥብስ (የተከተፈ)", 230, {
        description: "Tender chopped lamb sautéed with onion, rosemary and green chili, with injera and awaze.",
        description_am: "በሽንኩርት፣ በጥብስ ቅጠልና በቃሪያ የተጠበሰ የተከተፈ የበግ ሥጋ ከእንጀራና ከአዋዜ ጋር።",
        photo: "/restaurant/menu/lamb-tibs.webp",
        tags: ["popular"],
        featured: true,
      }),
      I("lamb-tibs", "Lamb Tibs", "የበግ ጥብስ", 230),
      I("lamb-alicha", "Non-Spicy Lamb Stew", "የበግ አልጫ ወጥ", 193),
      I("beef-fillet-tibs", "Pan-Fried Beef Fillet Tibs", "የበሬ ፊሌ ጥብስ", 241),
      I("tibs-firfir", "Tibs Firfir", "ጥብስ ፍርፍር", 177, { tags: ["spicy"] }),
    ],
  },
  {
    slug: "chicken",
    name: "Chicken Corner",
    name_am: "የዶሮ ምግቦች",
    items: [
      I("half-roast-chicken", "Half Roast Chicken", "ግማሽ የተጠበሰ ዶሮ", 391, {
        description: "Golden roast chicken with a fresh garden salad.",
        description_am: "ወርቃማ የተጠበሰ ዶሮ ከትኩስ ሰላጣ ጋር።",
        photo: "/restaurant/menu/roast-chicken.webp",
        tags: ["popular"],
        featured: true,
      }),
      I("full-roast-chicken", "Full Roast Chicken", "ሙሉ የተጠበሰ ዶሮ", 659),
      I("half-grilled-chicken", "Half Grilled Chicken", "ግማሽ የተጠበሰ ዶሮ (ግሪል)", 348, { photo: "/restaurant/menu/grilled-chicken.webp" }),
      I("chicken-curry", "Chicken Curry", "የዶሮ ካሪ", 273, { tags: ["spicy"] }),
      I("grilled-chicken-leg", "Grilled Chicken Leg", "የተጠበሰ የዶሮ እግር", 220),
      I("grilled-chicken-breast", "Grilled Chicken Breast", "የተጠበሰ የዶሮ ፍርምባ", 230, {
        description: "Grilled chicken breast in a rich glaze with sautéed vegetables.",
        description_am: "በጣፋጭ ስጎ የተጠበሰ የዶሮ ፍርምባ ከአትክልት ጋር።",
        photo: "/restaurant/menu/chicken-breast.webp",
        featured: true,
      }),
      I("stuffed-chicken-mozzarella", "Stuffed Chicken with Mozzarella", "በሞዛሬላ የተሞላ ዶሮ", 262),
      I("chicken-wings", "Chicken Wings", "የዶሮ ክንፍ", 220),
    ],
  },
  {
    slug: "fish",
    name: "Fish Corner",
    name_am: "የአሳ ምግቦች",
    items: [
      I("grilled-nile-perch", "Grilled Nile Perch", "የተጠበሰ ቆሮሶ አሳ", 262),
      I("fish-en-papillote", "Fish en Papillote", "በወረቀት የበሰለ አሳ", 300),
      I("tuna-firfir", "Tuna Firfir", "የቱና ፍርፍር", 198),
      I("shiro-with-tuna", "Shiro with Tuna", "ሽሮ በቱና", 198),
    ],
  },
  {
    slug: "steak",
    name: "Steak Corner",
    name_am: "የስቴክ ምግቦች",
    items: [
      I("mamas-steak", "Mama's Steak", "የማማስ ስቴክ", 321, { tags: ["popular"] }),
      I("cubed-steak", "Cubed Steak", "ኪዩብ ስቴክ", 300),
      I("rib-eye-steak", "Rib-Eye Steak", "ሪብ አይ ስቴክ", 402),
      I("zee-steak", "Zee Steak", "ዚ ስቴክ", 316, { note: "Name 'Zee steak' as listed on Foodtolo; confirm name and description." }),
      I("stuffed-farmer-steak", "Stuffed Farmer Steak", "የተሞላ ፋርመር ስቴክ", 337),
    ],
  },
  {
    slug: "pasta",
    name: "Pasta",
    name_am: "ፓስታ",
    items: [
      I("spaghetti-vegetables", "Spaghetti with Vegetables", "ስፓጌቲ በአትክልት", 166, { description: "Spaghetti or penne.", description_am: "ስፓጌቲ ወይም ፔኔ።", tags: ["vegetarian"] }),
      I("spaghetti-tomato", "Spaghetti with Tomato", "ስፓጌቲ በቲማቲም", 150, { description: "Spaghetti or penne.", description_am: "ስፓጌቲ ወይም ፔኔ።", photo: "/restaurant/menu/spaghetti.webp", tags: ["vegetarian"] }),
      I("spaghetti-chicken", "Spaghetti with Grilled Chicken", "ስፓጌቲ በተጠበሰ ዶሮ", 201),
      I("spaghetti-beef", "Spaghetti with Grilled Beef", "ስፓጌቲ በተጠበሰ በሬ", 206),
      I("spaghetti-fish", "Spaghetti with Grilled Fish", "ስፓጌቲ በተጠበሰ አሳ", 225),
      I("spaghetti-tuna", "Spaghetti with Tuna", "ስፓጌቲ በቱና", 201),
    ],
  },
  {
    slug: "pizza",
    name: "Pizza Corner",
    name_am: "ፒዛ",
    items: [
      I("mamas-kitchen-pizza", "Mama's Kitchen Pizza", "የማማስ ኪችን ፒዛ", 273, {
        description: "Our house pizza, fresh from the oven.",
        description_am: "ከምድጃ ትኩስ የሚወጣ የቤታችን ፒዛ።",
        photo: "/restaurant/menu/mamas-pizza.webp",
        tags: ["popular"],
        featured: true,
      }),
      I("margherita-pizza", "Margherita Pizza", "ማርጋሪታ ፒዛ", 220, { tags: ["vegetarian"] }),
      I("beef-lovers-pizza", "Beef Lover's Pizza", "የበሬ ሥጋ ፒዛ", 230),
      I("chicken-pizza", "Chicken Pizza", "የዶሮ ፒዛ", 246),
      I("tuna-pizza-cheese", "Tuna Pizza with Cheese", "የቱና ፒዛ በአይብ", 262),
      I("vegetable-pizza-cheese", "Vegetable Pizza with Cheese", "የአትክልት ፒዛ በአይብ", 198, { tags: ["vegetarian"] }),
      I("fasting-vegetable-pizza", "Fasting Vegetable Pizza", "የጾም የአትክልት ፒዛ", 161, { tags: ["fasting", "vegetarian"] }),
      I("fasting-tuna-pizza", "Fasting Tuna Pizza", "የጾም የቱና ፒዛ", 201, { tags: ["fasting"] }),
      I("fasting-tuna-vegetable-pizza", "Fasting Tuna & Vegetable Pizza", "የጾም የቱናና የአትክልት ፒዛ", 241, { tags: ["fasting"] }),
      I("chefs-jungle-pizza", "Chef's Jungle Pizza", "የሼፍ ጃንግል ፒዛ", 220, { tags: ["new"] }),
    ],
  },
  {
    slug: "salads",
    name: "Salad Corner",
    name_am: "ሰላጣ",
    items: [
      I("house-special-salad", "House Special Salad", "የቤቱ ልዩ ሰላጣ", 139, { tags: ["vegetarian"], note: "Foodtolo lists two prices (139 and 252), probably two sizes. Confirm sizes and prices." }),
      I("house-salad-chicken", "House Special Salad with Grilled Chicken", "የቤቱ ልዩ ሰላጣ በተጠበሰ ዶሮ", 181, { note: "Foodtolo lists 181 and 337, probably two sizes." }),
      I("house-salad-beef", "House Special Salad with Grilled Beef", "የቤቱ ልዩ ሰላጣ በተጠበሰ በሬ", 183, { note: "Foodtolo lists 183 and 252, probably two sizes." }),
      I("house-salad-tuna", "House Special Salad with Tuna", "የቤቱ ልዩ ሰላጣ በቱና", 181, { photo: "/restaurant/menu/house-salad-tuna.webp", note: "Foodtolo lists 181 and 332, probably two sizes." }),
      I("fasting-salad-balsamic", "Fasting Salad with House Balsamic Vinaigrette", "የጾም ሰላጣ በባልሳሚክ", 230, { tags: ["fasting", "vegetarian"], note: "Foodtolo lists 230 and 305, probably two sizes." }),
    ],
  },
  {
    slug: "soups",
    name: "Soups",
    name_am: "ሾርባ",
    items: [
      I("soup-of-the-day", "Soup of the Day", "የዕለቱ ሾርባ", 117, { description: "Ask your waiter for today's soup.", description_am: "የዛሬውን ሾርባ አስተናጋጅዎን ይጠይቁ።" }),
      I("cream-of-chicken-soup", "Cream of Chicken Soup", "የዶሮ ክሬም ሾርባ", 140),
    ],
  },
];

export const itemNote = (item: Item) => [item.price !== null ? PRICE_NOTE : null, item.note ?? null].filter(Boolean).join(" ");

/* ------------------------------------------------------------------ */

const EVENTS_NOTE = "From the 2018 'Royal Lounge Weekly Schedule' poster and 2019 posts. Is this night still running? Confirm day, time and venue.";

export const events = [
  { title: "Jam Session", title_am: "ጃም ሴሽን", description: "Monday night jam with some of Addis's best musicians.", description_am: "የሰኞ ምሽት ጃም ከአዲስ አበባ ምርጥ ሙዚቀኞች ጋር።", branch: "royal-lounge", weekday: 1, start_time: "20:00", photo_url: "/restaurant/events/jam-session.webp" },
  { title: "Live Band Night", title_am: "የቀጥታ ባንድ ምሽት", description: "Qarya Groove band with your favourite singers.", description_am: "ቃርያ ግሩቭ ባንድ ከተወዳጅ ድምፃውያን ጋር።", branch: "royal-lounge", weekday: 2, start_time: "20:00", photo_url: "/restaurant/events/live-band.webp" },
  { title: "Jazz Night", title_am: "የጃዝ ምሽት", description: "Friday jazz to wash away the week.", description_am: "የሳምንቱን ድካም የሚያስረሳ የዓርብ ጃዝ።", branch: "royal-lounge", weekday: 5, start_time: "20:00", photo_url: "/restaurant/events/jazz-night.webp" },
  { title: "Zemen Band Sunday", title_am: "የእሁድ ዘመን ባንድ", description: "Sunday evenings with Zemen band.", description_am: "የእሁድ ምሽቶች ከዘመን ባንድ ጋር።", branch: "royal-lounge", weekday: 0, start_time: "20:00", photo_url: "/restaurant/events/zemen-band.webp" },
].map((e) => ({ ...e, ...R(EVENTS_NOTE) }));

export const gallery = [
  ["/restaurant/gallery/lamb-tibs.webp", "Lamb tibs with injera and awaze", "የበግ ጥብስ ከእንጀራና ከአዋዜ ጋር", "OFFICIAL"],
  ["/restaurant/gallery/entoto-garden.webp", "Garden tables at Entoto Park", "በእንጦጦ ፓርክ የአትክልት ስፍራ ጠረጴዛዎች", "OFFICIAL"],
  ["/restaurant/gallery/cocktails.webp", "Our special cocktails at the bar", "ልዩ ኮክቴሎቻችን", "OFFICIAL"],
  ["/restaurant/gallery/buffet-lounge.webp", "Buffet in the lounge", "ቡፌ በላውንጁ ውስጥ", "OFFICIAL"],
  ["/restaurant/gallery/ministry-dining.webp", "Terrace dining at the Ministry of Mines branch", "በማዕድን ሚኒስቴር ቅርንጫፍ በረንዳ", "OFFICIAL"],
  ["/restaurant/gallery/coffee-pour.webp", "Coffee poured from a jebena (sample photo)", "ከጀበና የሚቀዳ ቡና (ናሙና ፎቶ)", "STOCK"],
  ["/restaurant/gallery/vip-room.webp", "VIP lounge with red sofas", "ቀይ ሶፋዎች ያሉት የቪአይፒ ላውንጅ", "OFFICIAL"],
  ["/restaurant/gallery/fruit-carving.webp", "Carved watermelon fruit display", "የተቀረጸ የሐብሐብ ፍራፍሬ", "OFFICIAL"],
  ["/restaurant/gallery/bar.webp", "The bar", "ባሩ", "OFFICIAL"],
  ["/restaurant/gallery/entoto-terrace.webp", "Entoto Park branch terrace", "የእንጦጦ ፓርክ ቅርንጫፍ በረንዳ", "OFFICIAL"],
  ["/restaurant/gallery/cocktail-friends.webp", "Friends enjoying cocktails", "ኮክቴል የሚጠጡ ጓደኛሞች", "OFFICIAL"],
  ["/restaurant/gallery/vip-lounge.webp", "Lounge seating", "የላውንጅ መቀመጫዎች", "OFFICIAL"],
  ["/restaurant/gallery/coffee-ceremony.webp", "Coffee ceremony (sample photo)", "የቡና ሥነ ሥርዓት (ናሙና ፎቶ)", "STOCK"],
  ["/restaurant/gallery/mesob.webp", "Injera served in a mesob (sample photo)", "በመሶብ የቀረበ እንጀራ (ናሙና ፎቶ)", "STOCK"],
].map(([url, alt, alt_am, source_status]) => ({ url, alt, alt_am, source_status }));

export const testimonials = [1, 2, 3].map((n) => ({
  name: `Sample guest ${n}`,
  text: "Sample review: replace with a real review from a guest (with their permission).",
  text_am: "ናሙና አስተያየት፤ በእውነተኛ የእንግዳ አስተያየት (በፈቃዳቸው) ይተኩ።",
  rating: 5,
  is_sample: true,
}));

export const announcements = [
  {
    text: "Fasting season: our fasting lunch buffet is on at Bole Medhanialem, Monday to Friday.",
    text_am: "የጾም ወቅት፤ የጾም ምሳ ቡፌያችን በቦሌ መድኃኔዓለም ከሰኞ እስከ ዓርብ።",
    link: "/menu/?filter=fasting",
    is_active: false, // example only; switch on from Admin → Dashboard
  },
];
