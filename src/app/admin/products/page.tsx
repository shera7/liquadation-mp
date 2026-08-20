import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatPrice, STATUS_LABELS } from "@/lib/utils";
import ProductRowActions from "@/components/admin/ProductRowActions";

interface AdminProductsPageProps {
  searchParams: { status?: string };
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const products = await prisma.product.findMany({
    where: searchParams.status ? { status: searchParams.status as any } : undefined,
    orderBy: { createdAt: "desc" },
    include: { category: true, images: true },
    take: 100,
  });

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

      <div className="bg-white border border-line rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-concrete text-steel text-left">
            <tr>
              <th className="px-4 py-3 font-medium">№</th>
              <th className="px-4 py-3 font-medium">Название</th>
              <th className="px-4 py-3 font-medium">Категория</th>
              <th className="px-4 py-3 font-medium">Цена</th>
              <th className="px-4 py-3 font-medium">Статус</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const statusInfo = STATUS_LABELS[p.status];
              return (
                <tr key={p.id} className="border-t border-line">
                  <td className="px-4 py-3 font-mono text-xs text-steel">{p.inventoryNumber}</td>
                  <td className="px-4 py-3 font-medium text-graphite">
                    <Link href={`/product/${p.slug}`} target="_blank" className="hover:text-amber-dark">
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-steel">{p.category.name}</td>
                  <td className="px-4 py-3 font-mono-tabular">
                    {formatPrice(p.price as any, p.currency, p.priceOnRequest)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-1 rounded-sm ${statusInfo.className}`}>
                      {statusInfo.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link  href={`/admin/products/${p.id}/edit`}  className="text-xs text-amber-dark hover:underline mr-3">  Редактировать</Link>
                    <ProductRowActions productId={p.id} currentStatus={p.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="p-10 text-center text-steel text-sm">Товары не найдены</div>
        )}
      </div>
    </div>
  );
}
