import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const block = await prisma.marketingBlock.findUnique({
    where: { id: params.id },
    include: { slides: { orderBy: { sortOrder: "asc" } } },
  });
  if (!block) return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  return NextResponse.json(block);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if ("title" in body) data.title = body.title || null;
  if ("isActive" in body) data.isActive = Boolean(body.isActive);
  if ("settings" in body) data.settings = body.settings;
  if ("sortOrder" in body) data.sortOrder = Number(body.sortOrder);

  const block = await prisma.marketingBlock.update({ where: { id: params.id }, data });
  return NextResponse.json(block);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.marketingBlock.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
