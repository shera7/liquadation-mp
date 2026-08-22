import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getSlaRulesMap, computeSlaState } from "@/lib/sla";
import RequestDetail from "@/components/admin/RequestDetail";

export const dynamic = "force-dynamic";

export default async function RequestDetailPage({ params }: { params: { id: string } }) {
  const [request, admins, getRule] = await Promise.all([
    prisma.request.findUnique({
      where: { id: params.id },
      include: {
        product: { select: { title: true, slug: true } },
        ndaAcceptance: { select: { id: true, ndaVersion: true, telegramUsername: true } },
        history: { orderBy: { createdAt: "desc" } },
        comments: { orderBy: { createdAt: "asc" } },
      },
    }),
    prisma.admin.findMany({ select: { id: true, name: true } }),
    getSlaRulesMap(),
  ]);

  if (!request) notFound();

  const sla = computeSlaState(request.statusChangedAt, getRule(request.status));

  return (
    <RequestDetail
      request={request as any}
      admins={admins}
      slaState={sla.state}
      slaRemainingMs={sla.remainingMs}
    />
  );
}
