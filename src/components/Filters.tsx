"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface CategoryWithChildren {
  id: string;
  name: string;
  slug: string;
  children?: { id: string; name: string; slug: string }[];
}

interface FiltersProps {
  categories: CategoryWithChildren[];
  manufacturers?: string[];
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

const FILTER_KEYS = [
  "category",
  "status",
  "condition",
  "priceMin",
  "priceMax",
  "manufacturer",
  "yearMin",
  "yearMax",
];

export default function Filters({ categories, manufacturers = [] }: FiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const activeCount = FILTER_KEYS.filter((k) => searchParams.get(k)).length;

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/catalog?${params.toString()}`);
  }

  return (
    <aside className="w-full lg:w-64 shrink-0">
      {/* Мобильная кнопка-переключатель — на lg и выше фильтры видны всегда */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="lg:hidden w-full flex items-center justify-between bg-white border border-line rounded-sm px-4 py-3 mb-4 text-sm font-medium text-graphite"
      >
        <span className="flex items-center gap-2">
          Фильтры
          {activeCount > 0 && (
            <span className="bg-amber text-graphite text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <div className={`${open ? "block" : "hidden"} lg:block space-y-6`}>
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

        {manufacturers.length > 0 && (
          <div>
            <h4 className="font-display font-700 text-sm mb-3 text-graphite">Производитель</h4>
            <select
              value={searchParams.get("manufacturer") ?? ""}
              onChange={(e) => updateParam("manufacturer", e.target.value || null)}
              className="w-full border border-line rounded-sm px-2 py-1.5 text-sm"
            >
              <option value="">Все производители</option>
              {manufacturers.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <h4 className="font-display font-700 text-sm mb-3 text-graphite">Год выпуска</h4>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="от"
              defaultValue={searchParams.get("yearMin") ?? ""}
              onBlur={(e) => updateParam("yearMin", e.target.value || null)}
              className="w-full border border-line rounded-sm px-2 py-1.5 text-sm"
            />
            <input
              type="number"
              placeholder="до"
              defaultValue={searchParams.get("yearMax") ?? ""}
              onBlur={(e) => updateParam("yearMax", e.target.value || null)}
              className="w-full border border-line rounded-sm px-2 py-1.5 text-sm"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
