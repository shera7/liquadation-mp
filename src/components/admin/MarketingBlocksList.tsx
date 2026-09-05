"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const TYPE_LABELS: Record<string, string> = {
  HERO_CAROUSEL: "Крупная карусель-баннер",
  MINI_BANNER: "Мини-баннеры",
  NEWEST_PRODUCTS: "Последние добавленные товары",
  CATEGORY_CAROUSEL: "Карусель по категориям",
  POPULAR_PRODUCTS: "Популярные товары (по просмотрам)",
  DISCOUNTED_PRODUCTS: "Товары со скидкой",
  TEXT_HTML: "Текстовый/промо-блок",
};

interface Block {
  id: string;
  type: string;
  title: string | null;
  isActive: boolean;
  sortOrder: number;
  _count: { slides: number };
}

export default function MarketingBlocksList({ initialBlocks }: { initialBlocks: Block[] }) {
  const router = useRouter();
  const [blocks, setBlocks] = useState(initialBlocks);
  const [addingType, setAddingType] = useState("");
  const [creating, setCreating] = useState(false);

  async function persistOrder(next: Block[]) {
    setBlocks(next);
    await fetch("/api/admin/marketing-blocks/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: next.map((b) => b.id) }),
    });
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...blocks];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    persistOrder(next);
  }

  async function toggleActive(block: Block) {
    setBlocks((prev) => prev.map((b) => (b.id === block.id ? { ...b, isActive: !b.isActive } : b)));
    await fetch(`/api/admin/marketing-blocks/${block.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !block.isActive }),
    });
  }

  async function remove(block: Block) {
    if (!confirm("Удалить блок и все его слайды?")) return;
    await fetch(`/api/admin/marketing-blocks/${block.id}`, { method: "DELETE" });
    setBlocks((prev) => prev.filter((b) => b.id !== block.id));
  }

  async function addBlock() {
    if (!addingType) return;
    setCreating(true);
    const res = await fetch("/api/admin/marketing-blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: addingType }),
    });
    const created = await res.json();
    setCreating(false);
    if (res.ok) router.push(`/admin/marketing/${created.id}`);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-line rounded-sm divide-y divide-line">
        {blocks.length === 0 && (
          <div className="px-4 py-6 text-sm text-steel">
            Блоков пока нет — главная страница показывает базовый набор разделов. Добавьте первый блок ниже.
          </div>
        )}
        {blocks.map((block, i) => (
          <div key={block.id} className="px-4 py-3 flex items-center gap-4">
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="text-steel hover:text-graphite disabled:opacity-30 text-xs"
                aria-label="Выше"
              >
                ▲
              </button>
              <button
                onClick={() => move(i, 1)}
                disabled={i === blocks.length - 1}
                className="text-steel hover:text-graphite disabled:opacity-30 text-xs"
                aria-label="Ниже"
              >
                ▼
              </button>
            </div>

            <div className="flex-1">
              <div className="text-sm text-graphite font-medium">
                {block.title || TYPE_LABELS[block.type] || block.type}
              </div>
              <div className="text-xs text-steel">
                {TYPE_LABELS[block.type] || block.type}
                {(block.type === "HERO_CAROUSEL" || block.type === "MINI_BANNER") &&
                  ` · слайдов: ${block._count.slides}`}
              </div>
            </div>

            <label className="flex items-center gap-1.5 text-xs text-steel">
              <input type="checkbox" checked={block.isActive} onChange={() => toggleActive(block)} className="accent-amber" />
              Активен
            </label>

            <Link
              href={`/admin/marketing/${block.id}`}
              className="text-xs font-medium text-amber-dark hover:underline"
            >
              Настроить
            </Link>

            <button onClick={() => remove(block)} className="text-xs text-alert hover:underline">
              Удалить
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white border border-line rounded-sm p-4">
        <div className="text-sm font-medium text-graphite mb-2">Добавить блок</div>
        <div className="flex gap-2">
          <select
            value={addingType}
            onChange={(e) => setAddingType(e.target.value)}
            className="flex-1 border border-line rounded-sm px-3 py-2 text-sm"
          >
            <option value="">Выберите тип блока…</option>
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            onClick={addBlock}
            disabled={!addingType || creating}
            className="bg-amber text-graphite font-semibold px-5 py-2 rounded-sm hover:bg-amber-dark disabled:opacity-60"
          >
            {creating ? "Добавление..." : "Добавить"}
          </button>
        </div>
      </div>
    </div>
  );
}
