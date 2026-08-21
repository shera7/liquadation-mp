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
}) {
  return prisma.siteSettings.upsert({
    where: { id: SETTINGS_ID },
    update: data,
    create: { id: SETTINGS_ID, ...data },
  });
}
