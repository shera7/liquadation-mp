import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: { id: string; imageId: string };
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { isPrimary } = await req.json();

  if (isPrimary) {
    await prisma.productImage.updateMany({
      where: { productId: params.id },
      data: { isPrimary: false },
    });
  }

  const image = await prisma.productImage.update({
    where: { id: params.imageId },
    data: { isPrimary: Boolean(isPrimary) },
  });

  return NextResponse.json(image);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const image = await prisma.productImage.findUnique({ where: { id: params.imageId } });

  await prisma.productImage.delete({ where: { id: params.imageId } });

  if (image?.isPrimary) {
    const next = await prisma.productImage.findFirst({
      where: { productId: params.id },
      orderBy: { sortOrder: "asc" },
    });
    if (next) {
      await prisma.productImage.update({ where: { id: next.id }, data: { isPrimary: true } });
    }
  }

  return NextResponse.json({ ok: true });
}
