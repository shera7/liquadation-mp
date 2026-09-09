"use client";

import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import type { Suggestion } from "@/hooks/useSearchSuggestions";

export default function SearchSuggestionsDropdown({
  suggestions,
  onSelect,
}: {
  suggestions: Suggestion[];
  onSelect?: () => void;
}) {
  if (suggestions.length === 0) return null;

  return (
    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-line rounded-sm shadow-lg z-30 overflow-hidden">
      {suggestions.map((s) => (
        <Link
          key={s.id}
          href={`/product/${s.slug}`}
          onMouseDown={onSelect}
          className="flex items-center gap-3 px-3 py-2 hover:bg-concrete transition-colors"
        >
          <div className="relative w-10 h-10 rounded-sm overflow-hidden bg-concrete shrink-0">
            {s.images[0] && <Image src={s.images[0].url} alt="" fill className="object-cover" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-graphite truncate">{s.title}</div>
            <div className="text-xs text-steel font-mono-tabular">
              {formatPrice(s.price as any, s.currency, s.priceOnRequest)}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
