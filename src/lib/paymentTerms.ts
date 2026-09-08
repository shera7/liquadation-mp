import { prisma } from "@/lib/prisma";

export async function getActivePaymentTerms() {
  return prisma.paymentTerm.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

/**
 * Возвращает условия оплаты, доступные для товара с данной ценой (в USD).
 * Условие без порога (minAmountUsd = null) доступно всегда.
 * priceUsd = null (цена по запросу / неизвестна) — показываем условия без порога.
 */
export async function getEligiblePaymentTerms(priceUsd: number | null) {
  const terms = await getActivePaymentTerms();
  return terms.filter((t) => {
    if (t.minAmountUsd === null) return true;
    if (priceUsd === null) return false;
    return priceUsd >= t.minAmountUsd;
  });
}

/** Переводит цену товара в USD для сравнения с порогом условия оплаты. */
export function toUsdEquivalent(
  price: number | null,
  currency: "USD" | "UZS",
  usdToUzsRate: number | null
): number | null {
  if (price === null) return null;
  if (currency === "USD") return price;
  if (!usdToUzsRate) return null;
  return price / usdToUzsRate;
}
