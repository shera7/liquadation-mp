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
        className="shrink-0 inline-flex items-center rounded-sm bg-amber px-4 py-2 text-sm font-semibold text-graphite hover:bg-amber-dark transition-colors"
      >
        Оставить заявку
      </Link>
    );
  }

  return (
    <Link
      id="cart-target"
      href="/request"
      className="shrink-0 inline-flex items-center gap-3 rounded-full bg-graphite2 border border-white/10 pl-4 pr-1.5 py-1.5 text-sm hover:border-amber/50 transition-colors"
    >
      <span className="text-steelLight whitespace-nowrap">
        Выбрано: <span className="text-white font-semibold">{items.length}</span>
      </span>
      <span className="bg-amber text-graphite font-semibold text-sm px-3.5 py-1.5 rounded-full whitespace-nowrap">
        Оформить заявку
      </span>
    </Link>
  );
}
