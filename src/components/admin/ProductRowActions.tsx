"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const PRODUCT_STATUSES = [
  { value: "IN_STOCK", label: "В продаже" },
  { value: "RESERVED", label: "Забронировано" },
  { value: "SOLD", label: "Продано" },
  { value: "WITHDRAWN", label: "Снято с продажи" },
];

export default function ProductRowActions({
  productId,
  currentStatus,
}: {
  productId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function changeStatus(status: string) {
    setLoading(true);
    await fetch(`/api/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Удалить товар безвозвратно? Обычно лучше сменить статус на «Снято с продажи».")) return;
    setLoading(true);
    await fetch(`/api/products/${productId}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <select
        value={currentStatus}
        disabled={loading}
        onChange={(e) => changeStatus(e.target.value)}
        className="text-xs border border-line rounded-sm px-2 py-1"
      >
        {PRODUCT_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <button onClick={handleDelete} className="text-xs text-alert hover:underline">
        Удалить
      </button>
    </div>
  );
}
