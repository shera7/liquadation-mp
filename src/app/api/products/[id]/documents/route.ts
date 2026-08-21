import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: { id: string };
}

export async function POST(req: NextRequest, { params }: Params) {
  const { url, title } = await req.json();
  if (!url || !title) {
    return NextResponse.json({ error: "Не переданы url или title" }, { status: 400 });
  }

  const document = await prisma.productDocument.create({
    data: { productId: params.id, url, title },
  });

  return NextResponse.json(document, { status: 201 });
}
