import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { REQUEST_STATUS_LABELS } from "@/lib/utils";
import KpiCard from "@/components/admin/dashboard/KpiCard";
import RequestsTrendChart from "@/components/admin/dashboard/RequestsTrendChart";
import RequestsStatusDonut from "@/components/admin/dashboard/RequestsStatusDonut";
import CategoryBarChart from "@/components/admin/dashboard/CategoryBarChart";
import { BoxIcon, CheckCircleIcon, TagIcon, InboxIcon, AlertIcon } from "@/components/admin/dashboard/icons";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  NEW: "#E8A33D",
  IN_PROGRESS: "#C8842A",
  CONTACTED: "#3E7A4C",
  NEGOTIATION: "#2E5F91",
  RESERVED: "#6B4FA0",
  SOLD: "#1C1F22",
  REJECTED: "#C0392B",
  UNREACHABLE: "#8B8578",
};

export default async function AdminDashboard() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [totalProducts, inStock, sold, totalRequests, newRequests, recentRequests, statusCounts, topCategories] =
    await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { status: "IN_STOCK" } }),
      prisma.product.count({ where: { status: "SOLD" } }),
      prisma.request.count(),
      prisma.request.count({ where: { status: "NEW" } }),
      prisma.request.findMany({ where: { createdAt: { gte: thirtyDaysAgo } }, select: { createdAt: true } }),
      prisma.request.groupBy({ by: ["status"], _count: true }),
      prisma.category.findMany({
        include: { _count: { select: { products: true } } },
        orderBy: { products: { _count: "desc" } },
        take: 6,
      }),
    ]);

  const trendMap = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
    trendMap.set(key, 0);
  }
  for (const r of recentRequests) {
    const key = r.createdAt.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
    if (trendMap.has(key)) trendMap.set(key, (trendMap.get(key) ?? 0) + 1);
  }
  const trendData = Array.from(trendMap.entries()).map(([date, count]) => ({ date, count }));

  const statusData = statusCounts.map((s) => ({
    name: REQUEST_STATUS_LABELS[s.status],
    value: s._count,
    color: STATUS_COLORS[s.status] ?? "#6B6F76",
  }));

  const categoryData = topCategories
    .filter((c) => c._count.products > 0)
    .map((c) => ({ name: c.name, count: c._count.products }));

  return (
    <div>
      <h1 className="font-display font-800 text-2xl text-graphite mb-6">Панель управления</h1>

      <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <KpiCard label="Всего товаров" value={totalProducts} href="/admin/products" accent="#1C1F22" icon={<BoxIcon />} />
        <KpiCard label="В продаже" value={inStock} href="/admin/products?status=IN_STOCK" accent="#3E7A4C" icon={<CheckCircleIcon />} />
        <KpiCard label="Продано" value={sold} href="/admin/products?status=SOLD" accent="#E8A33D" icon={<TagIcon />} />
        <KpiCard label="Всего заявок" value={totalRequests} href="/admin/requests" accent="#2E5F91" icon={<InboxIcon />} />
        <KpiCard label="Новых заявок" value={newRequests} href="/admin/requests/product?status=NEW" accent="#C0392B" icon={<AlertIcon />} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-white border border-line rounded-sm p-5">
          <h2 className="font-display font-700 text-graphite mb-1">Заявки за 30 дней</h2>
          <p className="text-xs text-steel mb-3">Динамика новых обращений</p>
          <RequestsTrendChart data={trendData} />
        </div>

        <div className="bg-white border border-line rounded-sm p-5">
          <h2 className="font-display font-700 text-graphite mb-1">Заявки по статусам</h2>
          <p className="text-xs text-steel mb-3">Распределение по воронке</p>
          <RequestsStatusDonut data={statusData} />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white border border-line rounded-sm p-5">
          <h2 className="font-display font-700 text-graphite mb-1">Товары по категориям</h2>
          <p className="text-xs text-steel mb-3">Топ-6 категорий по количеству</p>
          <CategoryBarChart data={categoryData} />
        </div>

        <div className="bg-graphite rounded-sm p-5 flex flex-col justify-center text-white">
          <div className="font-mono text-xs tracking-widest text-amber mb-2">БЫСТРЫЕ ДЕЙСТВИЯ</div>
          <div className="flex flex-col gap-2">
            <Link href="/admin/products/new" className="bg-amber text-graphite font-semibold text-center px-5 py-2.5 rounded-sm hover:bg-amber-dark transition-colors">
              + Добавить товар
            </Link>
            <Link href="/admin/import" className="border border-white/30 text-white font-semibold text-center px-5 py-2.5 rounded-sm hover:bg-white/10 transition-colors">
              Импорт из Excel
            </Link>
            <Link href="/admin/requests" className="border border-white/30 text-white font-semibold text-center px-5 py-2.5 rounded-sm hover:bg-white/10 transition-colors">
              Детали SLA по заявкам →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
