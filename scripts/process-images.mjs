/**
 * Turns the downloaded source photos into optimized WebP files in
 * /public/restaurant/ + tiny blur placeholders.
 *
 *   node scripts/process-images.mjs <folder-with-downloaded-originals>
 *
 * Every image is listed below with where it came from. IMAGE_MANIFEST.md
 * is generated from this list, so keep them in sync by re-running.
 * Rules: hero ≤ 250KB, cards ≤ 120KB, never upscale (low-res photos stay small).
 */
import sharp from "sharp";
import { mkdir, writeFile, stat } from "node:fs/promises";
import path from "node:path";

const SRC = process.argv[2];
if (!SRC) throw new Error("Usage: node scripts/process-images.mjs <source-folder>");
const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "public/restaurant");

const WA = (ts, file) => `https://web.archive.org/web/${ts}/https://mamaskitchenethiopia.com/wp-content/uploads/${file}`;
const US = (id) => `https://unsplash.com/photos/${id}`;

/**
 * out: output path inside /public/restaurant
 * src: source file name inside SRC
 * size: [width, height] crop box (cover). Never upscaled beyond the source.
 * crop: optional {left, top, width, height} fraction box applied first (0–1)
 */
const IMAGES = [
  // --- Hero & about
  { out: "hero.webp", src: "2021_11_Chicken-Breast.jpg", size: [1280, 720], max: 250, status: "OFFICIAL", source: WA("20221012213535", "2021/11/Chicken-Breast.jpg"), use: "Home hero; menu: Grilled Chicken Breast", note: "Ministry of Mines branch, Nov 2021" },
  { out: "about.webp", src: "2018_05_14519656_1284378251593624_8495757720141193193_n.jpg", size: [960, 640], status: "OFFICIAL", source: WA("20180814045524", "2018/05/14519656_1284378251593624_8495757720141193193_n.jpg"), use: "About section", note: "Lounge interior (Baritone). Has logo watermark" },

  // --- Highlights strip
  { out: "highlights/five-course.webp", src: "2018_05_21077221_1642974985733947_2703483401189457054_n.jpg", size: [800, 600], status: "OFFICIAL", source: WA("20180923010748", "2018/05/21077221_1642974985733947_2703483401189457054_n.jpg"), use: "Highlight: Five-course meal; menu: Five-course meal", note: "Table set with wine and platter; not literally the five courses" },
  { out: "highlights/fasting-buffet.webp", src: "2018_05_14089151_1250253505006099_421511249777976783_n.jpg", size: [800, 600], status: "OFFICIAL", source: WA("20221012213535", "2018/05/14089151_1250253505006099_421511249777976783_n.jpg"), use: "Highlight: Fasting buffet; menu: Fasting lunch buffet", note: "Baritone Lounge buffet line" },
  { out: "highlights/live-music.webp", src: "2018_05_29790788_1881495985215178_2473381737124155945_n.jpg", size: [800, 600], status: "OFFICIAL", source: WA("20180814045632", "2018/05/29790788_1881495985215178_2473381737124155945_n.jpg"), use: "Highlight: Live music; event: Friday Jazz Night", note: "Royal Lounge stage" },
  { out: "highlights/catering.webp", src: "2018_05_20156050_1605008009530645_5234349542591868039_n.jpg", size: [800, 552], status: "OFFICIAL", source: WA("20180814045436", "2018/05/20156050_1605008009530645_5234349542591868039_n.jpg"), use: "Highlight: Catering", note: "From the 'Take Away Catering' block on the official home page" },

  // --- Menu items (800×600 max)
  { out: "menu/lamb-tibs.webp", src: "2018_05_21032627_1642975029067276_322181058147471120_n.jpg", size: [800, 600], status: "OFFICIAL", source: WA("20180922201841", "2018/05/21032627_1642975029067276_322181058147471120_n.jpg"), use: "Menu: Chopped Lamb Tibs (signature)" },
  { out: "menu/mamas-pizza.webp", src: "2018_05_30714101_1895491190482324_3279973308351350359_n.jpg", size: [697, 455], status: "OFFICIAL", source: WA("20180814052538", "2018/05/30714101_1895491190482324_3279973308351350359_n.jpg"), use: "Menu: Mama's Kitchen Pizza (signature)", note: "Low-res (697px); used small" },
  { out: "menu/roast-chicken.webp", src: "2018_05_Untitldfdfed.png", size: [800, 600], status: "OFFICIAL", source: WA("20180814045628", "2018/05/Untitldfdfed.png"), use: "Menu: Half Roast Chicken (signature)" },
  { out: "menu/chicken-breast.webp", src: "2021_11_Chicken-Breast.jpg", size: [800, 600], crop: { left: 0.18, top: 0.2, width: 0.64, height: 0.62 }, status: "OFFICIAL", source: WA("20221012213535", "2021/11/Chicken-Breast.jpg"), use: "Menu: Grilled Chicken Breast (signature)" },
  { out: "menu/mixed-grill.webp", src: "2018_05_food.png", size: [700, 600], crop: { left: 0.5, top: 0, width: 0.5, height: 1 }, status: "OFFICIAL", source: WA("20180814052556", "2018/05/food.png"), use: "Menu: Mixed Grill (signature)", note: "Cropped away the 'Eat tasty but healthy' text panel" },
  { out: "menu/fasting-combo.webp", src: "2021_03_MamasFasting.jpg", size: [800, 800], status: "OFFICIAL", source: WA("20221012213535", "2021/03/MamasFasting.jpg"), use: "Menu: Mama's Fasting Combo (signature)", note: "Collage of their fasting dishes" },
  { out: "menu/house-salad-tuna.webp", src: "2018_05_14457303_1277629742268475_706937432325805019_n.jpg", size: [800, 579], status: "OFFICIAL", source: WA("20180923004300", "2018/05/14457303_1277629742268475_706937432325805019_n.jpg"), use: "Menu: House Special Salad with Tuna", note: "Shown as 'Tuna Salad' on the official /menu/ page" },
  { out: "menu/spaghetti.webp", src: "2018_05_cropped-1-1P31001011TA.jpg", size: [800, 600], status: "OFFICIAL?", source: WA("20180922185807", "2018/05/cropped-1-1P31001011TA.jpg"), use: "Menu: Spaghetti with Tomato", note: "On their site, but looks like a stock photo from the WordPress theme. Replace" },
  { out: "menu/grilled-chicken.webp", src: "2018_05_foo.png", size: [700, 600], crop: { left: 0.53, top: 0, width: 0.47, height: 1 }, status: "OFFICIAL", source: WA("20180814044646", "2018/05/foo.png"), use: "Menu: Half Grilled Chicken", note: "Cropped away the text panel" },

  // --- Events
  { out: "events/jam-session.webp", src: "2018_05_Undfggitled.png", size: [1000, 552], status: "OFFICIAL", source: WA("20180922234047", "2018/05/Undfggitled.png"), use: "Event: Monday Jam Session" },
  { out: "events/live-band.webp", src: "2018_05_29512807_1866690140029096_5562299908680013498_n.jpg", size: [800, 600], status: "OFFICIAL", source: WA("20180814045432", "2018/05/29512807_1866690140029096_5562299908680013498_n.jpg"), use: "Event: Tuesday Live Band" },
  { out: "events/jazz-night.webp", src: "2018_05_29790788_1881495985215178_2473381737124155945_n.jpg", size: [800, 600], crop: { left: 0.05, top: 0, width: 0.7, height: 1 }, status: "OFFICIAL", source: WA("20180814045632", "2018/05/29790788_1881495985215178_2473381737124155945_n.jpg"), use: "Event: Friday Jazz Night" },
  { out: "events/zemen-band.webp", src: "2018_05_29695195_1876026082428835_4632021099191083772_n.jpg", size: [800, 600], status: "OFFICIAL", source: WA("20180922231740", "2018/05/29695195_1876026082428835_4632021099191083772_n.jpg"), use: "Event: Sunday Zemen Band", note: "Group photo on stage; not necessarily Zemen band" },

  // --- Branches
  { out: "branches/bole-medhanialem.webp", src: "2018_05_14354936_1277630762268373_793393309281263969_n.jpg", size: [900, 600], status: "OFFICIAL", source: WA("20180814050121", "2018/05/14354936_1277630762268373_793393309281263969_n.jpg"), use: "Branch: Bole Medhanialem (Baritone Lounge)", note: "Building exterior" },
  { out: "branches/4-killo.webp", src: "2021_03_4killo2.jpg", size: [720, 480], crop: { left: 0, top: 0.3, width: 1, height: 0.45 }, status: "OFFICIAL", source: WA("20221012213538", "2021/03/4killo2.jpg"), use: "Branch: 4 Killo", note: "Portrait photo cropped to landscape" },
  { out: "branches/ministry-of-mines.webp", src: "2021_11_wow.jpg", size: [900, 600], status: "OFFICIAL", source: WA("20221012213535", "2021/11/wow.jpg"), use: "Branch: Ministry of Mines" },
  { out: "branches/entoto.webp", src: "2021_03_entoto.jpg", size: [900, 600], status: "OFFICIAL", source: WA("20221012213536", "2021/03/entoto.jpg"), use: "Branch: Entoto Park" },
  { out: "branches/royal-lounge.webp", src: "2018_05_club-1.png", size: [900, 600], status: "OFFICIAL", source: WA("20180814044748", "2018/05/club-1.png"), use: "Branch: Royal Lounge (Wollo Sefer)" },
  { out: "branches/catering-moenco.webp", src: "2018_05_16996030_1444259272272187_1322082837518738505_n.png", size: [900, 600], status: "OFFICIAL", source: WA("20180814045835", "2018/05/16996030_1444259272272187_1322082837518738505_n.png"), use: "Branch: Catering (Bole Moenco)", note: "Catering fruit display; not the Moenco building" },

  // --- Catering & Mama's Inn sections
  { out: "catering.webp", src: "2018_05_20621816_1624785264219586_4655035606183108534_n.jpg", size: [960, 637], status: "OFFICIAL", source: WA("20180922184506", "2018/05/20621816_1624785264219586_4655035606183108534_n.jpg"), use: "Catering section" },
  { out: "mamas-inn.webp", src: "stock_TFXCpP5V3Ds.jpg", size: [1200, 800], crop: { left: 0, top: 0.25, width: 1, height: 0.45 }, status: "STOCK – replace", source: US("TFXCpP5V3Ds") + " (Jazmin Wong, Unsplash License)", use: "Mama's Inn section" },

  // --- Gallery
  { out: "gallery/buffet-lounge.webp", src: "2018_05_20620748_1624785234219589_4889199035335034700_n.jpg", size: [1200, 900], status: "OFFICIAL", source: WA("20180814054112", "2018/05/20620748_1624785234219589_4889199035335034700_n.jpg"), use: "Gallery" },
  { out: "gallery/cocktails.webp", src: "2018_05_cocktail2.png", size: [1000, 620], status: "OFFICIAL", source: WA("20180814054119", "2018/05/cocktail2.png"), use: "Gallery; highlight card for cocktails" },
  { out: "gallery/cocktail-friends.webp", src: "2018_05_cocktail.png", size: [987, 620], status: "OFFICIAL", source: WA("20180814045448", "2018/05/cocktail.png"), use: "Gallery", note: "Promotional photo with models; confirm usage rights" },
  { out: "gallery/vip-lounge.webp", src: "2018_05_vip2.png", size: [700, 466], status: "OFFICIAL", source: WA("20180922231722", "2018/05/vip2.png"), use: "Gallery" },
  { out: "gallery/vip-room.webp", src: "2018_05_vip5.png", size: [800, 532], status: "OFFICIAL", source: WA("20180814045506", "2018/05/vip5.png"), use: "Gallery" },
  { out: "gallery/bar.webp", src: "2018_05_Untdfitled.png", size: [753, 399], status: "OFFICIAL", source: WA("20180922223737", "2018/05/Untdfitled.png"), use: "Gallery" },
  { out: "gallery/fruit-carving.webp", src: "2018_05_cropped-14441012_1277629468935169_734687430338493026_n.jpg", size: [1200, 675], status: "OFFICIAL", source: WA("20180923030027", "2018/05/cropped-14441012_1277629468935169_734687430338493026_n.jpg"), use: "Gallery" },
  { out: "gallery/entoto-garden.webp", src: "2021_03_entoto3.jpg", size: [1200, 675], status: "OFFICIAL", source: WA("20221012213536", "2021/03/entoto3.jpg"), use: "Gallery" },
  { out: "gallery/entoto-terrace.webp", src: "2021_03_entoto1.jpg", size: [1200, 675], status: "OFFICIAL", source: WA("20221012213536", "2021/03/entoto1.jpg"), use: "Gallery" },
  { out: "gallery/ministry-dining.webp", src: "2021_11_relax.jpg", size: [720, 960], status: "OFFICIAL", source: WA("20221012213535", "2021/11/relax.jpg"), use: "Gallery" },
  { out: "gallery/lamb-tibs.webp", src: "2018_05_21032627_1642975029067276_322181058147471120_n.jpg", size: [960, 639], status: "OFFICIAL", source: WA("20180922201841", "2018/05/21032627_1642975029067276_322181058147471120_n.jpg"), use: "Gallery" },
  { out: "gallery/coffee-pour.webp", src: "stock_v-NdnkoKEQs.jpg", size: [900, 1200], status: "STOCK – replace", source: US("v-NdnkoKEQs") + " (Amanuel Kebede, Unsplash License)", use: "Gallery; five-course 'special tea' mood" },
  { out: "gallery/coffee-ceremony.webp", src: "stock_WcWvmyG73yU.jpg", size: [900, 1200], status: "STOCK – replace", source: US("WcWvmyG73yU") + " (Zeynep S., Unsplash License)", use: "Gallery" },
  { out: "gallery/mesob.webp", src: "stock_skh-CC9A77U.jpg", size: [1200, 800], status: "STOCK – replace", source: US("skh-CC9A77U") + " (Zeynep S., Unsplash License)", use: "Gallery" },
];

