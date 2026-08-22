import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SLA_HOURS, DEFAULT_SLA_FINAL } from "@/lib/sla";
import SlaRulesManager from "@/components/admin/SlaRulesManager";

export const dynamic = "force-dynamic";

const ALL_STATUSES = ["NEW","IN_PROGRESS","CONTACTED","NEGOTIATION","RESERVED","SOLD","REJECTED","UNREACHABLE"] as const;

export default async function AdminSlaPage() {
  const token = cookies().get("admin_session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (session?.role !== "FULL") redirect("/admin");

  const rules = await prisma.slaRule.findMany();
  const map = new Map(rules.map((r) => [r.status, r]));
  const full = ALL_STATUSES.map((status) => ({
    status,
    hours: map.get(status)?.hours ?? DEFAULT_SLA_HOURS[status] ?? 24,
    isFinal: map.get(status)?.isFinal ?? DEFAULT_SLA_FINAL[status] ?? false,
  }));

  return (
    <div className="max-w-2xl">
      <h1 className="font-display font-800 text-2xl text-graphite mb-6">Настройки SLA</h1>
      <SlaRulesManager initialRules={full} />
    </div>
  );
}
