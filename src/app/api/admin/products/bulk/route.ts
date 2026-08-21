import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { ids, action, value } = await req.json();

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "Не выбраны товары" }, { status: 400 });
  }

  try {
    if (action === "status") {
      await prisma.product.updateMany({
        where: { id: { in: ids } },
        data: { status: value },
      });
    } else if (action === "category") {
      await prisma.product.updateMany({
        where: { id: { in: ids } },
        data: { categoryId: value },
      });
    } else if (action === "delete") {
      await prisma.product.deleteMany({ where: { id: { in: ids } } });
    } else {
      return NextResponse.json({ error: "Неизвестное действие" }, { status: 400 });
    }

    return NextResponse.json({ ok: true, count: ids.length });
  } catch {
    return NextResponse.json({ error: "Не удалось выполнить действие" }, { status: 500 });
  }
}
