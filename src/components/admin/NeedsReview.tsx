"use client";

import Link from "next/link";
import { markReviewed, resolveSettingNote } from "@/app/admin/actions";
import type { Role } from "@/lib/types";
import { ConfirmButton } from "./ui";

type Row = { id: string; name: string; note: string | null; table: "menu_items" | "branches" | "events"; href: string };

export default function NeedsReview({ settingsNotes, rows, role }: { settingsNotes: string[]; rows: Row[]; role: Role }) {
  const groups: [string, Row[]][] = [
    ["Branches", rows.filter((r) => r.table === "branches")],
    ["Events", rows.filter((r) => r.table === "events")],
    ["Menu (mostly prices from an old delivery app)", rows.filter((r) => r.table === "menu_items")],
  ];
  const total = rows.length + settingsNotes.length;
  if (!total) return <p className="card p-6 text-center">✓ Everything is confirmed. Nice work!</p>;
  return (
    <div className="space-y-4">
      {settingsNotes.length > 0 && (
        <section className="card p-4">
          <h2 className="h3 mb-2">General settings ({settingsNotes.length})</h2>
          <ul className="divide-y divide-border">
            {settingsNotes.map((n) => (
              <li key={n} className="flex flex-wrap items-start justify-between gap-2 py-2 text-[14px]">
                <span className="min-w-0 flex-1">{n}</span>
                <span className="flex gap-2">
                  {role === "OWNER" && (
                    <>
                      <Link href="/admin/settings/" className="btn btn-secondary btn-sm">
                        Edit
                      </Link>
                      <ConfirmButton action={() => resolveSettingNote(n)} confirm="Mark this as confirmed?" className="btn btn-sm btn-primary">
                        Confirmed
                      </ConfirmButton>
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
      {groups.map(([title, list]) =>
        list.length ? (
          <section key={title} className="card p-4">
            <h2 className="h3 mb-2">
              {title} ({list.length})
            </h2>
            <ul className="divide-y divide-border">
              {list.map((r) => (
                <li key={r.id} className="flex flex-wrap items-start justify-between gap-2 py-2 text-[14px]">
                  <span className="min-w-0 flex-1">
                    <strong>{r.name}</strong>
                    <span className="text-secondary block">{r.note}</span>
                  </span>
                  <span className="flex gap-2">
                    <Link href={r.href} className="btn btn-secondary btn-sm">
                      Edit
                    </Link>
                    {(r.table !== "branches" || role === "OWNER") && (
                      <ConfirmButton action={() => markReviewed(r.table, r.id)} confirm={`Mark "${r.name}" as confirmed (the information is correct)?`} className="btn btn-sm btn-primary">
                        Confirmed
                      </ConfirmButton>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null,
      )}
    </div>
  );
}
