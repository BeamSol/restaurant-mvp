-- =============================================================================
-- Table bookings + catering enquiries from the public website.
-- Visitors can only CREATE a request (never read others'). Admins manage them.
-- =============================================================================

create table public.requests (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('table', 'catering')),
  status      text not null default 'new' check (status in ('new', 'confirmed', 'declined', 'done')),
  name        text not null check (char_length(name) between 2 and 80),
  phone       text not null check (char_length(phone) between 7 and 25),
  branch_id   uuid references public.branches (id) on delete set null,
  date        date,
  time        time,
  guests      smallint check (guests is null or guests between 1 and 2000),
  event_type  text check (event_type is null or char_length(event_type) <= 60),
  message     text check (message is null or char_length(message) <= 1000),
  lang        text not null default 'en' check (lang in ('en', 'am')),
  ip_hash     text,          -- for spam rate limiting (hashed, never the raw IP)
  admin_note  text,
  handled_by  uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index on public.requests (status, created_at desc);
create index on public.requests (ip_hash, created_at desc);

create trigger touch before update on public.requests for each row execute function public.touch_updated_at();

alter table public.requests enable row level security;

-- Public: may only insert brand-new requests (status forced to 'new', no admin fields)
create policy "public creates requests" on public.requests for insert to anon, authenticated
  with check (status = 'new' and admin_note is null and handled_by is null);
-- Staff + owner read and update (confirm / decline / done); owner deletes
create policy "admins read requests" on public.requests for select to authenticated using (public.is_admin());
create policy "admins update requests" on public.requests for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "owner deletes requests" on public.requests for delete to authenticated using (public.is_owner());

-- Feature toggles for the new website sections (on by default)
update public.restaurant_settings
set features = features || '{"booking": true, "orders": true, "darkMode": true}'::jsonb
where id = 1;
