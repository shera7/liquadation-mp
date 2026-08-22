import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getSlaRulesMap, computeSlaState } from "@/lib/sla";

export const dynamic = "force-dynamic";

export default async function RequestsDashboardPage() {
  const [allRequests, getRule] = await Promise.all([
    prisma.request.findMany({ select: { id: true, type: true, status: true, statusChangedAt: true } }),
    getSlaRulesMap(),
  ]);

  let ok = 0, warning = 0, breached = 0, newCount = 0, inProgress = 0;
  for (const r of allRequests) {
    if (r.status === "NEW") newCount++;
    if (r.status === "IN_PROGRESS") inProgress++;
    const sla = computeSlaState(r.statusChangedAt, getRule(r.status));
    if (sla.state === "ok") ok++;
    else if (sla.state === "warning") warning++;
    else if (sla.state === "breached") breached++;
  }

  const productCount = allRequests.filter((r) => r.type === "PRODUCT").length;
  const generalCount = allRequests.filter((r) => r.type === "GENERAL").length;

  const cards = [
    { label: "Всего заявок", value: allRequests.length },
    { label: "Новые", value: newCount },
    { label: "В работе", value: inProgress },
    { label: "SLA в норме", value: ok },
    { label: "SLA под угрозой", value: warning },
    { label: "SLA просрочен", value: breached },
  ];

  return (
    <div>
      <h1 className="font-display font-800 text-2xl text-graphite mb-6">Заявки — обзор SLA</h1>

      <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white border border-line rounded-sm p-4">
            <div className="text-2xl font-display font-800 text-graphite">{c.value}</div>
            <div className="text-xs text-steel mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/admin/requests/product" className="bg-white border border-line rounded-sm p-6 hover:border-amber transition-colors">
          <div className="text-2xl font-display font-800 text-graphite">{productCount}</div>
          <div className="text-sm text-steel mt-1">Заявки на товар</div>
        </Link>
        <Link href="/admin/requests/general" className="bg-white border border-line rounded-sm p-6 hover:border-amber transition-colors">
          <div className="text-2xl font-display font-800 text-graphite">{generalCount}</div>
          <div className="text-sm text-steel mt-1">Общие заявки</div>
        </Link>
      </div>
    </div>
  );
}
