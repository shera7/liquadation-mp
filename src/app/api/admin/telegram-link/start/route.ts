import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const token = cookies().get("admin_session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }

  const settings = await getSiteSettings();
  if (!settings.telegramBotUsername) {
    return NextResponse.json({ error: "Username бота не настроен в Настройках" }, { status: 500 });
  }

  const linkToken = crypto.randomBytes(16).toString("hex");

  await prisma.admin.update({
    where: { id: session.sub },
    data: {
      telegramLinkToken: linkToken,
      telegramLinkTokenExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  return NextResponse.json({
    deepLink: `https://t.me/${settings.telegramBotUsername}?start=admin_${linkToken}`,
  });
}
