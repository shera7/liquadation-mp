import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyManagerNewRequest } from "@/lib/telegram";
import { formatPrice } from "@/lib/utils";
import { compareVersions } from "@/lib/nda";
import { z } from "zod";
import { getSiteSettings } from "@/lib/settings";
import { getEffectiveUsdRate } from "@/lib/exchangeRate";
import { isNdaRequiredForProduct } from "@/lib/nda";

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
  website: z.string().optional(),
  formLoadedAt: z.number().optional(),
  ndaAcceptanceId: z.string().optional(),
  ndaTelegramId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  if (data.website) {
    return NextResponse.json({ ok: true, id: "ignored" }, { status: 201 });
  }
  if (data.formLoadedAt && Date.now() - data.formLoadedAt < 3000) {
    return NextResponse.json({ ok: true, id: "ignored" }, { status: 201 });
  }

  // Проверка NDA — только для заявок по конкретному товару
  if (data.type === "PRODUCT" && data.productId) {
    const activeNda = await prisma.ndaDocument.findFirst({ where: { status: "ACTIVE" } });

    let ndaRequired = Boolean(activeNda);
    if (activeNda) {
      const product = await prisma.product.findUnique({
        where: { id: data.productId },
        select: { price: true, currency: true, priceOnRequest: true },
      });
      if (product) {
        const settings = await getSiteSettings();
        const { rate } = await getEffectiveUsdRate();
        ndaRequired = isNdaRequiredForProduct(
          { price: product.price as any, currency: product.currency, priceOnRequest: product.priceOnRequest },
          settings.ndaMinPriceUsd ? Number(settings.ndaMinPriceUsd) : null,
          rate
        );
      }
    }
    if (ndaRequired) {
      if (!data.ndaAcceptanceId || !data.ndaTelegramId) {
        return NextResponse.json(
          { error: "Требуется подтверждение NDA", code: "NDA_REQUIRED" },
          { status: 403 }
        );
      }

      const acceptance = await prisma.ndaAcceptance.findUnique({
        where: { id: data.ndaAcceptanceId },
      });

      if (!acceptance || acceptance.telegramId !== data.ndaTelegramId) {
        return NextResponse.json(
          { error: "Недействительное подтверждение NDA", code: "NDA_REQUIRED" },
          { status: 403 }
        );
      }

      if (activeNda && compareVersions(acceptance.ndaVersion, activeNda.version) < 0) {
        return NextResponse.json(
          { error: "Требуется подтвердить актуальную версию NDA", code: "NDA_UPDATE_REQUIRED" },
          { status: 403 }
        );
      }
    }
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const recentCount = await prisma.request.count({
    where: { ip, createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) } },
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
      ndaAcceptanceId: data.ndaAcceptanceId,
    },
  });
  
  const year = created.createdAt.getFullYear();
  const requestNumber = `REQ-${year}-${String(created.seq).padStart(6, "0")}`;
  await prisma.request.update({ where: { id: created.id }, data: { requestNumber } });
  
  try {
    let productTitle: string | undefined;
    let price: string | undefined;
    let productUrl: string | undefined;

    if (data.productId) {
      const product = await prisma.product.findUnique({ where: { id: data.productId } });
      if (product) {
        productTitle = product.title;
        price = formatPrice(product.price as any, product.currency, product.priceOnRequest);
        productUrl = `${req.nextUrl.origin}/product/${product.slug}`;
      }
    }

    const adminUrl = `${req.nextUrl.origin}/admin/requests`;

    await notifyManagerNewRequest({
      requestId: created.id,
      type: created.type,
      productTitle,
      price,
      clientName: created.name,
      company: created.company,
      phone: created.phone,
      telegram: created.telegram,
      whatsapp: created.whatsapp,
      email: created.email,
      quantity: created.quantity,
      desiredPrice: created.desiredPrice,
      contactMethod: created.contactMethod,
      interestedCategory: created.interestedCategory,
      budget: created.budget,
      comment: created.comment,
      productUrl,
      adminUrl,
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