const blur = {};
const manifest = [];

for (const img of IMAGES) {
  const input = path.join(SRC, img.src);
  let pipeline = sharp(input).rotate();
  const meta = await sharp(input).metadata();
  if (img.crop) {
    const c = img.crop;
    const left = Math.round(c.left * meta.width);
    const top = Math.round(c.top * meta.height);
    pipeline = pipeline.extract({
      left,
      top,
      // clamp so rounding never goes past the image edge
      width: Math.min(Math.round(c.width * meta.width), meta.width - left),
      height: Math.min(Math.round(c.height * meta.height), meta.height - top),
    });
  }
  // Re-read size after crop, then cover-resize but never enlarge.
  const buf = await pipeline.toBuffer();
  const m = await sharp(buf).metadata();
  const [tw, th] = img.size;
  const scale = Math.min(1, m.width / tw, m.height / th);
  const w = Math.round(tw * scale);
  const h = Math.round(th * scale);
  const maxKB = img.max ?? 120;

  const target = path.join(OUT, img.out);
  await mkdir(path.dirname(target), { recursive: true });
  let quality = 72;
  let out;
  do {
    out = await sharp(buf).resize(w, h, { fit: "cover", position: "attention" }).webp({ quality, effort: 6 }).toBuffer();
    quality -= 6;
  } while (out.length > maxKB * 1024 && quality > 30);
  await writeFile(target, out);

  const tiny = await sharp(out).resize(16).webp({ quality: 40 }).toBuffer();
  const key = `/restaurant/${img.out}`;
  blur[key] = `data:image/webp;base64,${tiny.toString("base64")}`;
  manifest.push({ ...img, file: key, width: w, height: h, kb: Math.round(out.length / 1024) });
  console.log(`✓ ${img.out.padEnd(34)} ${w}×${h}  ${Math.round(out.length / 1024)}KB  q${quality + 6}`);
}

// Blur placeholders + dimensions, used by the database seed.
await writeFile(path.join(ROOT, "supabase/seed/images.json"), JSON.stringify(Object.fromEntries(manifest.map((m) => [m.file, { w: m.width, h: m.height, blur: blur[m.file], status: m.status }])), null, 2) + "\n");

// Machine-readable manifest; IMAGE_MANIFEST.md is written from it.
await writeFile(path.join(ROOT, "supabase/seed/image-manifest.json"), JSON.stringify(manifest.map(({ out, src, crop, size, max, ...m }) => m), null, 2) + "\n");

// Open Graph image: hero + logo, 1200×630 JPG
const logo = await sharp(path.join(OUT, "logo.png")).resize(300).toBuffer();
await sharp(path.join(OUT, "hero.webp"))
  .resize(1200, 630, { fit: "cover" })
  .composite([{ input: logo, left: 60, top: 60 }])
  .jpeg({ quality: 78, mozjpeg: true })
  .toFile(path.join(OUT, "og.jpg"));
console.log("✓ og.jpg", Math.round((await stat(path.join(OUT, "og.jpg"))).size / 1024) + "KB");
