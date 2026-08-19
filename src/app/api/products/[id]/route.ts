import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: { id: string };
}

export async function GET(req: NextRequest, { params }: Params) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { images: true, documents: true, category: true },
  });
  if (!product) return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const body = await req.json();
  try {
    const product = await prisma.product.update({
      where: { id: params.id },
      data: body, // на MVP допускаем частичное обновление любых полей из админки;
      // при подключении ролей (Фаза 2) добавить валидацию через zod + проверку прав
    });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Не удалось обновить товар" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Не удалось удалить товар" }, { status: 400 });
  }
}
