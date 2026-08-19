"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface CategoryWithChildren {
  id: string;
  name: string;
  slug: string;
  children?: { id: string; name: string; slug: string }[];
}

interface FiltersProps {
  categories: CategoryWithChildren[];
}

const STATUS_OPTIONS = [
  { value: "IN_STOCK", label: "В продаже" },
  { value: "RESERVED", label: "Забронировано" },
];

const CONDITION_OPTIONS = [
  { value: "NEW", label: "Новое" },
  { value: "USED", label: "Б/У" },
  { value: "NEEDS_REPAIR", label: "Требует ремонта" },
];

export default function Filters({ categories }: FiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/catalog?${params.toString()}`);
  }

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-6">
      <div>
        <h4 className="font-display font-700 text-sm mb-3 text-graphite">Категория</h4>
        <div className="space-y-1.5">
          <button
            onClick={() => updateParam("category", null)}
            className={`block text-sm w-full text-left px-2 py-1 rounded-sm ${
              !searchParams.get("category")
                ? "bg-amber/15 text-amber-dark font-medium"
                : "text-steel hover:text-graphite"
            }`}
          >
            Все категории
          </button>

          {categories.map((c) => (
            <div key={c.id}>
              <button
                onClick={() => updateParam("category", c.slug)}
                className={`block text-sm w-full text-left px-2 py-1 rounded-sm ${
                  searchParams.get("category") === c.slug
                    ? "bg-amber/15 text-amber-dark font-medium"
                    : "text-steel hover:text-graphite"
                }`}
              >
                {c.name}
              </button>

              {c.children && c.children.length > 0 && (
                <div className="pl-3 space-y-1">
                  {c.children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => updateParam("category", child.slug)}
                      className={`block text-sm w-full text-left px-2 py-1 rounded-sm ${
                        searchParams.get("category") === child.slug
                          ? "bg-amber/15 text-amber-dark font-medium"
                          : "text-steel/80 hover:text-graphite"
                      }`}
                    >
                      {child.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-display font-700 text-sm mb-3 text-graphite">Статус</h4>
        <div className="space-y-1.5">
          {STATUS_OPTIONS.map((s) => (
            <label key={s.value} className="flex items-center gap-2 text-sm text-steel">
              <input
                type="checkbox"
                checked={searchParams.get("status") === s.value}
                onChange={(e) => updateParam("status", e.target.checked ? s.value : null)}
                className="accent-amber"
              />
              {s.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-display font-700 text-sm mb-3 text-graphite">Состояние</h4>
        <div className="space-y-1.5">
          {CONDITION_OPTIONS.map((s) => (
            <label key={s.value} className="flex items-center gap-2 text-sm text-steel">
              <input
                type="checkbox"
                checked={searchParams.get("condition") === s.value}
                onChange={(e) => updateParam("condition", e.target.checked ? s.value : null)}
                className="accent-amber"
              />
              {s.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-display font-700 text-sm mb-3 text-graphite">Цена, $</h4>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="от"
            defaultValue={searchParams.get("priceMin") ?? ""}
            onBlur={(e) => updateParam("priceMin", e.target.value || null)}
            className="w-full border border-line rounded-sm px-2 py-1.5 text-sm"
          />
          <input
            type="number"
            placeholder="до"
            defaultValue={searchParams.get("priceMax") ?? ""}
            onBlur={(e) => updateParam("priceMax", e.target.value || null)}
            className="w-full border border-line rounded-sm px-2 py-1.5 text-sm"
          />
        </div>
      </div>
    </aside>
  );
}
