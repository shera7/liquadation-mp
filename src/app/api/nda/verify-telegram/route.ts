import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";
import { verifyTelegramAuth } from "@/lib/nda";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { ndaDocumentId, ...authData } = body;

  const settings = await getSiteSettings();
  if (!settings.telegramBotToken) {
    return NextResponse.json({ error: "Telegram-бот не настроен" }, { status: 500 });
  }

  if (!verifyTelegramAuth(authData, settings.telegramBotToken)) {
    return NextResponse.json({ error: "Не удалось подтвердить данные Telegram" }, { status: 401 });
  }

  const doc = await prisma.ndaDocument.findFirst({ where: { id: ndaDocumentId, status: "ACTIVE" } });
  if (!doc) {
    return NextResponse.json({ error: "Версия NDA не найдена или уже неактуальна" }, { status: 400 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const acceptance = await prisma.ndaAcceptance.create({
    data: {
      telegramId: String(authData.id),
      telegramUsername: authData.username || null,
      telegramFirstName: authData.first_name || null,
      ndaDocumentId: doc.id,
      ndaVersion: doc.version,
      documentHash: doc.contentHash,
      ipAddress: ip,
      userAgent: req.headers.get("user-agent") || undefined,
    },
  });

  return NextResponse.json({
    ok: true,
    acceptanceId: acceptance.id,
    telegramId: acceptance.telegramId,
    ndaVersion: acceptance.ndaVersion,
    signedAt: acceptance.signedAt,
  });
}
