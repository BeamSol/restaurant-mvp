/** Admin sections. `owner`: only visible to OWNER. `tab`: shown in the phone bottom bar. `badge`: counter key. */
import { AlertIcon, CalendarIcon, ClockIcon, HomeIcon, ImageIcon, InboxIcon, ListIcon, MusicIcon, QrIcon, SettingsIcon, StarIcon, StoreIcon, UsersIcon } from "../Icons";

export type Item = { href: string; label: string; Icon: typeof HomeIcon; owner?: boolean; tab?: boolean; badge?: "requests" | "review"; group: string };
export const NAV: Item[] = [
  { href: "/admin/", label: "Dashboard", Icon: HomeIcon, tab: true, group: "Overview" },
  { href: "/admin/requests/", label: "Bookings & enquiries", Icon: InboxIcon, tab: true, badge: "requests", group: "Overview" },
  { href: "/admin/needs-review/", label: "Needs review", Icon: AlertIcon, badge: "review", group: "Overview" },
  { href: "/admin/menu/", label: "Menu", Icon: ListIcon, tab: true, group: "Content" },
  { href: "/admin/hours/", label: "Hours & holidays", Icon: ClockIcon, tab: true, group: "Content" },
  { href: "/admin/events/", label: "Events", Icon: MusicIcon, group: "Content" },
  { href: "/admin/gallery/", label: "Gallery", Icon: ImageIcon, group: "Content" },
  { href: "/admin/branches/", label: "Branches", Icon: StoreIcon, owner: true, group: "Content" },
  { href: "/admin/reviews/", label: "Reviews", Icon: StarIcon, owner: true, group: "Content" },
  { href: "/admin/qr/", label: "QR codes", Icon: QrIcon, group: "Tools" },
  { href: "/admin/settings/", label: "Settings", Icon: SettingsIcon, owner: true, group: "Tools" },
  { href: "/admin/users/", label: "Users", Icon: UsersIcon, owner: true, group: "Tools" },
  { href: "/admin/activity/", label: "Activity log", Icon: CalendarIcon, owner: true, group: "Tools" },
];
