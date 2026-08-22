import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";

interface Params {
  params: { id: string };
}

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

    const token = cookies().get("admin_session")?.value;
    const session = token ? await verifySessionToken(token) : null;

    const data: any = {};
    if (body.managerNote !== undefined) data.managerNote = body.managerNote;
    if (body.assigneeId !== undefined) {
      data.assigneeId = body.assigneeId || null;
      data.assigneeName = body.assigneeName || null;
    }

    const statusChanged = body.status && body.status !== existing.status;
    if (statusChanged) {
      data.status = body.status;
      data.statusChangedAt = new Date();
    }

    const request = await prisma.request.update({ where: { id: params.id }, data });

    if (statusChanged) {
      await prisma.requestHistory.create({
        data: {
          requestId: request.id,
          changedById: session?.sub,
          changedByName: session?.name,
          previousStatus: existing.status,
          newStatus: body.status,
          comment: body.historyComment || undefined,
        },
      });
    }

    if (request.productId && body.status) {
      const newProductStatus = REQUEST_TO_PRODUCT_STATUS[body.status];
      const oldProductStatus = REQUEST_TO_PRODUCT_STATUS[existing.status];

      if (newProductStatus) {
        await prisma.product.update({ where: { id: request.productId }, data: { status: newProductStatus } });
      } else if (oldProductStatus) {
        const stillActive = await prisma.request.findFirst({
          where: {
            productId: request.productId,
            status: { in: ["RESERVED", "SOLD"] },
            NOT: { id: request.id },
          },
        });
        if (!stillActive) {
          await prisma.product.update({ where: { id: request.productId }, data: { status: "IN_STOCK" } });
        }
      }
    }

    return NextResponse.json(request);
  } catch {
    return NextResponse.json({ error: "Не удалось обновить заявку" }, { status: 400 });
  }
}
