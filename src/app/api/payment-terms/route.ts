import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEligiblePaymentTerms, toUsdEquivalent } from "@/lib/paymentTerms";
import { getEffectiveUsdRate } from "@/lib/exchangeRate";

export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get("productId");
  if (!productId) {
    // без товара (например, общая заявка) — отдаём условия без порога суммы
    const terms = await getEligiblePaymentTerms(null);
    return NextResponse.json(terms);
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { price: true, currency: true, priceOnRequest: true },
  });

  if (!product || product.priceOnRequest || product.price === null) {
    const terms = await getEligiblePaymentTerms(null);
    return NextResponse.json(terms);
  }

  const { rate } = await getEffectiveUsdRate();
  const priceUsd = toUsdEquivalent(Number(product.price), product.currency, rate);
  const terms = await getEligiblePaymentTerms(priceUsd);
  return NextResponse.json(terms);
}
