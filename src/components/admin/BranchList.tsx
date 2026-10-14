"use client";

import Link from "next/link";
import { reorder, setPublished } from "@/app/admin/actions";
import type { Branch } from "@/lib/types";
import { ReviewBadge, SortableList, Toggle } from "./ui";

export default function BranchList({ branches }: { branches: Omit<Branch, "hours">[] }) {
  return (
    <div className="card p-4">
      <SortableList
        items={branches}
        onReorder={(ids) => reorder("branches", ids)}
        render={(b) => (
          <div className="flex items-center gap-3">
            <div className="size-12 shrink-0 overflow-hidden rounded-[6px] bg-bg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {b.photo_url && <img src={b.photo_url} alt="" className="size-full object-cover" />}
            </div>
            <Link href={`/admin/branches/${b.id}/`} className="min-w-0 flex-1 hover:text-primary">
              <span className="block truncate text-[14px] font-semibold">{b.name}</span>
              <span className="flex flex-wrap items-center gap-2 text-[12px] text-muted">
                {b.address}
                {b.needs_review && <ReviewBadge note={b.review_note} />}
              </span>
            </Link>
            <Toggle checked={b.is_published} label={`Show ${b.name} on website`} onChange={(v) => setPublished("branches", b.id, v)} />
          </div>
        )}
      />
    </div>
  );
}
