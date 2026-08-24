import { prisma } from "./prisma";

const SETTINGS_ID = "singleton";
const STALE_HOURS = 20;

interface CbuRateEntry {
  Ccy: string;
  Rate: string;
  Date: string;
}

export async function fetchCbuUsdRate(): Promise<{ rate: number; date: string } | null> {
  try {
    const res = await fetch("https://cbu.uz/ru/arkhiv-kursov-valyut/json/USD/", {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data: CbuRateEntry[] = await res.json();
    const entry = Array.isArray(data) ? data[0] : null;
    if (!entry) return null;
    const rate = parseFloat(entry.Rate);
    if (Number.isNaN(rate)) return null;
    return { rate, date: entry.Date };
  } catch {
    return null;
  }
}

export async function getEffectiveUsdRate(): Promise<{ rate: number | null; date: string | null }> {
  const settings = await prisma.siteSettings.findUnique({ where: { id: SETTINGS_ID } });

  if (settings?.currencyRateSource === "manual") {
    return { rate: settings.usdToUzsRate ? Number(settings.usdToUzsRate) : null, date: settings.usdToUzsRateDate };
  }

  const isStale =
    !settings?.usdToUzsUpdatedAt ||
    Date.now() - settings.usdToUzsUpdatedAt.getTime() > STALE_HOURS * 60 * 60 * 1000;

  if (isStale) {
    const fresh = await fetchCbuUsdRate();
    if (fresh) {
      await prisma.siteSettings.upsert({
        where: { id: SETTINGS_ID },
        update: { usdToUzsRate: fresh.rate, usdToUzsRateDate: fresh.date, usdToUzsUpdatedAt: new Date() },
        create: { id: SETTINGS_ID, usdToUzsRate: fresh.rate, usdToUzsRateDate: fresh.date, usdToUzsUpdatedAt: new Date() },
      });
      return { rate: fresh.rate, date: fresh.date };
    }
  }

  return {
    rate: settings?.usdToUzsRate ? Number(settings.usdToUzsRate) : null,
    date: settings?.usdToUzsRateDate ?? null,
  };
}
