import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { REQUEST_STATUS_LABELS } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_ORDER = [
  "NEW",
  "IN_PROGRESS",
  "CONTACTED",
  "NEGOTIATION",
  "RESERVED",
  "SOLD",
  "REJECTED",
  "UNREACHABLE",
] as const;

const STATUS_BAR_COLOR: Record<string, string> = {
  NEW: "#E8A33D",
  IN_PROGRESS: "#E8A33D",
  CONTACTED: "#3E7A4C",
  NEGOTIATION: "#3E7A4C",
  RESERVED: "#3E7A4C",
  SOLD: "#1C1F22",
  REJECTED: "#C0392B",
  UNREACHABLE: "#C0392B",
};

export default async function AdminDashboard() {
  const [totalProducts, inStock, sold, totalRequests, newRequests, requestsByStatusRaw] =
    await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { status: "IN_STOCK" } }),
      prisma.product.count({ where: { status: "SOLD" } }),
      prisma.request.count(),
      prisma.request.count({ where: { status: "NEW" } }),
      prisma.request.groupBy({ by: ["status"], _count: true }),
    ]);

  const countsByStatus = Object.fromEntries(
    requestsByStatusRaw.map((r) => [r.status, r._count])
  ) as Record<string, number>;

  const maxCount = Math.max(1, ...STATUS_ORDER.map((s) => countsByStatus[s] ?? 0));

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

      <div className="mt-10 bg-white border border-line rounded-sm p-6 max-w-2xl">
        <h2 className="font-display font-700 text-lg text-graphite mb-1">Заявки по статусам</h2>
        <p className="text-xs text-steel mb-5">Распределение всех заявок по этапам воронки</p>

        <div className="space-y-3">
          {STATUS_ORDER.map((status) => {
            const count = countsByStatus[status] ?? 0;
            const widthPct = Math.round((count / maxCount) * 100);
            return (
              <Link
                key={status}
                href={`/admin/requests?status=${status}`}
                className="flex items-center gap-3 group"
              >
                <span className="text-xs text-steel w-32 shrink-0">
                  {REQUEST_STATUS_LABELS[status]}
                </span>
                <span className="flex-1 h-6 bg-concrete rounded-sm overflow-hidden">
                  <span
                    className="h-full block rounded-sm transition-all group-hover:opacity-80"
                    style={{
                      width: count > 0 ? `${Math.max(widthPct, 4)}%` : "0%",
                      backgroundColor: STATUS_BAR_COLOR[status],
                    }}
                  />
                </span>
                <span className="text-sm font-mono-tabular font-semibold text-graphite w-6 text-right shrink-0">
                  {count}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
