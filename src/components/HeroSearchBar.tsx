"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";
import SearchSuggestionsDropdown from "./SearchSuggestionsDropdown";

export default function HeroSearchBar() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const suggestions = useSearchSuggestions(value);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOpen(false);
    const params = new URLSearchParams();
    if (value.trim()) params.set("q", value.trim());
    router.push(`/catalog?${params.toString()}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="relative max-w-xl">
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 text-steel pointer-events-none"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        placeholder="Найти оборудование, станок, запчасть по названию или артикулу..."
        className="w-full bg-white rounded-sm pl-11 pr-28 py-4 text-sm text-graphite placeholder:text-steel focus:outline-none focus:ring-2 focus:ring-amber relative z-10"
      />
      <button
        type="submit"
        onMouseDown={(e) => e.preventDefault()}
        className="absolute right-1.5 top-1.5 bottom-1.5 z-10 bg-amber hover:bg-amber-dark text-graphite font-semibold px-5 rounded-sm text-sm transition-colors"
      >
        Найти
      </button>
      {open && (
        <SearchSuggestionsDropdown suggestions={suggestions} onSelect={() => setOpen(false)} />
      )}
    </form>
  );
}
