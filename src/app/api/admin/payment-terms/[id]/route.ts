import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/auditLog";

interface Params {
  params: { id: string };
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if ("label" in body) data.label = body.label;
  if ("isActive" in body) data.isActive = Boolean(body.isActive);
  if ("sortOrder" in body) data.sortOrder = Number(body.sortOrder);
  if ("minAmountUsd" in body) {
    data.minAmountUsd =
      body.minAmountUsd === null || body.minAmountUsd === "" ? null : Number(body.minAmountUsd);
  }
  if ("maxAmountUsd" in body) {
    data.maxAmountUsd =
      body.maxAmountUsd === null || body.maxAmountUsd === "" ? null : Number(body.maxAmountUsd);
  }

  if (
    typeof data.minAmountUsd === "number" &&
    typeof data.maxAmountUsd === "number" &&
    data.minAmountUsd >= data.maxAmountUsd
  ) {
    return NextResponse.json({ error: "«От» должно быть меньше «до»" }, { status: 400 });
  }

  const term = await prisma.paymentTerm.update({ where: { id: params.id }, data });

  await logAdminAction({
    action: "payment_term.update",
    entityType: "PaymentTerm",
    entityId: term.id,
    description: `Изменено условие оплаты «${term.label}»`,
    metadata: { changedFields: body },
  });

  return NextResponse.json(term);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const term = await prisma.paymentTerm.findUnique({ where: { id: params.id } });
  await prisma.paymentTerm.delete({ where: { id: params.id } });
  if (term) {
    await logAdminAction({
      action: "payment_term.delete",
      entityType: "PaymentTerm",
      entityId: params.id,
      description: `Удалено условие оплаты «${term.label}»`,
    });
  }
  return NextResponse.json({ ok: true });
}
