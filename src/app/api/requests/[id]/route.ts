import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: { id: string };
}

// Статусы заявки, которые автоматически подтягивают за собой статус товара
const REQUEST_TO_PRODUCT_STATUS: Record<string, "RESERVED" | "SOLD"> = {
  RESERVED: "RESERVED",
  SOLD: "SOLD",
};

export async function PATCH(req: NextRequest, { params }: Params) {
  const body = await req.json();
  try {
    const request = await prisma.request.update({
      where: { id: params.id },
      data: {
        status: body.status,
        managerNote: body.managerNote,
      },
    });

    // Если заявка привязана к конкретному товару — синхронизируем его статус
    if (request.productId && body.status && REQUEST_TO_PRODUCT_STATUS[body.status]) {
      await prisma.product.update({
        where: { id: request.productId },
        data: { status: REQUEST_TO_PRODUCT_STATUS[body.status] },
      });
    }

    return NextResponse.json(request);
  } catch {
    return NextResponse.json({ error: "Не удалось обновить заявку" }, { status: 400 });
  }
}
