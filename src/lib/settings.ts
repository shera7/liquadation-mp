import { prisma } from "./prisma";

const SETTINGS_ID = "singleton";

export async function getSiteSettings() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: SETTINGS_ID } });
  return (
    settings ?? {
      id: SETTINGS_ID,
      siteName: "Актив.Каталог",
      contactPhone: null,
      contactEmail: null,
      contactTelegram: null,
      contactWhatsapp: null,
      telegramBotToken: null,
      telegramManagerChatId: null,
      telegramBotUsername: null,
      ndaBotToken: null,
      ndaBotUsername: null,
      ndaWebhookSecret: null,
      faviconUrl: null,
      metaTitle: null,
      metaDescription: null,
      ogImageUrl: null,
      usdToUzsRate: null,
      usdToUzsRateDate: null,
      usdToUzsUpdatedAt: null,
      currencyRateSource: "auto",
      ndaMinPriceUsd: null,
    }
  );
}

export async function upsertSiteSettings(data: {
  siteName?: string;
  contactPhone?: string | null;
  contactEmail?: string | null;
  contactTelegram?: string | null;
  contactWhatsapp?: string | null;
  telegramBotToken?: string | null;
  telegramManagerChatId?: string | null;
  ndaBotToken?: string | null;
  ndaBotUsername?: string | null;
  ndaWebhookSecret?: string | null;
  faviconUrl?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImageUrl?: string | null;
  currencyRateSource?: string;
  ndaMinPriceUsd?: number | null;
}) {
  return prisma.siteSettings.upsert({
    where: { id: SETTINGS_ID },
    update: data,
    create: { id: SETTINGS_ID, ...data },
  });
}
