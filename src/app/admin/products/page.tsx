import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ProductsTable from "@/components/admin/ProductsTable";

export const dynamic = "force-dynamic";

interface AdminProductsPageProps {
  searchParams: { status?: string };
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: searchParams.status ? { status: searchParams.status as any } : undefined,
      orderBy: { createdAt: "desc" },
      include: { category: true, images: true },
      take: 200,
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-800 text-2xl text-graphite">Товары</h1>
        <Link
          href="/admin/products/new"
          className="bg-amber text-graphite font-semibold px-4 py-2 rounded-sm text-sm hover:bg-amber-dark"
        >
          + Добавить товар
        </Link>
      </div>

      <ProductsTable products={products as any} categories={categories} />
    </div>
  );
}
