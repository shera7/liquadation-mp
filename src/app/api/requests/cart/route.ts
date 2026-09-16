import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { notifyManagerNewCartRequest } from "@/lib/telegram";
import { waitUntil } from "@vercel/functions";

const cartSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive().default(1),
        desiredPrice: z.string().optional(),
        desiredPriceCurrency: z.enum(["USD", "UZS"]).optional(),
      })
    )
    .min(1, "Список товаров пуст"),
  name: z.string().min(1, "Укажите имя"),
  company: z.string().min(1, "Укажите название компании"),
  companyInn: z.string().min(5, "Укажите ИНН или ПИНФЛ"),
  phone: z.string().min(5, "Укажите телефон"),
  telegram: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  contactMethod: z.string().optional(),
  comment: z.string().optional(),
  ndaAcceptanceId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = cartSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const products = await prisma.product.findMany({
    where: { id: { in: data.items.map((i) => i.productId) } },
    select: { id: true, title: true, slug: true },
  });
  const productById = new Map(products.map((p) => [p.id, p]));

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  const groupId = crypto.randomUUID();

  const created = await prisma.$transaction(
    data.items.map((item) =>
      prisma.request.create({
        data: {
          type: "PRODUCT",
          productId: item.productId,
          groupId,
          quantity: item.quantity,
          desiredPrice: item.desiredPrice || undefined,
          desiredPriceCurrency: item.desiredPrice ? item.desiredPriceCurrency ?? "USD" : undefined,
          name: data.name,
          company: data.company,
          companyInn: data.companyInn,
          phone: data.phone,
          telegram: data.telegram,
          email: data.email || undefined,
          contactMethod: data.contactMethod,
          comment: data.comment,
          ip,
          ndaAcceptanceId: data.ndaAcceptanceId,
        },
      })
    )
  );

  // Присваиваем каждому такой же человекочитаемый номер, как у одиночных заявок
  // (REQ-2026-000013), используя автоинкрементный seq, полученный при создании.
  const year = new Date().getFullYear();
  await prisma.$transaction(
    created.map((r) =>
      prisma.request.update({
        where: { id: r.id },
        data: { requestNumber: `REQ-${year}-${String(r.seq).padStart(6, "0")}` },
      })
    )
  );

  waitUntil(
    (async () => {
      try {
        const items = data.items.map((item) => {
          const product = productById.get(item.productId);
          return {
            title: product?.title ?? "Товар удалён",
            quantity: item.quantity,
            desiredPrice: item.desiredPrice,
            desiredPriceCurrency: item.desiredPriceCurrency,
            productUrl: product ? `${req.nextUrl.origin}/product/${product.slug}` : req.nextUrl.origin,
          };
        });

        await notifyManagerNewCartRequest({
          groupId,
          items,
          clientName: data.name,
          company: data.company,
          companyInn: data.companyInn,
          phone: data.phone,
          telegram: data.telegram,
          email: data.email,
          contactMethod: data.contactMethod,
          comment: data.comment,
          adminUrl: `${req.nextUrl.origin}/admin/requests?groupId=${groupId}`,
        });
      } catch (e) {
        console.error("[requests/cart] Ошибка отправки уведомления:", e);
      }
    })()
  );

  return NextResponse.json({ groupId, count: created.length }, { status: 201 });
}
