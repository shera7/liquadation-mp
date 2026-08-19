"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CategoryChild {
  id: string;
  name: string;
  _count: { products: number };
}

interface CategoryParent {
  id: string;
  name: string;
  _count: { products: number };
  children: CategoryChild[];
}

export default function CategoryManager({
  initialCategories,
}: {
  initialCategories: CategoryParent[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);

    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, parentId: parentId || undefined }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Не удалось создать категорию");
      return;
    }

    setName("");
    setParentId("");
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Удалить категорию?")) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error ?? "Не удалось удалить");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleAdd}
        className="bg-white border border-line rounded-sm p-4 flex flex-wrap gap-3 items-end"
      >
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-medium text-steel mb-1">Название</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Например: Насосы"
            className="w-full border border-line rounded-sm px-3 py-2 text-sm"
          />
        </div>
        <div className="min-w-[180px]">
          <label className="block text-xs font-medium text-steel mb-1">Родительская категория</label>
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="w-full border border-line rounded-sm px-3 py-2 text-sm"
          >
            <option value="">— Категория верхнего уровня —</option>
            {initialCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-amber text-graphite font-semibold px-5 py-2 rounded-sm text-sm hover:bg-amber-dark disabled:opacity-60"
        >
          {loading ? "Добавление..." : "+ Добавить"}
        </button>
      </form>

      {error && <div className="text-alert text-sm">{error}</div>}

      <div className="bg-white border border-line rounded-sm divide-y divide-line">
        {initialCategories.map((c) => (
          <div key={c.id}>
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <span className="font-medium text-graphite">{c.name}</span>
                <span className="text-xs text-steel ml-2">{c._count.products} товаров</span>
              </div>
              <button
                onClick={() => handleDelete(c.id)}
                className="text-xs text-alert hover:underline"
              >
                Удалить
              </button>
            </div>
            {c.children.map((child) => (
              <div
                key={child.id}
                className="flex items-center justify-between px-4 py-2.5 pl-10 bg-concrete/40"
              >
                <div>
                  <span className="text-sm text-graphite">{child.name}</span>
                  <span className="text-xs text-steel ml-2">{child._count.products} товаров</span>
                </div>
                <button
                  onClick={() => handleDelete(child.id)}
                  className="text-xs text-alert hover:underline"
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>
        ))}
        {initialCategories.length === 0 && (
          <div className="p-8 text-center text-steel text-sm">Категорий пока нет</div>
        )}
      </div>
    </div>
  );
}
