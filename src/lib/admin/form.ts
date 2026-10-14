/** Small helpers to read FormData safely in server actions. */
export const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
export const opt = (f: FormData, k: string) => str(f, k) || null;
export const bool = (f: FormData, k: string) => f.get(k) === "on" || f.get(k) === "true";
export const num = (f: FormData, k: string) => {
  const v = str(f, k);
  if (v === "") return null;
  const n = Number(v.replace(/,/g, ""));
  if (!Number.isFinite(n)) throw new Error(`"${k}" must be a number`);
  return n;
};
export const list = (f: FormData, k: string) => f.getAll(k).map(String).filter(Boolean);
/** One entry per line (or comma), trimmed. */
export const lines = (f: FormData, k: string) =>
  str(f, k)
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60) || `item-${Date.now()}`;
export const isUuid = (s: string) => /^[0-9a-f-]{36}$/i.test(s);
export const isTime = (s: string) => /^([01]\d|2[0-4]):[0-5]\d$/.test(s);
export const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);
