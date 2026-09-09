"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";
import SearchSuggestionsDropdown from "./SearchSuggestionsDropdown";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");
  const [open, setOpen] = useState(false);
  const suggestions = useSearchSuggestions(value);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOpen(false);
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("q", value);
    else params.delete("q");
    router.push(`/catalog?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Поиск по названию, производителю, модели, артикулу..."
        className="flex-1 border border-line rounded-l-sm px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
      />
      <button
        type="submit"
        className="bg-graphite text-white px-5 rounded-r-sm text-sm font-semibold hover:bg-graphite2 transition-colors"
      >
        Найти
      </button>
      {open && (
        <SearchSuggestionsDropdown suggestions={suggestions} onSelect={() => setOpen(false)} />
      )}
    </form>
  );
}
