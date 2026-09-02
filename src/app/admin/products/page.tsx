import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ProductsTable from "@/components/admin/ProductsTable";
import PaginationControls from "@/components/admin/PaginationControls";

export const dynamic = "force-dynamic";

interface AdminProductsPageProps {
  searchParams: { status?: string; page?: string; pageSize?: string };
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const pageSize = Number(searchParams.pageSize) || 50;

  const where = searchParams.status ? { status: searchParams.status as any } : undefined;

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { category: true, images: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
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

      <PaginationControls page={page} pageSize={pageSize} total={total} basePath="/admin/products" />
    </div>
  );
}
