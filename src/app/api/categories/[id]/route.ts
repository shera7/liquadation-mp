import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";

interface Params {
  params: { id: string };
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const body = await req.json();
  try {
    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        ...(body.name && { name: body.name, slug: slugify(body.name, { lower: true, strict: true }) }),
        ...(body.parentId !== undefined && { parentId: body.parentId || null }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      },
    });
    return NextResponse.json(category);
  } catch {
    return NextResponse.json({ error: "Не удалось обновить категорию" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const productsCount = await prisma.product.count({ where: { categoryId: params.id } });
    if (productsCount > 0) {
      return NextResponse.json(
        { error: `В категории ${productsCount} товар(ов). Сначала перенесите или удалите их.` },
        { status: 400 }
      );
    }
    const childrenCount = await prisma.category.count({ where: { parentId: params.id } });
    if (childrenCount > 0) {
      return NextResponse.json(
        { error: "У категории есть подкатегории. Сначала удалите или перенесите их." },
        { status: 400 }
      );
    }
    await prisma.category.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Не удалось удалить категорию" }, { status: 400 });
  }
}
