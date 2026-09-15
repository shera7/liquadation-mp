"use client";

import Link from "next/link";
import { useSelection } from "@/lib/selection";

export default function SelectionBar() {
  const { items } = useSelection();

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-graphite text-white rounded-full shadow-lg pl-5 pr-2 py-2 flex items-center gap-4 animate-fade-in-up">
      <span className="text-sm">
        Выбрано товаров: <span className="font-semibold">{items.length}</span>
      </span>
      <Link
        href="/request"
        className="bg-amber text-graphite font-semibold text-sm px-4 py-2 rounded-full hover:bg-amber-dark transition-colors"
      >
        Оформить заявку
      </Link>
    </div>
  );
}
