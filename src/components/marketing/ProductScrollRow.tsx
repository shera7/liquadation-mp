"use client";

import { useRef } from "react";
import ProductCard from "@/components/ProductCard";

export default function ProductScrollRow({
  products,
  usdToUzsRate,
}: {
  products: any[];
  usdToUzsRate?: number | null;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function scrollBy(dx: number) {
    ref.current?.scrollBy({ left: dx, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div ref={ref} className="flex gap-5 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory no-scrollbar">
        {products.map((p) => (
          <div key={p.id} className="min-w-[240px] sm:min-w-[260px] snap-start">
            <ProductCard product={p} usdToUzsRate={usdToUzsRate} />
          </div>
        ))}
      </div>
      {products.length > 3 && (
        <div className="hidden sm:flex justify-end gap-2 mt-3">
          <button
            onClick={() => scrollBy(-320)}
            aria-label="Назад"
            className="w-9 h-9 rounded-full border border-line flex items-center justify-center hover:border-amber transition-colors"
          >
            ←
          </button>
          <button
            onClick={() => scrollBy(320)}
            aria-label="Вперёд"
            className="w-9 h-9 rounded-full border border-line flex items-center justify-center hover:border-amber transition-colors"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
