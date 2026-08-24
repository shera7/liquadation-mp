import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";
import { getEffectiveUsdRate } from "@/lib/exchangeRate";
import { isNdaRequiredForProduct } from "@/lib/nda";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  const activeDoc = await prisma.ndaDocument.findFirst({ where: { status: "ACTIVE" } });
  if (!activeDoc) {
    return NextResponse.json({ required: false, hasActiveNda: false });
  }

  if (!productId) {
    return NextResponse.json({ required: true, hasActiveNda: true });
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { price: true, currency: true, priceOnRequest: true },
  });

  if (!product) {
    return NextResponse.json({ required: true, hasActiveNda: true });
  }

  const settings = await getSiteSettings();
  const { rate } = await getEffectiveUsdRate();

  const required = isNdaRequiredForProduct(
    { price: product.price as any, currency: product.currency, priceOnRequest: product.priceOnRequest },
    settings.ndaMinPriceUsd ? Number(settings.ndaMinPriceUsd) : null,
    rate
  );

  return NextResponse.json({ required, hasActiveNda: true });
}
