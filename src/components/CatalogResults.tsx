"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ProductCardSkeleton";

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
  const [freshCount, setFreshCount] = useState(0); // сколько последних карточек анимировать при появлении

  // При смене поиска/фильтров (queryString) сервер присылает новый
  // initialProducts — синхронизируем локальное состояние с ним,
  // иначе React переиспользует старое состояние компонента.
  useEffect(() => {
    setProducts(initialProducts);
    setPage(1);
    setFreshCount(0);
  }, [queryString]);

  const hasMore = products.length < total;

  async function handleLoadMore() {
    setLoading(true);
    const nextPage = page + 1;
    const sep = queryString ? "&" : "";
    const res = await fetch(`/api/catalog/products?${queryString}${sep}page=${nextPage}`);
    const data = await res.json();
    setFreshCount(data.products.length);
    setProducts((prev) => [...prev, ...data.products]);
    setPage(nextPage);
    setLoading(false);
  }

  if (products.length === 0) {
    return (
      <div className="border border-line rounded-sm bg-white p-12 text-center">
        <svg
          className="mx-auto mb-4 text-steel"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <div className="text-graphite font-medium mb-1">По заданным параметрам ничего не найдено</div>
        <p className="text-sm text-steel mb-4">Попробуйте изменить запрос или сбросить фильтры</p>
        <Link href="/catalog" className="inline-block text-sm text-amber-dark font-medium hover:underline">
          Сбросить фильтры
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {products.map((p, i) => {
          const isFresh = freshCount > 0 && i >= products.length - freshCount;
          return (
            <div
              key={p.id}
              className={isFresh ? "animate-fade-in-up" : undefined}
              style={isFresh ? { animationDelay: `${(i - (products.length - freshCount)) * 40}ms` } : undefined}
            >
              <ProductCard product={p} usdToUzsRate={usdToUzsRate} />
            </div>
          );
        })}
        {loading && Array.from({ length: 3 }).map((_, i) => <ProductCardSkeleton key={`sk-${i}`} />)}
      </div>

      {hasMore && !loading && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLoadMore}
            className="bg-white border border-line text-graphite font-semibold px-8 py-3 rounded-sm hover:border-amber transition-colors"
          >
            Показать ещё ({total - products.length})
          </button>
        </div>
      )}
    </div>
  );
}
