import { prisma } from "@/lib/prisma";

export async function getActivePaymentTerms() {
  return prisma.paymentTerm.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

/**
 * Возвращает условия оплаты, доступные для товара с данной ценой (в USD).
 * Диапазон [minAmountUsd, maxAmountUsd] — обе границы необязательны:
 * null у min = "от 0", null у max = "без верхнего предела".
 * priceUsd = null (цена по запросу / неизвестна) — показываем только условия
 * без каких-либо границ (доступные для любой суммы).
 */
export async function getEligiblePaymentTerms(priceUsd: number | null) {
  const terms = await getActivePaymentTerms();
  return terms.filter((t) => {
    if (t.minAmountUsd === null && t.maxAmountUsd === null) return true;
    if (priceUsd === null) return false;
    if (t.minAmountUsd !== null && priceUsd < t.minAmountUsd) return false;
    if (t.maxAmountUsd !== null && priceUsd > t.maxAmountUsd) return false;
    return true;
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
