"use client";

import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { applyBranding, previewLogo } from "@/app/admin/actions";
import { checkTokens, type DesignTokens, type Swatch } from "@/lib/palette";
import type { ActionResult } from "@/lib/admin/mutate";
import { Status, SubmitButton } from "./ui";

const LABELS: Record<keyof DesignTokens, string> = {
  primary: "Primary (buttons, links)",
  primaryStrong: "Primary hover",
  accent: "Accent (use sparingly)",
  background: "Page background",
  surface: "Cards",
  border: "Borders",
  text: "Text",
  muted: "Secondary text",
  onPrimary: "Text on buttons",
};

/**
 * Logo → palette → preview → apply.
 * 1. Upload a logo: the server extracts its colors and proposes tokens.
 * 2. Adjust any color; contrast is checked live (WCAG AA).
 * 3. "Apply to website" saves logo + colors (refused if contrast fails).
 */
export default function BrandingEditor({ logoUrl, tokens: initial, palette }: { logoUrl: string | null; tokens: DesignTokens; palette: Swatch[] }) {
  const [tokens, setTokens] = useState(initial);
  const [swatches, setSwatches] = useState(palette);
  const [newLogo, setNewLogo] = useState<string | null>(null);
  const [notes, setNotes] = useState<string[]>([]);
  const [state, upload] = useActionState(previewLogo as (s: ActionResult | null, f: FormData) => Promise<ActionResult>, null);
  const [saveState, setSaveState] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (state?.ok && state.data) {
      const d = state.data as { url: string; tokens: DesignTokens; swatches: Swatch[]; notes: string[] };
      setNewLogo(d.url);
      setTokens(d.tokens);
      setSwatches(d.swatches);
      setNotes(d.notes);
    }
  }, [state]);

  const checks = useMemo(() => checkTokens(tokens), [tokens]);
  const allPass = checks.every((c) => c.pass);
  const changed = newLogo !== null || JSON.stringify(tokens) !== JSON.stringify(initial);
  const previewVars = { "--c-primary": tokens.primary, "--c-primary-strong": tokens.primaryStrong, "--c-accent": tokens.accent, "--c-bg": tokens.background, "--c-surface": tokens.surface, "--c-border": tokens.border, "--c-text": tokens.text, "--c-muted": tokens.muted, "--c-on-primary": tokens.onPrimary } as React.CSSProperties;

  return (
    <div className="space-y-4">
      <form action={upload} className="flex flex-wrap items-end gap-3">
        <div>
          <p className="label">Logo</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={newLogo ?? logoUrl ?? ""} alt="Current logo" className="h-14 w-auto rounded-[6px] border border-border bg-white p-1" />
        </div>
        <label className="block">
          <span className="label">Upload a new logo (PNG with transparent background is best)</span>
          <input type="file" name="logo" accept="image/png,image/jpeg,image/webp" required className="field !h-auto py-2" />
        </label>
        <SubmitButton className="btn btn-secondary">Extract colors</SubmitButton>
        <Status state={state && !state.ok ? state : null} />
      </form>

      {swatches.length > 0 && (
        <div>
          <p className="label">Colors found in the logo</p>
          <div className="flex flex-wrap gap-2">
            {swatches.map((s) => (
              <span key={s.hex} className="inline-flex items-center gap-2 rounded-full border border-border px-2 py-1 text-[12px]">
                <span className="size-4 rounded-full border border-border" style={{ background: s.hex }} />
                {s.hex} · {Math.round(s.share * 100)}%
              </span>
            ))}
          </div>
          {notes.map((n) => (
            <p key={n} className="text-secondary mt-1">
              ℹ {n}
            </p>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {(Object.keys(LABELS) as (keyof DesignTokens)[]).map((k) => (
            <label key={k} className="flex items-center gap-2 text-[13px]">
              <input type="color" value={tokens[k]} onChange={(e) => setTokens({ ...tokens, [k]: e.target.value.toUpperCase() })} className="size-9 shrink-0 cursor-pointer rounded border border-border" aria-label={LABELS[k]} />
              <span className="min-w-0">
                <span className="block font-semibold">{LABELS[k]}</span>
                <span className="text-muted">{tokens[k]}</span>
              </span>
            </label>
          ))}
        </div>

        {/* Live preview using the proposed colors */}
        <div style={previewVars} className="rounded-[12px] border border-border bg-bg p-4 text-ink">
          <p className="eyebrow">Preview</p>
          <p className="h3 mt-1">Signature dishes</p>
          <p className="text-secondary">Secondary text on the page background.</p>
          <div className="card mt-3 p-3">
            <p className="text-[15px]">Chopped Lamb Tibs</p>
            <p className="font-bold text-primary">ETB 230</p>
          </div>
          <div className="mt-3 flex gap-2">
            <span className="btn btn-primary">View menu</span>
            <span className="btn btn-secondary">Call</span>
          </div>
          <div className="mt-3 rounded-[8px] bg-ink p-3 text-[14px] text-bg">Footer text on dark</div>
        </div>
      </div>

      <details open={!allPass}>
        <summary className="cursor-pointer text-[14px] font-semibold">
          Contrast check (WCAG AA): {allPass ? <span className="text-green-700">all pass ✓</span> : <span className="text-[#b42318]">{checks.filter((c) => !c.pass).length} problem(s)</span>}
        </summary>
        <ul className="mt-2 grid gap-1 text-[13px] sm:grid-cols-2">
          {checks.map((c) => (
            <li key={c.pair} className={c.pass ? "text-muted" : "font-semibold text-[#b42318]"}>
              {c.pass ? "✓" : "✗"} {c.pair}: {c.ratio}:1 (needs {c.required})
            </li>
          ))}
        </ul>
      </details>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="btn btn-primary"
          disabled={!changed || !allPass || pending}
          onClick={() =>
            start(async () => {
              const r = await applyBranding({ logo_url: newLogo ?? undefined, tokens, palette: newLogo ? swatches : undefined });
              setSaveState(r);
              if (r.ok) router.refresh();
            })
          }
        >
          {pending ? "Saving…" : "Apply to website"}
        </button>
        {changed && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setTokens(initial);
              setNewLogo(null);
              setSwatches(palette);
              setNotes([]);
            }}
          >
            Undo changes
          </button>
        )}
        <Status state={saveState} />
      </div>
    </div>
  );
}
