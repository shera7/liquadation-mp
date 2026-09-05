import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// body: { ids: string[] } — новый порядок id блоков
export async function POST(req: NextRequest) {
  const { ids } = await req.json();
  if (!Array.isArray(ids)) {
    return NextResponse.json({ error: "Неверный формат" }, { status: 400 });
  }

  await prisma.$transaction(
    ids.map((id: string, index: number) =>
      prisma.marketingBlock.update({ where: { id }, data: { sortOrder: index } })
    )
  );

  return NextResponse.json({ ok: true });
}
