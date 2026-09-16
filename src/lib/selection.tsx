"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export interface SelectedItem {
  productId: string;
  slug: string;
  title: string;
  image: string | null;
  quantity: number;
  desiredPrice?: string;
  desiredPriceCurrency?: "USD" | "UZS";
}

interface SelectionContextValue {
  items: SelectedItem[];
  isSelected: (productId: string) => boolean;
  toggle: (item: Omit<SelectedItem, "quantity">) => void;
  setQuantity: (productId: string, quantity: number) => void;
  setDesiredPrice: (productId: string, price: string, currency: "USD" | "UZS") => void;
  remove: (productId: string) => void;
  clear: () => void;
}


const STORAGE_KEY = "request_selection";

const SelectionContext = createContext<SelectionContextValue | null>(null);

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<SelectedItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const isSelected = useCallback((productId: string) => items.some((i) => i.productId === productId), [items]);

  const toggle = useCallback((item: Omit<SelectedItem, "quantity">) => {
    setItems((prev) => {
      if (prev.some((i) => i.productId === item.productId)) {
        return prev.filter((i) => i.productId !== item.productId);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, quantity: Math.max(1, quantity) } : i)));
  }, []);

  const remove = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  return (
    <SelectionContext.Provider value={{ items, isSelected, toggle, setQuantity, remove, clear }}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error("useSelection должен использоваться внутри SelectionProvider");
  return ctx;
}
