import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: { id: string };
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { action } = await req.json();

  if (action === "activate") {
    await prisma.$transaction([
      prisma.ndaDocument.updateMany({
        where: { status: "ACTIVE" },
        data: { status: "ARCHIVED" },
      }),
      prisma.ndaDocument.update({
        where: { id: params.id },
        data: { status: "ACTIVE", effectiveFrom: new Date() },
      }),
    ]);
  } else if (action === "archive") {
    await prisma.ndaDocument.update({ where: { id: params.id }, data: { status: "ARCHIVED" } });
  } else {
    return NextResponse.json({ error: "Неизвестное действие" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
