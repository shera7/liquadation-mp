"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Block {
  id: string;
  type: string;
  title: string | null;
  isActive: boolean;
  settings: Record<string, any> | null;
}

const PRODUCT_LIST_TYPES = ["NEWEST_PRODUCTS", "POPULAR_PRODUCTS", "DISCOUNTED_PRODUCTS"];

export default function MarketingBlockForm({
  block,
  categories,
}: {
  block: Block;
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState(block.title ?? "");
  const [isActive, setIsActive] = useState(block.isActive);
  const [limit, setLimit] = useState(block.settings?.limit ?? 8);
  const [categoryIds, setCategoryIds] = useState<string[]>(block.settings?.categoryIds ?? []);
  const [html, setHtml] = useState(block.settings?.html ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggleCategory(id: string) {
    setCategoryIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  async function handleSave() {
    setSaving(true);
    const settings: Record<string, any> = {};
    if (PRODUCT_LIST_TYPES.includes(block.type)) settings.limit = Number(limit);
    if (block.type === "CATEGORY_CAROUSEL") settings.categoryIds = categoryIds;
    if (block.type === "TEXT_HTML") settings.html = html;

    await fetch(`/api/admin/marketing-blocks/${block.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, isActive, settings }),
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="bg-white border border-line rounded-sm p-5 space-y-4">
      <div>
        <label className="block text-xs font-medium text-steel mb-1">
          Заголовок блока на сайте (необязательно)
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Например: Специальные предложения"
          className="w-full border border-line rounded-sm px-3 py-2 text-sm"
        />
      </div>

      <label className="flex items-center gap-1.5 text-sm text-steel">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="accent-amber" />
        Блок активен и показывается на сайте
      </label>

      {PRODUCT_LIST_TYPES.includes(block.type) && (
        <div>
          <label className="block text-xs font-medium text-steel mb-1">Количество товаров</label>
          <input
            type="number"
            min={1}
            max={20}
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="w-24 border border-line rounded-sm px-3 py-2 text-sm"
          />
        </div>
      )}

      {block.type === "CATEGORY_CAROUSEL" && (
        <div>
          <label className="block text-xs font-medium text-steel mb-2">
            Категории (если ни одна не выбрана — показываются все)
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleCategory(c.id)}
                className={`text-xs px-3 py-1.5 rounded-full border ${
                  categoryIds.includes(c.id)
                    ? "bg-amber border-amber text-graphite"
                    : "border-line text-steel hover:border-amber"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {block.type === "TEXT_HTML" && (
        <div>
          <label className="block text-xs font-medium text-steel mb-1">HTML-содержимое блока</label>
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            rows={6}
            className="w-full border border-line rounded-sm px-3 py-2 text-sm font-mono"
          />
        </div>
      )}

      {saved && <div className="text-okgreen text-sm">Сохранено</div>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-amber text-graphite font-semibold px-6 py-2.5 rounded-sm hover:bg-amber-dark disabled:opacity-60"
      >
        {saving ? "Сохранение..." : "Сохранить"}
      </button>
    </div>
  );
}
