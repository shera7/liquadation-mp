import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SLA_HOURS, DEFAULT_SLA_FINAL } from "@/lib/sla";

const ALL_STATUSES = ["NEW","IN_PROGRESS","CONTACTED","NEGOTIATION","RESERVED","SOLD","REJECTED","UNREACHABLE"];

export async function GET() {
  const rules = await prisma.slaRule.findMany();
  const map = new Map(rules.map((r) => [r.status, r]));
  const full = ALL_STATUSES.map((status) => map.get(status as any) ?? {
    status, hours: DEFAULT_SLA_HOURS[status] ?? 24, isFinal: DEFAULT_SLA_FINAL[status] ?? false,
  });
  return NextResponse.json(full);
}

export async function POST(req: NextRequest) {
  const { rules } = await req.json();
  for (const r of rules) {
    await prisma.slaRule.upsert({
      where: { status: r.status },
      update: { hours: r.hours, isFinal: r.isFinal },
      create: { status: r.status, hours: r.hours, isFinal: r.isFinal },
    });
  }
  return NextResponse.json({ ok: true });
}
