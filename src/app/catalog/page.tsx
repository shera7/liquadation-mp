import { prisma } from "@/lib/prisma";
import Filters from "@/components/Filters";
import SearchBar from "@/components/SearchBar";
import SortSelect from "@/components/SortSelect";
import CatalogResults from "@/components/CatalogResults";
import { getEffectiveUsdRate } from "@/lib/exchangeRate";
import { searchCatalog, type CatalogParams } from "@/lib/catalogSearch";

export const dynamic = "force-dynamic";

interface CatalogPageProps {
  searchParams: CatalogParams & { page?: string };
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const page = Math.max(1, Number(searchParams.page) || 1);

  const [{ products, total }, categories, manufacturers, { rate: usdToUzsRate }] = await Promise.all([
    searchCatalog(searchParams, page),
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { sortOrder: "asc" },
      include: { children: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.product.findMany({
      where: { manufacturer: { not: null } },
      select: { manufacturer: true },
      distinct: ["manufacturer"],
      orderBy: { manufacturer: "asc" },
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
        <Filters categories={categories} manufacturers={manufacturers.map((m) => m.manufacturer!).filter(Boolean)} />

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
