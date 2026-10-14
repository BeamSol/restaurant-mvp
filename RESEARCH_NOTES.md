# Research notes: Mama's Kitchen, Addis Ababa

Researched 2026-09-28. Every fact lists its source and a status:

- **✅ Confirmed on official site**: stated on mamaskitchenethiopia.com (via Internet Archive snapshot) or the official brand graphics published there.
- **⚠️ Needs owner confirmation**: from a third-party listing, an old post, or our own assumption. In the database these rows have `needs_review = true` and show up in **Admin → Needs review**.

## Important context

- **The official website is offline.** `mamaskitchenethiopia.com` no longer resolves (DNS lookup fails). The Internet Archive shows the host serving a *cPanel "account suspended"* page on 2025-03-18: <https://web.archive.org/web/20250318071159/http://mamaskitchenethiopia.com/cgi-sys/suspendedpage.cgi>. All "official site" facts below come from **archived snapshots dated 2018–2023**. **Everything is at least 2–3 years old**, so branches, phones and prices may have changed.
- **Facebook** (<https://www.facebook.com/MamasKitchenAddisAbaba>) needs a login and could not be read. Facebook post titles seen in search results are listed where relevant.
- Abbreviation used below: **WA** = `https://web.archive.org/web/<timestamp>/`.

---

## 1. Brand

| Fact | Value | Source | Status |
|---|---|---|---|
| Name | Mama's Kitchen (site title "Mama's Kitchen Ethiopia") | WA 20230610194418 home | ✅ |
| Amharic name | ማማስ ኪችን | Foodtolo listing title "Mama's Kitchen Restaurant -ማማስ ኪችን" <https://foodtolo.flocash.com/home/restaurantProfile/142>; Amharic post title "…በማማስ ኪችን" (WA 20211027013728) | ✅ (spelling used on their own post) |
| Tagline | "Healthy & Delicious Foods" (page title), "Classy & Affordable", "Tasty & healthy foods" | WA 20230610194418 home; `MKBranches.png` graphic | ✅ |
| Logo | Red oval, white "Mama's Kitchen" lettering with chef hat → `public/restaurant/logo.png` (390×257 PNG, largest available) | `wp-content/uploads/2018/05/logo-tiff.png` (WA 20180814054513) | ✅. **Ask the owner for the original vector (AI/SVG/PDF).** |
| Logo colors | Red `#E01D2D` (63% of pixels) + white (31%); no second brand color | `npm run palette` | ✅ |
| Poster accent color | Deep maroon used on "Royal Lounge Weekly Schedule" poster | `2018/05/weekly-schedule.png` | ✅ |

## 2. About / story (official text, basis for our rewrite)

Source: About page WA 20230610212207 `/about/` and home WA 20230610194418. ✅

> "One of the best restaurants in the heart of Addis Ababa, Mamas Kitchen has been everyone's place to dine … one of the best chefs in town has outstanding five course meals (the only in the country) that has become talk of the town. From our mouthwatering soup to our selection of courses backed with fruits and salads and last but not least is our exhilarating special tea … Our Beer Court has a selection of beers … local and international … shish kebab or BBQ right at the beer court … VIP Lounge … Live Music Section every night with local and international artists backed with one of the best bands in town … Cocktail Bar …"

Mission (same page): full-flavored food "that has a beginning, middle, and finish to every bite"; "Everything at Mama's Kitchen is ruled by taste"; "We purchase from local farms, donate food to charitable causes…"

Facts extracted:

| Fact | Status |
|---|---|
| Five-course meal: soup → courses with fruits & salads → special tea; claimed "the only in the country" | ✅ (claim is theirs; we keep it softer: "a five-course meal you won't find anywhere else") |
| Live music every night, local and international artists, house band | ✅ (2019–2023 text) / ⚠️ still true today? |
| Beer Court with local and international beers, shish kebab & BBQ | ✅ |
| VIP Lounge for private groups | ✅ |
| Cocktail bar / "Our Special Cocktails" | ✅ |
| Buys from local farms, donates food to charity | ✅ |
| "Social fans 85,000", "Great rating 4.7/5", "Working days 7" | ✅ (home 2023, self-reported; not shown on the new site) |

## 3. Branches

**Master list: footer of official site, ©2022** (WA 20230204000729 `/photo-gallery/`, WA 20230203222015 `/menu/`):

| # | Branch | Address (as published) | Status |
|---|---|---|---|
| B1 | **Catering, Bole Moenco** ("1st Mama's Kitchen Bole Moenco Branch") | Bole Moenco. The Branches page says catering is "Located at Bole Medhanialem in front of Kebe Pastry" | ✅ listed / ⚠️ exact location conflicting |
| B2 | **Bole Medhanialem (Baritone Lounge)** | Bole Medhanialem, behind Mafi Mall | ✅ |
| B3 | **4 Killo** | In front of Menelik II Senior Secondary School | ✅ |
| B4 | **Ministry of Mines (Salite Mihret)** | Salite Mihret, inside the Ministry of Mines compound. Opened Nov 2021 ("New Branch!" post, WA 20230203225325) | ✅ |
| B5 | **Unity Park** | Inside Unity Park | ✅ |
| B6 | **22 Area** | Next to Yohannes Kitfo | ✅ |
| B7 | **Meskel Flower** | Around Dreamliner Hotel | ✅ (listed 2022; the 2023 home footer omits it) ⚠️ |
| B8 | **Entoto Park** | Inside Entoto Park; "The best place to host events!" | ✅ |

Other venues found:

| Venue | Detail | Source | Status |
|---|---|---|---|
| **Royal Lounge** (live music) | Wollo Sefer, in front of Tebaber Berta, Dani Plaza building | Event posts 2018–2019 (WA 20211027001616 jazz post; WA 20211027003448); `MKBranches.png` (2021) | ✅ in 2021 / ⚠️ **not in the 2022–2023 branch list; may be closed** |
| **Baritone Lounge** | Same site as B2 (Bole Medhanialem behind Mafi Mall). Fasting lunch buffet, sports bar | Official Baritone post (WA 20211027002256); Branches page | ✅. Your brief said "near Bole Rock"; Tripadvisor says "Cameroon Street". ⚠️ confirm |
| **Mama's Inn boutique hotel** | Branch 1 in Hayahulet (22), branch 2 on Meskel Flower | Post URLs `/mamas-inn-boutique-hotel/` & `/mamas-inn-boutique-hotel-second-branch/` exist (2019) but content was not archived; locations from Tripadvisor photo caption <https://www.tripadvisor.com/LocationPhotoDirectLink-g293791-d7205512-i399368850-Mama_s_Kitchen-Addis_Ababa.html>; "Neat rooms" on `MKBranches.png` | ⚠️ **needs owner confirmation (still operating? rooms? prices?)** |

`MKBranches.png` (2021 official graphic) lists: Entoto, 4 Killo, Baritone, Unity Park, Royal Lounge, 22 Area, Meskel Flower (with "Around Dreamliner"), plus "Tasty & healthy foods · Neat rooms · Catering · Variety of drinks · Classy interior · Live Music".

## 4. Contact

| Fact | Value | Source | Status |
|---|---|---|---|
| Main phone 1 | +251 911 222 097 | Footer 2022–2023 (all pages); every branch on Branches page | ✅ |
| Main phone 2 | +251 911 222 098 | Footer 2022–2023; Branches page | ✅ |
| Phone (lounges) | 0911 222 133 | Jazz/Live-band posts 2019; `MKBranches.png` 2021 | ✅ (older) ⚠️ |
| Phone (Contact page) | +251 930 329 244 | Contact page WA 20230610195518 | ✅ ⚠️ which branch? |
| Phone (Baritone, 2018) | 0930 099 356 | Baritone post + Happy Hour poster 2018 | ✅ old ⚠️ likely outdated; **not used** |
| Email | info@mamaskitchenethiopia.com | Contact page 2023, event posts | ✅, but **the domain is dead, so this address likely no longer works** ⚠️ |
| Email typos on site | "info@mamaskichenethiopia.com" (footer) and "info@mamaskitchen.com" (Branches page) | footer / Branches | ✅ typos on their site; ignored |
| Royal Lounge email | royallounge@mamaskitchenethiopia.com | "Endegna" post 2018 | old; not used |
| WhatsApp | none published | none | ⚠️ **we assume WhatsApp on +251 911 222 097; must confirm** |
| Telegram | none published | none | ⚠️ ask |
| Facebook | https://www.facebook.com/MamasKitchenAddisAbaba | site footer (all snapshots) | ✅ |
| Instagram | https://www.instagram.com/mamaskitchenaddisababa/ (also older @mamaskitcheneth) | site footer | ✅ |
| YouTube video | https://www.youtube.com/watch?v=81jHVkKy4ws | site footer | ✅ |

## 5. Opening hours

| Fact | Source | Status |
|---|---|---|
| "Working Days: 7" (open every day) | Home 2023 | ✅ |
| 9:00 AM – 10:00 PM | Foodtolo delivery listing | ⚠️ third-party, one branch |
| Live music "every night" → lounges open late | About page | ⚠️ closing time unknown |

➡ Seeded as **Mon–Sun 08:00–22:00** for restaurants and **until 01:00** for the Royal Lounge. **All hours are `needs_review`.** We have no official hours at all.

## 6. Signature offers

| Offer | Detail | Source | Status |
|---|---|---|---|
| Five-course meal | soup, courses with fruits & salads, special tea | About page | ✅ |
| Fasting lunch buffet | "mouthwatering fasting lunch buffet" at Baritone Lounge; "ልዩ የፆም ቡፌ ከግሩም መስተንግዶ ጋር"; poster "EVERY MONDAY–FRIDAY"; Tripadvisor: "during the fasting season … Mondays till Saturdays" | Home 2023 slider "Fasting Buffet – Tasty & Healthy"; Amharic post WA 20211027013728; `26195424…jpg` poster | ✅ / ⚠️ days & price |
| Special cocktails | "Our Special Cocktails" section with photos | Home 2023 | ✅ |
| Happy hour | Baritone Lounge, 3–8 PM, beers 17 ETB (Feb–Mar 2018 promo) | `news1.png` poster | ✅ historical; not seeded as current |
| Catering | office/workplace catering, take-away catering, event catering | Branches + Our Services pages | ✅ |
| Buffet service | "generous portions made with only the freshest and finest ingredients … no preservatives" | Our Services page | ✅ |
| After-wedding party package | lounge + own bar + midnight snacks | Our Services page; `after-wedding.png` | ✅ ⚠️ still offered? |
| Mama's Inn boutique hotel | rooms | see Branches | ⚠️ |

## 7. Live music & events (Royal Lounge)

Official "Royal Lounge Weekly Schedule" poster (2018) `2018/05/weekly-schedule.png`:

| Day | Program |
|---|---|
| Mon | Jam session (DJ Kal & DJ Jop) |
| Tue | Qarya Groove band (DJ Wossen & DJ Rick) |
| Wed | DJ Binialem & DJ Jop |
| Thu | Qarya Groove band (DJ Kal & DJ Wossen) |
| Fri | DJ Jop & DJ Blacky |
| Sat | DJ Kal & DJ Wossen |
| Sun | Zemen band (DJ Kal & DJ Rick) |

Later posts:
- "Every Tuesday Night Live Band at Royal Lounge": Qarya Groove band, 19 Mar 2019 (WA 20211027003448) ✅
- "Jazz night at Mama's Kitchen Royal Lounge", **every Friday night**, 22 Mar 2019 (WA 20211027001616) ✅
- Monday Jam Session with renowned Ethiopian musicians (Tripadvisor review titles, search result) ⚠️
- One-off 2018 shows (Endegna launch, Aregahegn Werash, Dawit Tsige, Girma Tefera Kasa): historical, not seeded as events.

➡ Seeded weekly events: **Monday Jam Session, Tuesday Live Band (Qarya Groove), Friday Jazz Night, Sunday Zemen Band**. All `needs_review` (2018–2019 data; the venue may have moved).

## 8. Menu

**Source: Foodtolo delivery app** (Flocash), <https://foodtolo.flocash.com/home/restaurantProfile/142>, fetched 2026-09-28. Branch shown: "Bole, Behind Edna Mall" (⚠️ differs from the official "behind Mafi Mall"). Listing date unknown; prices display as "$" but are ETB.

- **Section names**: ✅ match the list in the brief: Chicken Corner, Fish Corner, Mama's Kitchen Specials, National Fasting Corner, National Non-Fasting Corner, Pasta, Pizza Corner, Salad Corner, Soups, Steak Corner.
- **Dish names**: 55 dishes seeded exactly as listed (typos fixed: "papillote", "Chef's Jungle").
- **Prices**: ⚠️ **every price is `needs_review`**. They look like app prices incl. 15% VAT (e.g. 390.92 = 339.93 × 1.15), and are likely several years old; Addis prices have risen a lot since. Seeded **rounded to whole birr as shown in the app**.
- **Amharic dish names**: written by us for national dishes (ዱለት, ቦዘና ሽሮ, ፍርፍር …); international dishes keep a transliteration. ⚠️ owner to check.
- The official site's `/menu/` page only showed 3 sample salads (Tuna Salad, Fruit Salad, Chicken Salad); these were **not** seeded separately.
- **Five-course meal** and **Fasting lunch buffet** were added as menu items with **no price** ("Ask for price"), `needs_review`.

## 9. Reviews

No review text was copied from any site. The website shows **3 clearly-labelled sample reviews** (`is_sample = true`) until the owner provides real ones with permission. Rating context only: Tripadvisor listing <https://www.tripadvisor.com/Restaurant_Review-g293791-d7205512-Reviews-Mama_s_Kitchen-Addis_Ababa.html> (not fetched, 403), evendo 3.7/5 (156 reviews) <https://evendo.com/locations/ethiopia/addis-ababa/restaurant/mama-s-kitchen-bole-medhanialm>.

## 10. Sources consulted

| Source | Result |
|---|---|
| mamaskitchenethiopia.com (live) | ❌ DNS fails; hosting suspended (2025) |
| Internet Archive, 18 pages + 78 uploaded files | ✅ main source |
| facebook.com/MamasKitchenAddisAbaba | ❌ login wall |
| Foodtolo (flocash) delivery app | ✅ menu |
| Tripadvisor | ❌ 403 (only search-result titles used, no content or photos) |
| Modern Addis listing | ❌ fetch failed |
| evendo.com | ✅ rating/area only (generic AI-written text, not used) |
| Wanderlog | not attempted (no unique facts expected) |
