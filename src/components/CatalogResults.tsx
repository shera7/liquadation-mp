"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";

interface Product {
  id: string;
  slug: string;
  title: string;
  inventoryNumber: string;
  price: any;
  currency: "USD" | "UZS";
  priceOnRequest: boolean;
  status: string;
  condition: string;
  location: string | null;
  images: { url: string }[];
  category: { name: string; slug: string };
}

interface CatalogResultsProps {
  initialProducts: Product[];
  total: number;
  usdToUzsRate: number | null;
  queryString: string;
}

export default function CatalogResults({ initialProducts, total, usdToUzsRate, queryString }: CatalogResultsProps) {
  const [products, setProducts] = useState(initialProducts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const hasMore = products.length < total;

  async function handleLoadMore() {
    setLoading(true);
    const nextPage = page + 1;
    const sep = queryString ? "&" : "";
    const res = await fetch(`/api/catalog/products?${queryString}${sep}page=${nextPage}`);
    const data = await res.json();
    setProducts((prev) => [...prev, ...data.products]);
    setPage(nextPage);
    setLoading(false);
  }

  if (products.length === 0) {
    return (
      <div className="border border-line rounded-sm bg-white p-12 text-center text-steel">
        По заданным параметрам ничего не найдено. Попробуйте изменить фильтры.
      </div>
    );
  }

  return (
    <div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} usdToUzsRate={usdToUzsRate} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="bg-white border border-line text-graphite font-semibold px-8 py-3 rounded-sm hover:border-amber transition-colors disabled:opacity-60"
          >
            {loading ? "Загрузка..." : `Показать ещё (${total - products.length})`}
          </button>
        </div>
      )}
    </div>
  );
}
