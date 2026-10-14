import Link from "next/link";
import { requirePageAdmin } from "@/lib/admin/auth";
import { NAV } from "@/components/admin/nav-items";
import { logout } from "@/app/admin/auth-actions";

/** Phone-only page listing the admin sections that don't fit in the bottom tabs. */
export default async function MorePage() {
  const admin = await requirePageAdmin();
  return (
    <div>
      <h1 className="h2 mb-4">More</h1>
      <ul className="card divide-y divide-border">
        {NAV.filter((i) => !i.tab && (!i.owner || admin.role === "OWNER")).map(({ href, label }) => (
          <li key={href}>
            <Link href={href} className="flex h-12 items-center justify-between px-4 text-[15px] font-medium">
              {label} <span aria-hidden="true">›</span>
            </Link>
          </li>
        ))}
        <li>
          <Link href="/" target="_blank" className="flex h-12 items-center px-4 text-[15px] font-medium text-primary">
            View website ↗
          </Link>
        </li>
      </ul>
      <p className="text-secondary mt-4">
        Signed in as {admin.email} ({admin.role === "OWNER" ? "Owner" : "Staff"})
      </p>
      <form action={logout}>
        <button className="btn btn-secondary mt-3">Log out</button>
      </form>
    </div>
  );
}
