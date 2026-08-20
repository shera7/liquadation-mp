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
    const existing = await prisma.request.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
    }

    const request = await prisma.request.update({
      where: { id: params.id },
      data: {
        status: body.status,
        managerNote: body.managerNote,
      },
    });

    if (request.productId && body.status) {
      const newProductStatus = REQUEST_TO_PRODUCT_STATUS[body.status];
      const oldProductStatus = REQUEST_TO_PRODUCT_STATUS[existing.status];

      if (newProductStatus) {
        // Заявка переходит в «Забронировано» или «Продано» — синхронизируем товар
        await prisma.product.update({
          where: { id: request.productId },
          data: { status: newProductStatus },
        });
      } else if (oldProductStatus) {
        // Заявка ушла с «Забронировано»/«Продано» на другой статус —
        // возвращаем товар в продажу, но только если нет другой активной
        // заявки на этот же товар с тем же эффектом
        const stillActive = await prisma.request.findFirst({
          where: {
            productId: request.productId,
            status: { in: ["RESERVED", "SOLD"] },
            NOT: { id: request.id },
          },
        });

        if (!stillActive) {
          await prisma.product.update({
            where: { id: request.productId },
            data: { status: "IN_STOCK" },
          });
        }
      }
    }

    return NextResponse.json(request);
  } catch {
    return NextResponse.json({ error: "Не удалось обновить заявку" }, { status: 400 });
  }
}
