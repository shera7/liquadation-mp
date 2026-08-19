"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("q", value);
    else params.delete("q");
    router.push(`/catalog?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Поиск по названию, артикулу, инвентарному номеру..."
        className="flex-1 border border-line rounded-l-sm px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
      />
      <button
        type="submit"
        className="bg-graphite text-white px-5 rounded-r-sm text-sm font-semibold hover:bg-graphite2 transition-colors"
      >
        Найти
      </button>
    </form>
  );
}
