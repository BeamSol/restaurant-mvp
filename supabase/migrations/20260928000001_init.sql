-- =============================================================================
-- Mama's Kitchen / restaurant template: initial schema
--
-- Security model (Row Level Security on EVERY table):
--   • Visitors (anon)     → read published content only
--   • STAFF               → day-to-day content: menu items (not prices), hours,
--                           closures, events, gallery, announcements
--   • OWNER               → everything, incl. settings, branches, categories,
--                           prices, reviews, users, activity log
-- Role checks are ALSO done in server code (defence in depth).
-- =============================================================================

create type public.admin_role as enum ('OWNER', 'STAFF');

-- ---------------------------------------------------------------------------
-- Admin users (linked to Supabase Auth). No public sign-up: owners invite.
-- ---------------------------------------------------------------------------
create table public.admin_users (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text,
  role        public.admin_role not null default 'STAFF',
  created_at  timestamptz not null default now()
);

-- Helper functions. SECURITY DEFINER so policies can call them without
-- recursive RLS checks on admin_users.
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

create or replace function public.is_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid() and role = 'OWNER');
$$;

-- ---------------------------------------------------------------------------
-- Restaurant settings: exactly one row (id = 1)
-- ---------------------------------------------------------------------------
create table public.restaurant_settings (
  id              smallint primary key default 1 check (id = 1),
  name            text not null,
  name_am         text,
  tagline         text,
  tagline_am      text,
  story           text,
  story_am        text,
  logo_url        text,
  hero_image      text,
  hero_image_alt  text,
  hero_image_alt_am text,
  hero_blur       text,
  about_image     text,
  about_image_alt text,
  about_image_alt_am text,
  about_blur      text,
  -- Design tokens (see src/lib/palette.ts → DesignTokens) and the logo swatches they came from
  tokens          jsonb not null,
  palette         jsonb not null default '[]',
  -- { "heading": "nunito" | "fraunces" | "playfair" }
  fonts           jsonb not null default '{"heading":"nunito"}',
  -- { "phones": [..], "whatsapp": "", "telegram": "", "email": "" }
  contact         jsonb not null default '{}',
  -- { "facebook": "", "instagram": "", "tiktok": "", "youtube": "" }
  socials         jsonb not null default '{}',
  -- { "siteUrl": "", "title": "", "description": "", "keywords": [..] }
  seo             jsonb not null default '{}',
  -- Feature toggles: { "events": true, "gallery": true, "reviews": true, "catering": true, "inn": true, "announcements": true }
  features        jsonb not null default '{}',
  -- Home "highlights" strip: [{ key, title, title_am, text, text_am, image, blur, href }]
  highlights      jsonb not null default '[]',
  -- Catering + Mama's Inn blocks: { catering: {...}, inn: {...} }
  sections        jsonb not null default '{}',
  timezone        text not null default 'Africa/Addis_Ababa',
  currency        text not null default 'ETB',
  -- "Website by …" credit: { name, url }
  agency          jsonb,
  -- Names of settings fields that still need the owner's confirmation
  needs_review    text[] not null default '{}',
  updated_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Branches + weekly hours + holiday closures
-- ---------------------------------------------------------------------------
create table public.branches (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  name            text not null,
  name_am         text,
  kind            text not null default 'restaurant' check (kind in ('restaurant', 'lounge', 'catering')),
  address         text not null,
  address_am      text,
  description     text,
  description_am  text,
  phones          text[] not null default '{}',
  -- Text Google Maps searches for (embed + directions), e.g. "Mama's Kitchen 4 Killo Addis Ababa"
  map_query       text,
  lat             double precision,
  lng             double precision,
  photo_url       text,
  photo_alt       text,
  photo_blur      text,
  -- e.g. {'live_music','buffet','garden','vip','catering','events'}
  features        text[] not null default '{}',
  is_published    boolean not null default true,
  sort            int not null default 0,
  needs_review    boolean not null default false,
  review_note     text,
  updated_at      timestamptz not null default now()
);

create table public.opening_hours (
  id          uuid primary key default gen_random_uuid(),
  branch_id   uuid not null references public.branches (id) on delete cascade,
  weekday     smallint not null check (weekday between 0 and 6), -- 0 = Sunday
  open_time   time,
  close_time  time,  -- may be earlier than open_time (closes after midnight)
  closed      boolean not null default false,
  unique (branch_id, weekday),
  check (closed or (open_time is not null and close_time is not null))
);

create table public.special_closures (
  id          uuid primary key default gen_random_uuid(),
  branch_id   uuid references public.branches (id) on delete cascade, -- null = all branches
  date        date not null,
  name        text not null,          -- e.g. "Genna (Ethiopian Christmas)"
  name_am     text,
  closed      boolean not null default true,
  open_time   time,                   -- special hours when closed = false
  close_time  time,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Menu
-- ---------------------------------------------------------------------------
create table public.menu_categories (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name          text not null,
  name_am       text,
  sort          int not null default 0,
  is_published  boolean not null default true
);

create table public.menu_items (
  id              uuid primary key default gen_random_uuid(),
  category_id     uuid not null references public.menu_categories (id) on delete restrict,
  slug            text not null unique,
  name            text not null,
  name_am         text,
  description     text,
  description_am  text,
  price           numeric(10, 2) check (price is null or price >= 0), -- null = "ask for price"
  photo_url       text,
  photo_blur      text,
  tags            text[] not null default '{}'
                  check (tags <@ array['fasting', 'vegetarian', 'spicy', 'popular', 'new']::text[]),
  is_available    boolean not null default true,   -- false = "Sold out" today
  is_featured     boolean not null default false,  -- shown in "Signature dishes"
  sort            int not null default 0,
  branch_ids      uuid[] not null default '{}',    -- empty = served at all branches
  is_published    boolean not null default true,
  needs_review    boolean not null default false,
  review_note     text,
  updated_at      timestamptz not null default now()
);
create index on public.menu_items (category_id, sort);

-- ---------------------------------------------------------------------------
-- Events: weekly nights (weekday) or one-off (event_date)
-- ---------------------------------------------------------------------------
create table public.events (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  title_am        text,
  description     text,
  description_am  text,
  branch_id       uuid references public.branches (id) on delete set null,
  recurrence      text not null default 'weekly' check (recurrence in ('weekly', 'once')),
  weekday         smallint check (weekday between 0 and 6),
  event_date      date,
  start_time      time,
  end_time        time,
  photo_url       text,
  photo_blur      text,
  is_published    boolean not null default true,
  sort            int not null default 0,
  needs_review    boolean not null default false,
  review_note     text,
  updated_at      timestamptz not null default now(),
  check ((recurrence = 'weekly' and weekday is not null) or (recurrence = 'once' and event_date is not null))
);

-- ---------------------------------------------------------------------------
-- Gallery, testimonials, announcements
-- ---------------------------------------------------------------------------
create table public.gallery_images (
  id            uuid primary key default gen_random_uuid(),
  url           text not null,
  blur          text,
  width         int,
  height        int,
  alt           text not null,
  alt_am        text,
  source_status text not null default 'UPLOAD' check (source_status in ('OFFICIAL', 'STOCK', 'UPLOAD')),
  sort          int not null default 0,
  is_published  boolean not null default true,
  created_at    timestamptz not null default now()
);

create table public.testimonials (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  text          text not null,
  text_am       text,
  rating        smallint not null default 5 check (rating between 1 and 5),
  -- Sample reviews are clearly labelled on the site. Never publish invented reviews as real.
  is_sample     boolean not null default false,
  source        text,  -- e.g. "Google review, March 2026 (permission given)"
  is_published  boolean not null default true,
  sort          int not null default 0,
  created_at    timestamptz not null default now()
);

create table public.announcements (
  id          uuid primary key default gen_random_uuid(),
  text        text not null,
  text_am     text,
  link        text,
  starts_at   timestamptz,
  ends_at     timestamptz,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Activity log + login attempts (rate limiting)
-- ---------------------------------------------------------------------------
create table public.activity_log (
  id          bigint generated always as identity primary key,
  user_id     uuid references auth.users (id) on delete set null,
  email       text,
  action      text not null,  -- create | update | delete | login | …
  entity      text not null,  -- menu_item | branch | settings | …
  entity_id   text,
  summary     text,
  created_at  timestamptz not null default now()
);
create index on public.activity_log (created_at desc);

create table public.login_attempts (
  id          bigint generated always as identity primary key,
  email       text not null,
  ip          text,
  success     boolean not null,
  created_at  timestamptz not null default now()
);
create index on public.login_attempts (email, created_at desc);
create index on public.login_attempts (ip, created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger touch before update on public.restaurant_settings for each row execute function public.touch_updated_at();
create trigger touch before update on public.branches for each row execute function public.touch_updated_at();
create trigger touch before update on public.menu_items for each row execute function public.touch_updated_at();
create trigger touch before update on public.events for each row execute function public.touch_updated_at();

-- STAFF may edit dishes (text, photo, sold-out) but NOT prices. Enforced in the database.
create or replace function public.guard_menu_price() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_owner() and new.price is distinct from old.price then
    raise exception 'Only the owner can change prices' using errcode = '42501';
  end if;
  return new;
end $$;
create trigger guard_price before update on public.menu_items for each row execute function public.guard_menu_price();

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table public.admin_users         enable row level security;
alter table public.restaurant_settings enable row level security;
alter table public.branches            enable row level security;
alter table public.opening_hours       enable row level security;
alter table public.special_closures    enable row level security;
alter table public.menu_categories     enable row level security;
alter table public.menu_items          enable row level security;
alter table public.events              enable row level security;
alter table public.gallery_images      enable row level security;
alter table public.testimonials        enable row level security;
alter table public.announcements       enable row level security;
alter table public.activity_log        enable row level security;
alter table public.login_attempts      enable row level security; -- no policies: server (service key) only

-- admin_users: you can see yourself; the owner sees and manages everyone
create policy "admins read self, owner reads all" on public.admin_users for select to authenticated
  using (user_id = auth.uid() or public.is_owner());
create policy "owner manages admins" on public.admin_users for all to authenticated
  using (public.is_owner()) with check (public.is_owner());

-- settings: public read, owner write
create policy "public read settings" on public.restaurant_settings for select using (true);
create policy "owner writes settings" on public.restaurant_settings for update to authenticated
  using (public.is_owner()) with check (public.is_owner());

-- branches: public reads published; owner writes
create policy "public read published branches" on public.branches for select
  using (is_published or public.is_admin());
create policy "owner writes branches" on public.branches for all to authenticated
  using (public.is_owner()) with check (public.is_owner());

-- hours & closures: public read; staff + owner write
create policy "public read hours" on public.opening_hours for select using (true);
create policy "admins write hours" on public.opening_hours for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "public read closures" on public.special_closures for select using (true);
create policy "admins write closures" on public.special_closures for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- menu categories: public reads published; owner writes
create policy "public read categories" on public.menu_categories for select
  using (is_published or public.is_admin());
create policy "owner writes categories" on public.menu_categories for all to authenticated
  using (public.is_owner()) with check (public.is_owner());

-- menu items: public reads published; staff create/update (prices guarded by trigger); owner deletes
create policy "public read items" on public.menu_items for select
  using (is_published or public.is_admin());
create policy "admins insert items" on public.menu_items for insert to authenticated
  with check (public.is_admin());
create policy "admins update items" on public.menu_items for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "owner deletes items" on public.menu_items for delete to authenticated
  using (public.is_owner());

-- events, gallery, announcements: public reads published/active; staff + owner write
create policy "public read events" on public.events for select using (is_published or public.is_admin());
create policy "admins write events" on public.events for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "public read gallery" on public.gallery_images for select using (is_published or public.is_admin());
create policy "admins write gallery" on public.gallery_images for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "public read announcements" on public.announcements for select using (is_active or public.is_admin());
create policy "admins write announcements" on public.announcements for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- testimonials: public reads published; owner writes (reviews need permission, so owner only)
create policy "public read testimonials" on public.testimonials for select using (is_published or public.is_admin());
create policy "owner writes testimonials" on public.testimonials for all to authenticated
  using (public.is_owner()) with check (public.is_owner());

-- activity log: any admin can append their own entries; only the owner reads
create policy "admins append log" on public.activity_log for insert to authenticated
  with check (public.is_admin() and user_id = auth.uid());
create policy "owner reads log" on public.activity_log for select to authenticated
  using (public.is_owner());

-- =============================================================================
-- Storage: one public "media" bucket. Anyone can view; only admins upload.
-- Images only, max 5 MB (uploads are also resized to WebP on the server).
-- =============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/webp', 'image/jpeg', 'image/png', 'image/svg+xml'])
on conflict (id) do nothing;

create policy "public reads media" on storage.objects for select using (bucket_id = 'media');
create policy "admins upload media" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());
create policy "admins update media" on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_admin());
create policy "admins delete media" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());
