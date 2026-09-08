import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/auditLog";

export async function GET() {
  const terms = await prisma.paymentTerm.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(terms);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { label, minAmountUsd, maxAmountUsd } = body;

  if (!label || typeof label !== "string") {
    return NextResponse.json({ error: "Не указано название условия" }, { status: 400 });
  }

  const min = minAmountUsd === null || minAmountUsd === undefined || minAmountUsd === "" ? null : Number(minAmountUsd);
  const max = maxAmountUsd === null || maxAmountUsd === undefined || maxAmountUsd === "" ? null : Number(maxAmountUsd);

  if (min !== null && max !== null && min >= max) {
    return NextResponse.json({ error: "«От» должно быть меньше «до»" }, { status: 400 });
  }

  const maxOrder = await prisma.paymentTerm.aggregate({ _max: { sortOrder: true } });

  const term = await prisma.paymentTerm.create({
    data: {
      label,
      minAmountUsd: min,
      maxAmountUsd: max,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });

  await logAdminAction({
    action: "payment_term.create",
    entityType: "PaymentTerm",
    entityId: term.id,
    description: `Добавлено условие оплаты «${term.label}»`,
  });

  return NextResponse.json(term, { status: 201 });
}
