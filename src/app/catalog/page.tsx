import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import ProductCard from "@/components/ProductCard";
import Filters from "@/components/Filters";
import SearchBar from "@/components/SearchBar";
import SortSelect from "@/components/SortSelect";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

interface CatalogPageProps {
  searchParams: {
    q?: string;
    category?: string;
    status?: string;
    condition?: string;
    priceMin?: string;
    priceMax?: string;
    sort?: string;
    page?: string;
  };
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const page = Math.max(1, Number(searchParams.page) || 1);

  const where: Prisma.ProductWhereInput = {
    ...(searchParams.q && {
      OR: [
        { title: { contains: searchParams.q, mode: "insensitive" } },
        { description: { contains: searchParams.q, mode: "insensitive" } },
        { inventoryNumber: { contains: searchParams.q, mode: "insensitive" } },
      ],
    }),
    ...(searchParams.category
      ? {
          category: {
            OR: [
              { slug: searchParams.category },
              { parent: { slug: searchParams.category } },
            ],
          },
        }
      : {}),
    ...(searchParams.status
      ? { status: searchParams.status as any }
      : { status: { not: "WITHDRAWN" } }),
    ...(searchParams.condition && { condition: searchParams.condition as any }),
    ...(searchParams.priceMin || searchParams.priceMax
      ? {
          price: {
            ...(searchParams.priceMin && { gte: Number(searchParams.priceMin) }),
            ...(searchParams.priceMax && { lte: Number(searchParams.priceMax) }),
          },
        }
      : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    searchParams.sort === "price_asc"
      ? { price: "asc" }
      : searchParams.sort === "price_desc"
      ? { price: "desc" }
      : searchParams.sort === "popular"
      ? { viewsCount: "desc" }
      : { createdAt: "desc" };

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { images: true, category: true },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { sortOrder: "asc" },
      include: { children: { orderBy: { sortOrder: "asc" } } },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display font-800 text-3xl text-graphite mb-6">Каталог имущества</h1>

      <div className="mb-6">
        <SearchBar />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <Filters categories={categories} />

        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-steel">Найдено: {total}</span>
            <SortSelect current={searchParams.sort} />
          </div>

          {products.length === 0 ? (
            <div className="border border-line rounded-sm bg-white p-12 text-center text-steel">
              По заданным параметрам ничего не найдено. Попробуйте изменить фильтры.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {products.map((p) => (
                // @ts-expect-error Decimal -> number сериализация из Prisma
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={{
                    pathname: "/catalog",
                    query: { ...searchParams, page: n },
                  }}
                  className={`w-9 h-9 flex items-center justify-center rounded-sm text-sm ${
                    n === page
                      ? "bg-graphite text-white"
                      : "bg-white border border-line text-steel hover:border-amber"
                  }`}
                >
                  {n}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
