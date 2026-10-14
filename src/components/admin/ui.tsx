"use client";

/**
 * Small admin building blocks. Same design language as the public site
 * (tokens, 40px buttons, 8px radius), just denser.
 */
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/lib/admin/mutate";
import { GripIcon, ChevronUpIcon, ChevronDownIcon } from "../Icons";

type FormAction = (state: ActionResult | null, form: FormData) => Promise<ActionResult | null | { error?: string; message?: string }>;

/** A form bound to a server action, with "Saved ✓" / error feedback and page refresh on success. */
export function ActionForm({
  action,
  children,
  className = "",
  submit = "Save",
  resetOnSuccess = false,
  onSuccess,
}: {
  action: FormAction;
  children: React.ReactNode;
  className?: string;
  submit?: string | null;
  resetOnSuccess?: boolean;
  onSuccess?: (r: ActionResult) => void;
}) {
  const [state, formAction] = useActionState(action as never, null as ActionResult | null);
  const ref = useRef<HTMLFormElement>(null);
  const router = useRouter();
  useEffect(() => {
    if (state && "ok" in state && state.ok) {
      if (resetOnSuccess) ref.current?.reset();
      onSuccess?.(state);
      router.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
  return (
    <form ref={ref} action={formAction} className={className}>
      {children}
      {submit !== null && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <SubmitButton>{submit}</SubmitButton>
          <Status state={state} />
        </div>
      )}
      {submit === null && <Status state={state} />}
    </form>
  );
}

export function Status({ state }: { state: unknown }) {
  const s = state as { ok?: boolean; error?: string; message?: string } | null;
  if (!s) return null;
  if (s.ok === false || s.error)
    return (
      <p role="alert" className="text-[14px] font-medium text-[#b42318]">
        {s.error}
      </p>
    );
  return (
    <p role="status" className="text-[14px] font-medium text-green-700">
      ✓ {s.message ?? "Saved"}
    </p>
  );
}

export function SubmitButton({ children, className = "btn btn-primary" }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? "Saving…" : children}
    </button>
  );
}

/** Label + input. */
export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[12px] text-muted">{hint}</span>}
    </label>
  );
}

/** English and Amharic side by side (stacked on phones). */
export function BiField({
  name,
  label,
  en,
  am,
  textarea = false,
  required = false,
  rows = 3,
}: {
  name: string;
  label: string;
  en?: string | null;
  am?: string | null;
  textarea?: boolean;
  required?: boolean;
  rows?: number;
}) {
  const Input = textarea ? "textarea" : "input";
  return (
    <fieldset className="grid gap-2 sm:grid-cols-2">
      <legend className="label">{label}</legend>
      <label className="block">
        <span className="mb-0.5 block text-[12px] font-semibold text-muted">English</span>
        <Input name={name} defaultValue={en ?? ""} required={required} rows={textarea ? rows : undefined} className="field" />
      </label>
      <label className="block">
        <span className="mb-0.5 block text-[12px] font-semibold text-muted" lang="am">
          አማርኛ
        </span>
        <Input name={`${name}_am`} defaultValue={am ?? ""} lang="am" rows={textarea ? rows : undefined} className="field" />
      </label>
    </fieldset>
  );
}

export function Checkbox({ name, label, defaultChecked, hint }: { name: string; label: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex min-h-10 cursor-pointer items-start gap-2.5 py-1.5">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 size-5 accent-[var(--c-primary)]" />
      <span className="text-[14px]">
        {label}
        {hint && <span className="block text-[12px] text-muted">{hint}</span>}
      </span>
    </label>
  );
}

/** Photo picker with instant preview. The file is sent with the form. */
export function PhotoInput({ name = "photo", current, label = "Photo", hint }: { name?: string; current?: string | null; label?: string; hint?: string }) {
  const [preview, setPreview] = useState<string | null>(current ?? null);
  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex items-center gap-3">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-[8px] border border-border bg-bg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {preview ? <img src={preview} alt="" className="size-full object-cover" /> : <span className="flex size-full items-center justify-center text-[11px] text-muted">No photo</span>}
        </div>
        <label className="btn btn-secondary btn-sm cursor-pointer">
          {preview ? "Change photo" : "Upload photo"}
          <input
            type="file"
            name={name}
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setPreview(URL.createObjectURL(f));
            }}
          />
        </label>
      </div>
      <p className="mt-1 text-[12px] text-muted">{hint ?? "JPG/PNG/WebP up to 5 MB. Cropped, resized and converted to WebP automatically."}</p>
    </div>
  );
}

