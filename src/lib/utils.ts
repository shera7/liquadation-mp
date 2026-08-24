export function formatPrice(
  price: number | string | null | undefined,
  currency: "USD" | "UZS" = "USD",
  priceOnRequest = false
): string {
  if (priceOnRequest || price === null || price === undefined) return "Цена по запросу";
  const value = typeof price === "string" ? parseFloat(price) : price;
  const formatted = new Intl.NumberFormat("ru-RU").format(value);
  return currency === "USD" ? `$${formatted}` : `${formatted} сум`;
}

export const STATUS_LABELS: Record<string, { label: string; className: string; dot: string }> = {
  IN_STOCK: { label: "В продаже", className: "bg-okgreen/10 text-okgreen", dot: "#3E7A4C" },
  RESERVED: { label: "Забронировано", className: "bg-amber/10 text-amber-dark", dot: "#E8A33D" },
  SOLD: { label: "Продано", className: "bg-alert/10 text-alert", dot: "#C0392B" },
  WITHDRAWN: { label: "Снято с продажи", className: "bg-steel/10 text-steel", dot: "#6B6F76" },
};

export const CONDITION_LABELS: Record<string, string> = {
  NEW: "Новое",
  USED: "Б/У",
  NEEDS_REPAIR: "Требует ремонта",
};

export const REQUEST_STATUS_LABELS: Record<string, string> = {
  NEW: "Новая",
  IN_PROGRESS: "В работе",
  CONTACTED: "Связались",
  NEGOTIATION: "Переговоры",
  RESERVED: "Забронировано",
  SOLD: "Продано",
  REJECTED: "Отказ",
  UNREACHABLE: "Не удалось связаться",
};

export function formatOldPrice(
  oldPrice: number | string | null | undefined,
  currency: "USD" | "UZS" = "USD"
): string | null {
  if (oldPrice === null || oldPrice === undefined) return null;
  const value = typeof oldPrice === "string" ? parseFloat(oldPrice) : oldPrice;
  const formatted = new Intl.NumberFormat("ru-RU").format(value);
  return currency === "USD" ? `$${formatted}` : `${formatted} сум`;
}

export function formatDualPrice(
  price: number | string | null | undefined,
  currency: "USD" | "UZS",
  priceOnRequest: boolean,
  usdToUzsRate: number | null
): { primary: string; secondary: string | null } {
  const primary = formatPrice(price, currency, priceOnRequest);

  if (priceOnRequest || price === null || price === undefined || !usdToUzsRate) {
    return { primary, secondary: null };
  }

  const value = typeof price === "string" ? parseFloat(price) : price;
  const formatter = new Intl.NumberFormat("ru-RU");

  if (currency === "USD") {
    return { primary, secondary: `≈ ${formatter.format(Math.round(value * usdToUzsRate))} сум` };
  }
  return { primary, secondary: `≈ $${formatter.format(Math.round(value / usdToUzsRate))}` };
}


export function parseOfferedPrice(value: string | null | undefined): number | null {
  if (!value) return null;
  const cleaned = value.replace(/[^\d.,]/g, "").replace(/,/g, "");
  const num = parseFloat(cleaned);
  return Number.isNaN(num) ? null : num;
}
