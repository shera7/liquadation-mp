import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const blocks = await prisma.marketingBlock.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { slides: true } } },
  });
  return NextResponse.json(blocks);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, title } = body;

  if (!type) {
    return NextResponse.json({ error: "Не указан тип блока" }, { status: 400 });
  }

  const maxOrder = await prisma.marketingBlock.aggregate({ _max: { sortOrder: true } });

  const block = await prisma.marketingBlock.create({
    data: {
      type,
      title: title || null,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      settings: body.settings ?? undefined,
    },
  });

  return NextResponse.json(block, { status: 201 });
}
