# Mama's Kitchen: restaurant website + admin

A fast, bilingual (English / አማርኛ) restaurant website with a simple admin where the owner and staff edit the menu, hours, events and photos themselves. Built as a **reusable template**: first client Mama's Kitchen (Addis Ababa), resold to other restaurants.

- **Public site:** home (cinematic hero, highlights, signature dishes, live music, **table booking form**, branches with maps & live open/closed status, catering with **enquiry form**, Mama's Inn, story, gallery, reviews) + searchable `/menu` (sections, fasting/vegetarian/spicy/popular filters, branch selector, sold-out labels).
- **Order tray:** guests add dishes from the home page or menu, choose pickup / delivery / dine-in and a branch, then send the whole order as **one WhatsApp (or Telegram) message**. No payments or accounts needed.
- **Installable app (PWA):** "Add to home screen" on Android and iPhone, app icon, home-screen shortcuts (Menu, Book). A service worker (`public/sw.js`) keeps visited pages and photos on the phone, so the menu opens **offline or on a weak connection**; anything not saved shows an offline page with the phone numbers. Admin, forms and API calls are never cached.
- **Light / dark mode** (follows the phone by default, toggle in the header, no flash on load). Dark colors are derived from the logo palette and contrast-checked like the light ones.
- **Admin (`/admin`):** collapsible sidebar + dark mode, dashboard with stats and quick actions (sold out, announcement, today's hours), **Bookings & enquiries inbox** (call / WhatsApp the guest, confirm, notes), **printable menu QR codes** per branch, menu manager (drag reorder, one-tap availability, WebP photo upload, bulk % price change), branches, hours & Ethiopian holiday closures, events, gallery, reviews, settings (logo upload → palette extraction → contrast-checked colors), users (owner invites, OWNER/STAFF roles), "Needs review" list, activity log.
- **Stack:** Next.js 16 (App Router, server mode) · TypeScript · Tailwind CSS 4 · Supabase (Postgres + Auth + Storage) · sharp.

Other docs: [`ADMIN_GUIDE.md`](ADMIN_GUIDE.md) (for the owner, EN + AM) · [`RESEARCH_NOTES.md`](RESEARCH_NOTES.md) (every fact + source) · [`IMAGE_MANIFEST.md`](IMAGE_MANIFEST.md) (every photo + license status) · [`CLIENT_DATA_NEEDED.md`](CLIENT_DATA_NEEDED.md) (what to collect from the owner).

---

## 1. Run it locally (≈10 minutes)

Requirements: **Node.js 20+** and **Docker** (for the local Supabase).

```bash
npm install
npx supabase start          # first run downloads Docker images (a few minutes)
npx supabase status -o env  # shows the local URL and keys
cp .env.example .env.local  # paste API_URL, ANON_KEY, SERVICE_ROLE_KEY into it
npm run db:seed             # loads the researched Mama's Kitchen data
npm run create-owner -- you@example.com "a-long-password" "Your Name"
npm run dev                 # http://localhost:3100  (admin: /admin)
```

Useful local URLs: Supabase Studio (database UI) <http://127.0.0.1:54323> · Mailpit (catches invite/reset emails) <http://127.0.0.1:54324>.

| Command | What it does |
|---|---|
| `npm run dev` / `build` / `start` | Develop / build / run production (port 3100) |
| `npm test` | Unit tests: open/closed logic, holidays, Fasika dates, palette + dark-theme contrast |
| `npm run lint` | Type-check everything |
| `npm run db:reset` | Wipe the local DB, re-run migrations, re-seed |
| `npm run db:seed` | Replace all content with `supabase/seed/data.ts` (keeps users) |
| `npm run create-owner -- email pw "Name" [OWNER\|STAFF]` | Create/promote an admin (first owner) |
| `npm run palette [-- logo.png]` | Print the palette + tokens + WCAG results for a logo |
| `npm run images -- <folder>` | Re-process source photos into `/public/restaurant` (WebP + blur) |
| `npm run images:manifest` | Regenerate `IMAGE_MANIFEST.md` |

## 2. How it works

```
src/
  app/(site)/        public pages: home, /menu (+ layout with header/footer/mobile bar)
  app/admin/         login, auth callback, (panel)/… admin pages, actions.ts (all writes)
  components/site/   public UI (restaurant-agnostic, all content from the DB)
  components/admin/  admin UI
  lib/data.ts        cached public data (one query bundle, tag "site")
  lib/hours.ts       open-now, holidays, Fasika (unit tested)
  lib/palette.ts     logo → swatches → design tokens → WCAG checks (unit-tested via script)
  lib/admin/         auth guards, mutate() wrapper, image upload pipeline
  proxy.ts           refreshes admin sessions, blocks /admin without login
supabase/
  migrations/        schema + Row Level Security + storage bucket; 2nd migration = bookings/enquiries (`requests`)
  seed/data.ts       researched Mama's Kitchen data (with needs_review flags)
  templates/         invite + password-reset emails
```

- **Content & design live in the database.** `restaurant_settings` holds name, story, contact, SEO, feature toggles and the **design tokens** (colors extracted from the logo). The root layout turns tokens into CSS variables; all components use them. Nothing restaurant-specific is hardcoded in components.
- **Fast public pages:** data is fetched once and cached (`unstable_cache`, tag `site`). Every admin save calls `updateTag("site")`, so edits appear **within seconds** while normal visits never wait for the database.
- **Every admin write** goes through `mutate()` (`src/lib/admin/mutate.ts`): server-side role check → query as the logged-in user (RLS enforced) → activity log → cache refresh.

### Security
- **RLS on every table.** Visitors read published rows only. STAFF: menu items (not prices; a DB trigger blocks price changes), hours, closures, events, gallery, announcements. OWNER: everything. `login_attempts` has no policies (server only).
- **No public sign-up** (`enable_signup = false`); owners invite from Admin → Users.
- **Service-role key is server-only** (`src/lib/supabase/service.ts` imports `server-only`), used only for invites/user management and login rate limiting.
- **Login rate limiting:** 5 failed attempts per email / 20 per IP per 15 min.
- **Public forms (bookings/catering):** visitors can only INSERT a `new` request (RLS), never read them; hidden honeypot field against bots; max 5 requests per visitor per hour (IP stored only as a salted hash).
- **Uploads:** admin-only storage policies; bucket limited to images ≤ 5 MB; server re-encodes every upload with sharp (validates it's a real image, strips metadata, resizes to WebP).
- `/admin` is `noindex` and disallowed in `robots.txt`.

## 3. Supabase in production

1. Create a project at <https://supabase.com> (free tier is enough to start). Region: closest to Ethiopia (e.g. Frankfurt / `eu-central-1`).
2. Link and push the schema:
   ```bash
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push            # applies supabase/migrations
   ```
3. **Authentication → Providers → Email:** keep enabled. **Authentication → Settings:** turn **off** "Allow new users to sign up".
4. **Authentication → URL configuration:** Site URL = `https://your-domain`; add `https://your-domain/admin/**` to Redirect URLs.
5. **Authentication → Email Templates:** paste `supabase/templates/invite.html` (Invite) and `recovery.html` (Reset password). Set up SMTP (e.g. Resend, Brevo) so emails are delivered reliably.
6. Put the production values in your host's environment variables (see `.env.example`), then seed and create the owner **from your machine** with those values in `.env.local`:
   ```bash
   npm run db:seed
   npm run create-owner -- owner@restaurant.com "long-password" "Owner Name"
   ```
   The photos in `/public/restaurant` ship with the app; photos uploaded later go to Supabase Storage (`media` bucket).

## 4. First owner account

Public sign-up is disabled, so the first owner is created with the script (above). After that the owner logs in at `/admin` and invites staff from **Users** (email invite, or a temporary password given in person). To reset a forgotten owner password without email: re-run `create-owner` with the same email and a new password.

## 5. Deployment

Hosting: **`[INSERT HOSTING: must support Node.js 20+]`**. This is a server app (not a static export): admin, sessions and instant updates need a Node runtime.

**Option A: Vercel / Netlify** (easiest): import the repo, set the 4 env vars, deploy. Build `npm run build`, output managed automatically.

**Option B: VPS (e.g. Hetzner, DigitalOcean, local Ethiopian host with Node)**
```bash
git clone … && cd … && npm ci
cp .env.example .env.production   # fill in production values
npm run build
npx pm2 start "npm run start" --name mamas-kitchen   # listens on :3100
```
Put Nginx (or Caddy) in front with HTTPS and gzip/brotli:
```nginx
server {
  server_name mamaskitchenethiopia.com;
  location / { proxy_pass http://127.0.0.1:3100; proxy_set_header Host $host; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; }
}
```
(`X-Forwarded-For` is needed for per-IP login rate limiting.)

After deploy: submit `https://domain/sitemap.xml` in Google Search Console, test JSON-LD at <https://search.google.com/test/rich-results>, share the link once in Telegram to check the preview card.

## 6. Set up a NEW restaurant (template)

1. **Copy** the repo, `npm install`, create a new Supabase project (§3).
2. **Research & data:** replace `supabase/seed/data.ts` with the new restaurant's name, story, branches, hours, menu, events, gallery (keep `needs_review` for anything unconfirmed). Or seed a minimal file and let the owner fill in the rest in the admin.
3. **Logo & palette:** save the logo as `public/restaurant/logo.png`, run `npm run palette` to check the extracted colors pass contrast. `db:seed` stores them; the owner can change them later in Settings.
4. **Photos:** list them in `scripts/process-images.mjs`, run `npm run images -- <folder>` and `npm run images:manifest`.
5. **Font:** pick a heading font preset in Admin → Settings (Nunito, Fraunces, Playfair), or add one in `src/app/fonts.ts`.
6. **Text:** UI strings are in `src/i18n/en.json` / `am.json` (shared by all restaurants; change only if needed).
7. `npm run db:seed`, `npm run create-owner …`, deploy (§5).

## 7. App (PWA) notes

- Icons are generated from the logo: `node scripts/make-icons.mjs` → `public/icons/` (run again after changing the logo).
- The manifest (`src/app/manifest.ts`) takes name and colors from the database.
- After changing caching rules in `public/sw.js`, bump `VERSION` at the top so phones drop old caches.
- The service worker only runs on the production build (`npm run build && npm start`) or a deployed site with HTTPS.

## 8. Image guidelines

| Use | Size (auto-cropped on upload) | Target |
|---|---|---|
| Hero | 1600×900 | ≤ 250 KB |
| Dish / event / highlight | 800×600 (4:3) | ≤ 120 KB |
| Branch | 900×600 (3:2) | ≤ 120 KB |
| Gallery | up to 1600 px, shape kept | ≤ 120 KB |
| Logo | PNG with transparency, ≥ 400 px wide | |

Upload anything from a phone (JPG/PNG/WebP ≤ 5 MB); the server converts to WebP, crops with smart focus, creates a blur placeholder and never enlarges small photos. Daylight, 45° or top-down food shots work best.

## 9. Quality checks done
See the final report in the handover message: 360/768/1280 px, EN + AM, OWNER + STAFF, live-edit timing, Lighthouse, contrast.
