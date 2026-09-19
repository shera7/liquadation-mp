"use client";

import Link from "next/link";
import { useSelection } from "@/lib/selection";

export default function HeaderCta() {
  const { items } = useSelection();

  if (items.length === 0) {
    return (
      <Link
        id="cart-target"
        href="/#quick-request"
        className="shrink-0 inline-flex items-center rounded-sm bg-amber px-3 sm:px-4 py-2 text-sm font-semibold text-graphite hover:bg-amber-dark transition-colors"
      >
        <span className="hidden sm:inline">Оставить заявку</span>
        <span className="sm:hidden">Заявка</span>
      </Link>
    );
  }

  return (
    <Link id="cart-target" href="/request" className="shrink-0 relative">
      {/* Десктоп — полная пилюля */}
      <span className="hidden sm:inline-flex items-center gap-3 rounded-full bg-graphite2 border border-white/10 pl-4 pr-1.5 py-1.5 text-sm hover:border-amber/50 transition-colors">
        <span className="text-steelLight whitespace-nowrap">
          Выбрано: <span className="text-white font-semibold">{items.length}</span>
        </span>
        <span className="bg-amber text-graphite font-semibold text-sm px-3.5 py-1.5 rounded-full whitespace-nowrap">
          Оформить заявку
        </span>
      </span>

      {/* Мобилка — компактная иконка с бейджем-счётчиком */}
      <span className="sm:hidden flex items-center justify-center w-10 h-10 rounded-full bg-graphite2 border border-white/10 relative">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-white">
          <circle cx="9" cy="21" r="1.4" />
          <circle cx="18" cy="21" r="1.4" />
          <path d="M2.5 3h2l2.4 12.2a1.6 1.6 0 0 0 1.6 1.3h8.8a1.6 1.6 0 0 0 1.6-1.3L21 7H6" />
        </svg>
        <span className="absolute -top-1 -right-1 bg-amber text-graphite text-[10px] font-bold w-4.5 h-4.5 min-w-[18px] rounded-full flex items-center justify-center">
          {items.length}
        </span>
      </span>
    </Link>
  );
}
