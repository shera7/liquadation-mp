import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/auditLog";

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
    await logAdminAction({
      action: "product.update",
      entityType: "Product",
      entityId: product.id,
      description: `Изменён товар «${product.title}» (№${product.inventoryNumber})`,
      metadata: { changedFields: body },
    });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Не удалось обновить товар" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const product = await prisma.product.findUnique({ where: { id: params.id } });
    await prisma.product.delete({ where: { id: params.id } });
    if (product) {
      await logAdminAction({
        action: "product.delete",
        entityType: "Product",
        entityId: params.id,
        description: `Удалён товар «${product.title}» (№${product.inventoryNumber})`,
      });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Не удалось удалить товар" }, { status: 400 });
  }
}
