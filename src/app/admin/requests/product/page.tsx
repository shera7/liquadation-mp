import { prisma } from "@/lib/prisma";
import { getSlaRulesMap, computeSlaState } from "@/lib/sla";
import RequestsTable from "@/components/admin/RequestsTable";
import PaginationControls from "@/components/admin/PaginationControls";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: {
    q?: string;
    status?: string;
    sla?: string;
    assignee?: string;
    sort?: string;
    page?: string;
    pageSize?: string;
  };
}

export default async function ProductRequestsPage({ searchParams }: PageProps) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const pageSize = Number(searchParams.pageSize) || 50;

  const where: any = { type: "PRODUCT" };
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

  const [admins, getRule] = await Promise.all([
    prisma.admin.findMany({ select: { id: true, name: true } }),
    getSlaRulesMap(),
  ]);

  let pageItems: any[];
  let total: number;

  if (searchParams.sla) {
    const all = await prisma.request.findMany({
      where,
      orderBy,
      include: { product: { select: { title: true, slug: true } } },
      take: 2000,
    });
    const enrichedAll = all
      .map((r) => {
        const sla = computeSlaState(r.statusChangedAt, getRule(r.status));
        return { ...r, slaState: sla.state, slaRemainingMs: sla.remainingMs };
      })
      .filter((r) => r.slaState === searchParams.sla);

    total = enrichedAll.length;
    pageItems = enrichedAll.slice((page - 1) * pageSize, page * pageSize);
  } else {
    const [requests, count] = await Promise.all([
      prisma.request.findMany({
        where,
        orderBy,
        include: { product: { select: { title: true, slug: true } } },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.request.count({ where }),
    ]);
    pageItems = requests.map((r) => {
      const sla = computeSlaState(r.statusChangedAt, getRule(r.status));
      return { ...r, slaState: sla.state, slaRemainingMs: sla.remainingMs };
    });
    total = count;
  }

  return (
    <div>
      <h1 className="font-display font-800 text-2xl text-graphite mb-6">Заявки на товар</h1>
      <RequestsTable requests={pageItems as any} admins={admins} basePath="/admin/requests/product" />
      <PaginationControls page={page} pageSize={pageSize} total={total} basePath="/admin/requests/product" />
    </div>
  );
}
