import { prisma } from "@/lib/prisma";
import { getSlaRulesMap, computeSlaState } from "@/lib/sla";
import RequestsTable from "@/components/admin/RequestsTable";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: { q?: string; status?: string; sla?: string; assignee?: string; sort?: string };
}

export default async function GeneralRequestsPage({ searchParams }: PageProps) {
  const where: any = { type: "GENERAL" };
  if (searchParams.q) {
    where.OR = [
      { requestNumber: { contains: searchParams.q, mode: "insensitive" } },
      { name: { contains: searchParams.q, mode: "insensitive" } },
      { phone: { contains: searchParams.q, mode: "insensitive" } },
    ];
  }
  if (searchParams.status) where.status = searchParams.status;
  if (searchParams.assignee) where.assigneeId = searchParams.assignee;

  const orderBy = searchParams.sort === "oldest" ? { createdAt: "asc" as const } : { createdAt: "desc" as const };

  const [requests, admins, getRule] = await Promise.all([
    prisma.request.findMany({ where, orderBy, include: { product: { select: { title: true, slug: true } } }, take: 200 }),
    prisma.admin.findMany({ select: { id: true, name: true } }),
    getSlaRulesMap(),
  ]);

  let enriched = requests.map((r) => {
    const sla = computeSlaState(r.statusChangedAt, getRule(r.status));
    return { ...r, slaState: sla.state, slaRemainingMs: sla.remainingMs };
  });

  if (searchParams.sla) enriched = enriched.filter((r) => r.slaState === searchParams.sla);

  return (
    <div>
      <h1 className="font-display font-800 text-2xl text-graphite mb-6">Общие заявки</h1>
      <RequestsTable requests={enriched as any} admins={admins} basePath="/admin/requests/general" />
    </div>
  );
}
