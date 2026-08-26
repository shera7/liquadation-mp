import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";

export async function POST(req: NextRequest) {
  const settings = await getSiteSettings();

  if (settings.managerWebhookSecret) {
    const header = req.headers.get("x-telegram-bot-api-secret-token");
    if (header !== settings.managerWebhookSecret) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  const update = await req.json();
  const message = update.message;
  if (!message?.text?.startsWith("/start")) {
    return NextResponse.json({ ok: true });
  }

  const payload = message.text.replace("/start", "").trim();
  if (!payload.startsWith("admin_")) {
    return NextResponse.json({ ok: true });
  }

  const linkToken = payload.replace("admin_", "");

  const admin = await prisma.admin.findFirst({
    where: { telegramLinkToken: linkToken, telegramLinkTokenExpiresAt: { gt: new Date() } },
  });

  if (!admin) {
    if (settings.telegramBotToken) {
      await fetch(`https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: message.chat.id,
          text: "Ссылка для привязки устарела или недействительна. Сгенерируйте новую в админке.",
        }),
      });
    }
    return NextResponse.json({ ok: true });
  }

  await prisma.admin.update({
    where: { id: admin.id },
    data: { telegramChatId: String(message.chat.id), telegramLinkToken: null, telegramLinkTokenExpiresAt: null },
  });

  if (settings.telegramBotToken) {
    await fetch(`https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: message.chat.id,
        text: `Telegram успешно привязан к аккаунту «${admin.name}». Теперь сюда будет приходить ссылка для восстановления пароля.`,
      }),
    });
  }

  return NextResponse.json({ ok: true });
}
