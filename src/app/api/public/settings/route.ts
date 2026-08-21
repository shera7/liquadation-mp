import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/settings";

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json({
    siteName: settings.siteName,
    contactPhone: settings.contactPhone,
    contactEmail: settings.contactEmail,
    contactTelegram: settings.contactTelegram,
    contactWhatsapp: settings.contactWhatsapp,
    telegramBotUsername: settings.telegramBotUsername,
  });
}
