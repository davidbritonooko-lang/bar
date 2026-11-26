"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { MenuItem } from "@/lib/menu";

type CartLine = { item: MenuItem; quantity: number };
type CartContextValue = { lines: CartLine[]; count: number; total: number; add: (item: MenuItem) => void; change: (id: string, delta: number) => void; clear: () => void };
const Context = createContext<CartContextValue | null>(null);
export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  useEffect(() => { try { const saved = localStorage.getItem("noir-cart"); if (saved) setLines(JSON.parse(saved)); } catch { localStorage.removeItem("noir-cart"); } }, []);
  useEffect(() => { localStorage.setItem("noir-cart", JSON.stringify(lines)); }, [lines]);
  const value = useMemo(() => ({
    lines, count: lines.reduce((n, l) => n + l.quantity, 0), total: lines.reduce((n, l) => n + l.item.price * l.quantity, 0),
    add: (item: MenuItem) => setLines(prev => { const line = prev.find(l => l.item.id === item.id); return line ? prev.map(l => l.item.id === item.id ? { ...l, quantity: l.quantity + 1 } : l) : [...prev, { item, quantity: 1 }]; }),
    change: (id: string, delta: number) => setLines(prev => prev.map(l => l.item.id === id ? { ...l, quantity: l.quantity + delta } : l).filter(l => l.quantity > 0)),
    clear: () => setLines([])
  }), [lines]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useCart() { const value = useContext(Context); if (!value) throw new Error("useCart must be used within CartProvider"); return value; }