"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface PaginationControlsProps {
  page: number;
  pageSize: number;
  total: number;
  basePath: string;
  pageSizeOptions?: number[];
}

export default function PaginationControls({
  page,
  pageSize,
  total,
  basePath,
  pageSizeOptions = [10, 50, 100, 200],
}: PaginationControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    if (key === "pageSize") params.set("page", "1");
    router.push(`${basePath}?${params.toString()}`);
  }

  if (total === 0) return null;

  return (
    <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
      <div className="flex items-center gap-2 text-xs text-steel">
        Показывать по:
        <select
          value={pageSize}
          onChange={(e) => updateParam("pageSize", e.target.value)}
          className="border border-line rounded-sm px-2 py-1 text-xs"
        >
          {pageSizeOptions.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <span>· Всего: {total}</span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => updateParam("page", String(Math.max(1, page - 1)))}
          disabled={page <= 1}
          className="text-xs border border-line rounded-sm px-2 py-1.5 disabled:opacity-40 hover:border-amber"
        >
          ← Назад
        </button>
        <span className="text-xs text-steel px-2">
          Стр. {page} из {totalPages}
        </span>
        <button
          onClick={() => updateParam("page", String(Math.min(totalPages, page + 1)))}
          disabled={page >= totalPages}
          className="text-xs border border-line rounded-sm px-2 py-1.5 disabled:opacity-40 hover:border-amber"
        >
          Вперёд →
        </button>
      </div>
    </div>
  );
}
