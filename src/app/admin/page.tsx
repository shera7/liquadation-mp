import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminDashboard() {
  const [totalProducts, inStock, sold, totalRequests, newRequests] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: "IN_STOCK" } }),
    prisma.product.count({ where: { status: "SOLD" } }),
    prisma.request.count(),
    prisma.request.count({ where: { status: "NEW" } }),
  ]);

  const cards = [
    { label: "Всего товаров", value: totalProducts, href: "/admin/products" },
    { label: "В продаже", value: inStock, href: "/admin/products?status=IN_STOCK" },
    { label: "Продано", value: sold, href: "/admin/products?status=SOLD" },
    { label: "Всего заявок", value: totalRequests, href: "/admin/requests" },
    { label: "Новых заявок", value: newRequests, href: "/admin/requests?status=NEW" },
  ];

  return (
    <div>
      <h1 className="font-display font-800 text-2xl text-graphite mb-6">Панель управления</h1>
      <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="bg-white border border-line rounded-sm p-5 hover:border-amber transition-colors"
          >
            <div className="text-3xl font-display font-800 text-graphite">{c.value}</div>
            <div className="text-sm text-steel mt-1">{c.label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex gap-3">
        <Link
          href="/admin/products/new"
          className="bg-amber text-graphite font-semibold px-5 py-2.5 rounded-sm hover:bg-amber-dark transition-colors"
        >
          + Добавить товар
        </Link>
        <Link
          href="/admin/import"
          className="border border-graphite text-graphite font-semibold px-5 py-2.5 rounded-sm hover:bg-graphite hover:text-white transition-colors"
        >
          Импорт из Excel
        </Link>
      </div>
    </div>
  );
}
