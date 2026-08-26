import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";
import crypto from "crypto";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  const genericResponse = NextResponse.json({
    ok: true,
    message: "Если такой email зарегистрирован и к нему привязан Telegram, инструкция по восстановлению отправлена.",
  });

  if (!email) return genericResponse;

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin || !admin.telegramChatId) return genericResponse;

  const settings = await getSiteSettings();
  if (!settings.telegramBotToken) return genericResponse;

  const rawToken = crypto.randomBytes(24).toString("hex");

  await prisma.passwordResetToken.create({
    data: { adminId: admin.id, tokenHash: hashToken(rawToken), expiresAt: new Date(Date.now() + 30 * 60 * 1000) },
  });

  const resetUrl = `${req.nextUrl.origin}/reset-password?token=${rawToken}`;

  try {
    await fetch(`https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: admin.telegramChatId,
        text: `<b>Восстановление пароля</b>\n\nКто-то запросил сброс пароля для аккаунта ${admin.email}.\n\nЕсли это были вы, перейдите по ссылке (действует 30 минут):\n${resetUrl}\n\nЕсли не вы — просто проигнорируйте это сообщение.`,
        parse_mode: "HTML",
      }),
      signal: AbortSignal.timeout(8000),
    });
  } catch (e) {
    console.error("[forgot-password] Ошибка отправки Telegram:", e);
  }

  return genericResponse;
}
