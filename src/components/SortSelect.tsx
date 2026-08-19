"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function SortSelect({ current }: { current?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", e.target.value);
    router.push(`/catalog?${params.toString()}`);
  }

  return (
    <select
      defaultValue={current ?? "new"}
      onChange={handleChange}
      className="border border-line rounded-sm px-3 py-1.5 text-sm bg-white"
    >
      <option value="new">Сначала новые</option>
      <option value="price_asc">Цена: по возрастанию</option>
      <option value="price_desc">Цена: по убыванию</option>
      <option value="popular">Популярные</option>
    </select>
  );
}
