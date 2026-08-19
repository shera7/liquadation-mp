import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyManagerNewRequest } from "@/lib/telegram";
import { formatPrice } from "@/lib/utils";
import { z } from "zod";

const requestSchema = z.object({
  type: z.enum(["PRODUCT", "GENERAL"]),
  productId: z.string().optional(),
  name: z.string().min(1, "Укажите имя"),
  company: z.string().optional(),
  phone: z.string().min(5, "Укажите телефон"),
  telegram: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  quantity: z.number().int().positive().optional(),
  desiredPrice: z.string().optional(),
  contactMethod: z.string().optional(),
  interestedCategory: z.string().optional(),
  budget: z.string().optional(),
  comment: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  // Простая защита от спама: обязательно указан телефон + непустое имя.
  // Для продакшена — добавить rate-limit по IP и/или honeypot-поле (Фаза 3, раздел 25 ТЗ).

  const created = await prisma.request.create({
    data: {
      type: data.type,
      productId: data.productId,
      name: data.name,
      company: data.company,
      phone: data.phone,
      telegram: data.telegram,
      whatsapp: data.whatsapp,
      email: data.email || undefined,
      quantity: data.quantity,
      desiredPrice: data.desiredPrice,
      contactMethod: data.contactMethod,
      interestedCategory: data.interestedCategory,
      budget: data.budget,
      comment: data.comment,
    },
  });

  // Уведомление менеджеру в Telegram — не блокируем ответ пользователю при ошибке отправки
  try {
    let productTitle: string | undefined;
    let price: string | undefined;
    let productUrl: string | undefined;

    if (data.productId) {
      const product = await prisma.product.findUnique({ where: { id: data.productId } });
      if (product) {
        productTitle = product.title;
        price = formatPrice(product.price as any, product.currency, product.priceOnRequest);
        productUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/product/${product.slug}`;
      }
    }

    await notifyManagerNewRequest({
      requestId: created.id,
      productTitle,
      price,
      clientName: created.name,
      company: created.company,
      phone: created.phone,
      quantity: created.quantity,
      comment: created.comment,
      productUrl,
    });
  } catch (e) {
    console.error("[requests] Ошибка уведомления Telegram:", e);
  }

  return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
}

// GET /api/requests — список заявок для CRM-раздела админки
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const requests = await prisma.request.findMany({
    where: status ? { status: status as any } : undefined,
    orderBy: { createdAt: "desc" },
    include: { product: { select: { title: true, slug: true } } },
  });

  return NextResponse.json(requests);
}
