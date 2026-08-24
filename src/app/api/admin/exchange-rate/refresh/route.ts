import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchCbuUsdRate } from "@/lib/exchangeRate";

const SETTINGS_ID = "singleton";

export async function POST() {
  const fresh = await fetchCbuUsdRate();
  if (!fresh) {
    return NextResponse.json({ error: "Не удалось получить курс с cbu.uz" }, { status: 502 });
  }

  await prisma.siteSettings.upsert({
    where: { id: SETTINGS_ID },
    update: { usdToUzsRate: fresh.rate, usdToUzsRateDate: fresh.date, usdToUzsUpdatedAt: new Date() },
    create: { id: SETTINGS_ID, usdToUzsRate: fresh.rate, usdToUzsRateDate: fresh.date, usdToUzsUpdatedAt: new Date() },
  });

  return NextResponse.json({ ok: true, rate: fresh.rate, date: fresh.date });
}
