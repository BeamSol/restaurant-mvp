"use client";

/**
 * The "order tray": guests add dishes, then send the whole order to the
 * restaurant as ONE WhatsApp (or Telegram) message. No payments, no accounts:
 * the restaurant confirms by phone, which is how ordering works in Addis today.
 * Kept in sessionStorage so it survives page changes (home ↔ menu).
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export interface OrderLine {
  id: string;
  name: string;
  name_am: string | null;
  price: number | null;
  qty: number;
}

interface OrderValue {
  lines: OrderLine[];
  count: number;
  total: number;
  hasUnpriced: boolean;
  add: (line: Omit<OrderLine, "qty">) => void;
  change: (id: string, delta: number) => void;
  clear: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  /** Last added dish id: drives the little "Added" feedback. */
  lastAdded: string | null;
}

const OrderContext = createContext<OrderValue | null>(null);
const KEY = "order-tray";

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<OrderLine[]>([]);
  const [open, setOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(KEY);
      if (saved) setLines(JSON.parse(saved));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(lines));
    } catch {}
  }, [lines]);

  const add = useCallback((line: Omit<OrderLine, "qty">) => {
    setLines((cur) => {
      const found = cur.find((l) => l.id === line.id);
      return found ? cur.map((l) => (l.id === line.id ? { ...l, qty: Math.min(99, l.qty + 1) } : l)) : [...cur, { ...line, qty: 1 }];
    });
    setLastAdded(line.id);
    setTimeout(() => setLastAdded((v) => (v === line.id ? null : v)), 1400);
  }, []);
  const change = useCallback((id: string, delta: number) => {
    setLines((cur) => cur.map((l) => (l.id === id ? { ...l, qty: l.qty + delta } : l)).filter((l) => l.qty > 0));
  }, []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<OrderValue>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const total = lines.reduce((n, l) => n + (l.price ?? 0) * l.qty, 0);
    return { lines, count, total, hasUnpriced: lines.some((l) => l.price === null), add, change, clear, open, setOpen, lastAdded };
  }, [lines, add, change, clear, open, lastAdded]);

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder must be used inside <OrderProvider>");
  return ctx;
}
