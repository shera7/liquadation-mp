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
  // Поля защиты от спама — не относятся к бизнес-данным заявки
  website: z.string().optional(), // honeypot: должно быть всегда пустым
  formLoadedAt: z.number().optional(), // время открытия формы (ms)
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  // Honeypot: если это поле заполнено — значит, форму отправил бот.
  // Отвечаем "успехом", чтобы не подсказывать боту, что его поймали.
  if (data.website) {
    return NextResponse.json({ ok: true, id: "ignored" }, { status: 201 });
  }

  // Слишком быстрая отправка (меньше 3 секунд с открытия формы) — тоже похоже на бота
  if (data.formLoadedAt && Date.now() - data.formLoadedAt < 3000) {
    return NextResponse.json({ ok: true, id: "ignored" }, { status: 201 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  // Rate-limit: не более 3 заявок с одного IP за 5 минут
  const recentCount = await prisma.request.count({
    where: {
      ip,
      createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) },
    },
  });

  if (recentCount >= 3) {
    return NextResponse.json(
      { error: "Слишком много заявок подряд. Попробуйте немного позже." },
      { status: 429 }
    );
  }

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
      ip,
    },
  });

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