/** On/off switch that calls a server action immediately (optimistic). */
export function Toggle({ checked, onChange, label, onLabel, offLabel }: { checked: boolean; onChange: (v: boolean) => Promise<ActionResult>; label: string; onLabel?: string; offLabel?: string }) {
  const [value, setValue] = useState(checked);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => setValue(checked), [checked]);
  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={label}
        disabled={pending}
        onClick={() => {
          const next = !value;
          setValue(next);
          setError(null);
          start(async () => {
            const r = await onChange(next);
            if (!r.ok) {
              setValue(!next);
              setError(r.error);
            } else router.refresh();
          });
        }}
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors after:absolute after:-inset-1.5 ${value ? "bg-green-600" : "bg-[#c9bcbd]"} ${pending ? "opacity-60" : ""}`}
      >
        <span className={`inline-block size-5 rounded-full bg-white shadow transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} />
      </button>
      {(onLabel || offLabel) && <span className={`text-[13px] font-semibold ${value ? "text-green-700" : "text-muted"}`}>{value ? onLabel : offLabel}</span>}
      {error && <span className="text-[12px] text-[#b42318]">{error}</span>}
    </span>
  );
}

/** Button that asks for confirmation, then runs a server action. */
export function ConfirmButton({ action, confirm, children, className = "btn btn-ghost btn-sm !text-[#b42318]" }: { action: () => Promise<ActionResult>; confirm: string; children: React.ReactNode; className?: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        disabled={pending}
        className={className}
        onClick={() => {
          if (!window.confirm(confirm)) return;
          start(async () => {
            const r = await action();
            if (!r.ok) setError(r.error);
            else router.refresh();
          });
        }}
      >
        {pending ? "…" : children}
      </button>
      {error && <span className="text-[12px] text-[#b42318]">{error}</span>}
    </span>
  );
}

/**
 * Drag-and-drop list (mouse/touch-pen) with ↑↓ buttons as the keyboard- and
 * phone-friendly alternative. Calls `onReorder(ids)` after each change.
 */
export function SortableList<T extends { id: string }>({ items, onReorder, render }: { items: T[]; onReorder: (ids: string[]) => Promise<ActionResult>; render: (item: T) => React.ReactNode }) {
  const [order, setOrder] = useState(items);
  const [dragId, setDragId] = useState<string | null>(null);
  const [, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  useEffect(() => setOrder(items), [items]);

  const commit = (next: T[]) => {
    setOrder(next);
    start(async () => {
      const r = await onReorder(next.map((i) => i.id));
      if (!r.ok) setError(r.error);
    });
  };
  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x);
    commit(next);
  };

  return (
    <>
      {error && <p className="mb-2 text-[13px] text-[#b42318]">{error}</p>}
      <ul className="divide-y divide-border">
        {order.map((item, i) => (
          <li
            key={item.id}
            draggable
            onDragStart={() => setDragId(item.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (!dragId || dragId === item.id) return;
              move(order.findIndex((x) => x.id === dragId), i);
              setDragId(null);
            }}
            className={`flex items-center gap-2 py-2 ${dragId === item.id ? "opacity-40" : ""}`}
          >
            <span className="hidden cursor-grab text-muted sm:block" aria-hidden="true">
              <GripIcon size={18} />
            </span>
            <div className="min-w-0 flex-1">{render(item)}</div>
            <span className="flex shrink-0">
              <button type="button" aria-label="Move up" onClick={() => move(i, i - 1)} disabled={i === 0} className="inline-flex size-10 items-center justify-center rounded-[8px] text-muted hover:bg-bg hover:text-primary disabled:opacity-20">
                <ChevronUpIcon size={18} />
              </button>
              <button type="button" aria-label="Move down" onClick={() => move(i, i + 1)} disabled={i === order.length - 1} className="inline-flex size-10 items-center justify-center rounded-[8px] text-muted hover:bg-bg hover:text-primary disabled:opacity-20">
                <ChevronDownIcon size={18} />
              </button>
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

export function ReviewBadge({ note }: { note?: string | null }) {
  return (
    <span title={note ?? "Needs review"} className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-900">
      Needs review
    </span>
  );
}

export function PageTitle({ title, children, lead }: { title: string; lead?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="h2">{title}</h1>
        {lead && <p className="text-secondary mt-0.5 max-w-2xl">{lead}</p>}
      </div>
      {children}
    </div>
  );
}
