import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; slideId: string } }
) {
  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const key of ["title", "subtitle", "buttonLabel", "linkUrl"]) {
    if (key in body) data[key] = body[key] || null;
  }
  if ("isActive" in body) data.isActive = Boolean(body.isActive);
  if ("sortOrder" in body) data.sortOrder = Number(body.sortOrder);

  const slide = await prisma.marketingSlide.update({
    where: { id: params.slideId },
    data,
  });
  return NextResponse.json(slide);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; slideId: string } }
) {
  await prisma.marketingSlide.delete({ where: { id: params.slideId } });
  return NextResponse.json({ ok: true });
}
