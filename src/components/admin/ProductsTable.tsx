"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice, STATUS_LABELS } from "@/lib/utils";
import ProductRowActions from "./ProductRowActions";

interface Product {
  id: string;
  inventoryNumber: string;
  slug: string;
  title: string;
  price: any;
  currency: "USD" | "UZS";
  priceOnRequest: boolean;
  status: string;
  category: { name: string };
}

interface Category {
  id: string;
  name: string;
}

export default function ProductsTable({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState("IN_STOCK");
  const [bulkCategory, setBulkCategory] = useState("");
  const [busy, setBusy] = useState(false);

  const allSelected = products.length > 0 && selected.size === products.length;

  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(products.map((p) => p.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function runBulkAction(action: "status" | "category" | "delete", value?: string) {
    if (selected.size === 0) return;
    if (
      action === "delete" &&
      !confirm(`Удалить ${selected.size} товар(ов)? Обычно лучше сменить статус на «Снято с продажи».`)
    ) {
      return;
    }

    setBusy(true);
    await fetch("/api/admin/products/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selected), action, value }),
    });
    setBusy(false);
    setSelected(new Set());
    router.refresh();
  }

  async function handleExport() {
    setBusy(true);
    const res = await fetch("/api/admin/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selected.size > 0 ? Array.from(selected) : [] }),
    });
    setBusy(false);

    if (!res.ok) {
      alert("Не удалось сформировать файл");
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `products-export-${new Date().toISOString().slice(0, 10)}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="text-sm text-steel">
          {selected.size > 0 ? `Выбрано: ${selected.size}` : "Ничего не выбрано"}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExport}
            disabled={busy}
            className="text-xs border border-line rounded-sm px-3 py-1.5 hover:border-amber disabled:opacity-50"
          >
            {selected.size > 0 ? `Экспорт выбранных (${selected.size})` : "Экспорт всех в Excel"}
          </button>

          {selected.size > 0 && (
            <>
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                className="text-xs border border-line rounded-sm px-2 py-1.5"
              >
                <option value="IN_STOCK">В продаже</option>
                <option value="RESERVED">Забронировано</option>
                <option value="SOLD">Продано</option>
                <option value="WITHDRAWN">Снято с продажи</option>
              </select>
              <button
                onClick={() => runBulkAction("status", bulkStatus)}
                disabled={busy}
                className="text-xs bg-graphite text-white rounded-sm px-3 py-1.5 hover:bg-graphite2 disabled:opacity-50"
              >
                Сменить статус
              </button>

              <select
                value={bulkCategory}
                onChange={(e) => setBulkCategory(e.target.value)}
                className="text-xs border border-line rounded-sm px-2 py-1.5"
              >
                <option value="">Категория...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => bulkCategory && runBulkAction("category", bulkCategory)}
                disabled={busy || !bulkCategory}
                className="text-xs bg-graphite text-white rounded-sm px-3 py-1.5 hover:bg-graphite2 disabled:opacity-50"
              >
                Сменить категорию
              </button>

              <button
                onClick={() => runBulkAction("delete")}
                disabled={busy}
                className="text-xs bg-alert text-white rounded-sm px-3 py-1.5 hover:opacity-90 disabled:opacity-50"
              >
                Удалить выбранные
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white border border-line rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-concrete text-steel text-left">
            <tr>
              <th className="px-4 py-3 w-8">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-amber" />
              </th>
              <th className="px-4 py-3 font-medium">№</th>
              <th className="px-4 py-3 font-medium">Название</th>
              <th className="px-4 py-3 font-medium">Категория</th>
              <th className="px-4 py-3 font-medium">Цена</th>
              <th className="px-4 py-3 font-medium">Статус</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const statusInfo = STATUS_LABELS[p.status];
              return (
                <tr key={p.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => toggleOne(p.id)}
                      className="accent-amber"
                    />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-steel">{p.inventoryNumber}</td>
                  <td className="px-4 py-3 font-medium text-graphite">
                    <Link href={`/product/${p.slug}`} target="_blank" className="hover:text-amber-dark">
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-steel">{p.category.name}</td>
                  <td className="px-4 py-3 font-mono-tabular">
                    {formatPrice(p.price, p.currency, p.priceOnRequest)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-1 rounded-sm ${statusInfo.className}`}>
                      {statusInfo.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="text-xs text-amber-dark hover:underline mr-3"
                    >
                      Редактировать
                    </Link>
                    <ProductRowActions productId={p.id} currentStatus={p.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="p-10 text-center text-steel text-sm">Товары не найдены</div>
        )}
      </div>
    </div>
  );
}
