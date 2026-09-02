import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import Filters from "@/components/Filters";
import SearchBar from "@/components/SearchBar";
import SortSelect from "@/components/SortSelect";
import CatalogResults from "@/components/CatalogResults";
import { getEffectiveUsdRate } from "@/lib/exchangeRate";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 48;

interface CatalogPageProps {
  searchParams: {
    q?: string;
    category?: string;
    status?: string;
    condition?: string;
    priceMin?: string;
    priceMax?: string;
    sort?: string;
  };
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const where: Prisma.ProductWhereInput = {
    ...(searchParams.q && {
      OR: [
        { title: { contains: searchParams.q, mode: "insensitive" } },
        { description: { contains: searchParams.q, mode: "insensitive" } },
        { inventoryNumber: { contains: searchParams.q, mode: "insensitive" } },
      ],
    }),
    ...(searchParams.category && {
      category: { OR: [{ slug: searchParams.category }, { parent: { slug: searchParams.category } }] },
    }),
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

  const [products, total, categories, { rate: usdToUzsRate }] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      take: PAGE_SIZE,
      include: { images: true, category: true },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { sortOrder: "asc" },
      include: { children: { orderBy: { sortOrder: "asc" } } },
    }),
    getEffectiveUsdRate(),
  ]);

  const queryString = new URLSearchParams(
    Object.entries(searchParams).filter(([, v]) => v !== undefined) as [string, string][]
  ).toString();

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

          <CatalogResults
            initialProducts={products as any}
            total={total}
            usdToUzsRate={usdToUzsRate}
            queryString={queryString}
          />
        </div>
      </div>
    </div>
  );
}
