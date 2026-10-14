/**
 * Types for database rows (see supabase/migrations). Amharic fields end in `_am`.
 */
import type { DesignTokens, Swatch } from "./palette";

export type Lang = "en" | "am";
export type Role = "OWNER" | "STAFF";
export type MenuTag = "fasting" | "vegetarian" | "spicy" | "popular" | "new";
export const MENU_TAGS: MenuTag[] = ["fasting", "vegetarian", "spicy", "popular", "new"];

export interface Highlight {
  key: string;
  title: string;
  title_am?: string;
  text?: string;
  text_am?: string;
  image: string;
  blur?: string;
  href: string;
}

export interface Settings {
  name: string;
  name_am: string | null;
  tagline: string | null;
  tagline_am: string | null;
  story: string | null;
  story_am: string | null;
  logo_url: string | null;
  hero_image: string | null;
  hero_image_alt: string | null;
  hero_image_alt_am: string | null;
  hero_blur: string | null;
  about_image: string | null;
  about_image_alt: string | null;
  about_image_alt_am: string | null;
  about_blur: string | null;
  tokens: DesignTokens;
  palette: Swatch[];
  fonts: { heading: string };
  contact: { phones: string[]; whatsapp?: string; telegram?: string; email?: string };
  socials: { facebook?: string; instagram?: string; tiktok?: string; youtube?: string };
  seo: { siteUrl?: string; title?: string; description?: string; keywords?: string[] };
  features: Partial<Record<"events" | "gallery" | "reviews" | "catering" | "inn" | "announcements" | "booking" | "orders" | "darkMode", boolean>>;
  highlights: Highlight[];
  sections: {
    catering?: { title: string; title_am?: string; text: string; text_am?: string; image: string; blur?: string; points?: string[]; points_am?: string[] };
    inn?: { title: string; title_am?: string; text: string; text_am?: string; image: string; blur?: string; locations?: string; locations_am?: string };
  };
  timezone: string;
  currency: string;
  agency: { name: string; url: string } | null;
  needs_review: string[];
  updated_at: string;
}

export interface HoursRow {
  id?: string;
  branch_id: string;
  weekday: number; // 0 = Sunday
  open_time: string | null; // "HH:MM:SS"
  close_time: string | null;
  closed: boolean;
}

export interface Closure {
  id: string;
  branch_id: string | null;
  date: string; // YYYY-MM-DD
  name: string;
  name_am: string | null;
  closed: boolean;
  open_time: string | null;
  close_time: string | null;
}

export interface Branch {
  id: string;
  slug: string;
  name: string;
  name_am: string | null;
  kind: "restaurant" | "lounge" | "catering";
  address: string;
  address_am: string | null;
  description: string | null;
  description_am: string | null;
  phones: string[];
  map_query: string | null;
  lat: number | null;
  lng: number | null;
  photo_url: string | null;
  photo_alt: string | null;
  photo_blur: string | null;
  features: string[];
  is_published: boolean;
  sort: number;
  needs_review: boolean;
  review_note: string | null;
  hours: HoursRow[];
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  name_am: string | null;
  sort: number;
  is_published: boolean;
}

export interface MenuItem {
  id: string;
  category_id: string;
  slug: string;
  name: string;
  name_am: string | null;
  description: string | null;
  description_am: string | null;
  price: number | null;
  photo_url: string | null;
  photo_blur: string | null;
  tags: MenuTag[];
  is_available: boolean;
  is_featured: boolean;
  sort: number;
  branch_ids: string[];
  is_published: boolean;
  needs_review: boolean;
  review_note: string | null;
}

export interface EventRow {
  id: string;
  title: string;
  title_am: string | null;
  description: string | null;
  description_am: string | null;
  branch_id: string | null;
  recurrence: "weekly" | "once";
  weekday: number | null;
  event_date: string | null;
  start_time: string | null;
  end_time: string | null;
  photo_url: string | null;
  photo_blur: string | null;
  is_published: boolean;
  sort: number;
  needs_review: boolean;
  review_note: string | null;
}

export interface GalleryImage {
  id: string;
  url: string;
  blur: string | null;
  width: number | null;
  height: number | null;
  alt: string;
  alt_am: string | null;
  source_status: "OFFICIAL" | "STOCK" | "UPLOAD";
  sort: number;
  is_published: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  text_am: string | null;
  rating: number;
  is_sample: boolean;
  source: string | null;
  is_published: boolean;
  sort: number;
}

export interface Announcement {
  id: string;
  text: string;
  text_am: string | null;
  link: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
}

/** Everything the public website needs, fetched in one cached call. */
export interface SiteData {
  settings: Settings;
  branches: Branch[];
  closures: Closure[];
  categories: Category[];
  items: MenuItem[];
  events: EventRow[];
  gallery: GalleryImage[];
  testimonials: Testimonial[];
  announcements: Announcement[];
}

/** Table booking or catering enquiry sent from the website. */
export interface RequestRow {
  id: string;
  kind: "table" | "catering";
  status: "new" | "confirmed" | "declined" | "done";
  name: string;
  phone: string;
  branch_id: string | null;
  date: string | null;
  time: string | null;
  guests: number | null;
  event_type: string | null;
  message: string | null;
  lang: Lang;
  admin_note: string | null;
  created_at: string;
}
