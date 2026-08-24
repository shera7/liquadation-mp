import crypto from "crypto";

export function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na !== nb) return na - nb;
  }
  return 0;
}

export function hashContent(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

interface TelegramAuthData {
  id: number | string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number | string;
  hash: string;
}

// Проверка подлинности данных от Telegram Login Widget.
// См. https://core.telegram.org/widgets/login#checking-authorization
export function verifyTelegramAuth(data: TelegramAuthData, botToken: string): boolean {
  const { hash, ...rest } = data;
  if (!hash) return false;

  const checkString = Object.keys(rest)
    .filter((k) => rest[k as keyof typeof rest] !== undefined)
    .sort()
    .map((k) => `${k}=${rest[k as keyof typeof rest]}`)
    .join("\n");

  const secretKey = crypto.createHash("sha256").update(botToken).digest();
  const hmac = crypto.createHmac("sha256", secretKey).update(checkString).digest("hex");

  if (hmac !== hash) return false;

  const authDate = Number(data.auth_date);
  if (!authDate || Date.now() / 1000 - authDate > 86400) return false; // старше суток отклоняем

  return true;
}

export function isNdaRequiredForProduct(
  product: { price: number | string | null; currency: "USD" | "UZS"; priceOnRequest: boolean },
  ndaMinPriceUsd: number | null,
  usdToUzsRate: number | null
): boolean {
  // Порог не задан — NDA требуется для всех товаров (текущее поведение по умолчанию)
  if (ndaMinPriceUsd === null) return true;

  // Цена неизвестна ("по запросу") — безопаснее требовать NDA
  if (product.priceOnRequest || product.price === null) return true;

  const priceValue = typeof product.price === "string" ? parseFloat(product.price) : product.price;

  let priceInUsd: number | null;
  if (product.currency === "USD") {
    priceInUsd = priceValue;
  } else {
    priceInUsd = usdToUzsRate ? priceValue / usdToUzsRate : null;
  }

  // Нет курса для конвертации — безопаснее требовать NDA
  if (priceInUsd === null) return true;

  return priceInUsd >= ndaMinPriceUsd;
}
