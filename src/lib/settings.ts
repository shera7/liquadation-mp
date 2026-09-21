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
      contactAddress: null,
      telegramBotToken: null,
      telegramManagerChatId: null,
      telegramBotUsername: null,
      ndaBotToken: null,
      ndaBotUsername: null,
      ndaWebhookSecret: null,
      managerWebhookSecret: null,
      faviconUrl: null,
      metaTitle: null,
      metaDescription: null,
      ogImageUrl: null,
      usdToUzsRate: null,
      usdToUzsRateDate: null,
      usdToUzsUpdatedAt: null,
      currencyRateSource: "auto",
      ndaMinPriceUsd: null,
      ga4MeasurementId: null,
      googleAdsConversionId: null,
      googleAdsConversionLabel: null,
      metaPixelId: null,
      metaConversionsApiToken: null,
      metaTestEventCode: null,
    }
  );
}

export async function upsertSiteSettings(data: {
  siteName?: string;
  contactPhone?: string | null;
  contactEmail?: string | null;
  contactTelegram?: string | null;
  contactWhatsapp?: string | null;
  contactAddress?: string | null;
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
  ga4MeasurementId?: string | null;
  googleAdsConversionId?: string | null;
  googleAdsConversionLabel?: string | null;
  metaPixelId?: string | null;
  metaConversionsApiToken?: string | null;
  metaTestEventCode?: string | null;
}) {
  return prisma.siteSettings.upsert({
    where: { id: SETTINGS_ID },
    update: data,
    create: { id: SETTINGS_ID, ...data },
  });
}
