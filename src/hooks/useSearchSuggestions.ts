"use client";

import { useEffect, useState } from "react";

export interface Suggestion {
  id: string;
  slug: string;
  title: string;
  price: string | number | null;
  currency: "USD" | "UZS";
  priceOnRequest: boolean;
  images: { url: string }[];
}

export function useSearchSuggestions(query: string) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    const t = setTimeout(() => {
      fetch(`/api/catalog/suggest?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((data) => setSuggestions(Array.isArray(data) ? data : []))
        .catch(() => setSuggestions([]));
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  return suggestions;
}
