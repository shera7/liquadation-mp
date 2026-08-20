import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: { id: string };
}

export async function POST(req: NextRequest, { params }: Params) {
  const { url } = await req.json();
  if (!url) {
    return NextResponse.json({ error: "Не передан url изображения" }, { status: 400 });
  }

  const existingCount = await prisma.productImage.count({ where: { productId: params.id } });

  const image = await prisma.productImage.create({
    data: {
      productId: params.id,
      url,
      isPrimary: existingCount === 0,
      sortOrder: existingCount,
    },
  });

  return NextResponse.json(image, { status: 201 });
}
