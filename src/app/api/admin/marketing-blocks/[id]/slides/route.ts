import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { imageUrl, title, subtitle, buttonLabel, linkUrl } = body;

  if (!imageUrl) {
    return NextResponse.json({ error: "Не передано изображение" }, { status: 400 });
  }

  const maxOrder = await prisma.marketingSlide.aggregate({
    where: { blockId: params.id },
    _max: { sortOrder: true },
  });

  const slide = await prisma.marketingSlide.create({
    data: {
      blockId: params.id,
      imageUrl,
      title: title || null,
      subtitle: subtitle || null,
      buttonLabel: buttonLabel || null,
      linkUrl: linkUrl || null,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });

  return NextResponse.json(slide, { status: 201 });
}
