import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";
import { hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const settings = await getSiteSettings();

  if (settings.ndaWebhookSecret) {
    const header = req.headers.get("x-telegram-bot-api-secret-token");
    if (header !== settings.ndaWebhookSecret) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  const update = await req.json();
  const message = update.message;
  if (!message?.text?.startsWith("/start")) {
    return NextResponse.json({ ok: true });
  }

  const token = message.text.replace("/start", "").trim();
  if (!token) return NextResponse.json({ ok: true });

  const session = await prisma.ndaOtpSession.findUnique({ where: { token } });
  if (!session || session.verifiedAt) {
    return NextResponse.json({ ok: true });
  }

  if (session.codeSentAt && Date.now() - session.codeSentAt.getTime() < 60 * 1000) {
    return NextResponse.json({ ok: true });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const codeHash = await hashPassword(code);

  await prisma.ndaOtpSession.update({
    where: { token },
    data: {
      telegramChatId: String(message.chat.id),
      telegramUsername: message.from?.username || null,
      telegramFirstName: message.from?.first_name || null,
      codeHash,
      codeSentAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      attempts: 0,
    },
  });

  if (settings.ndaBotToken) {
    await fetch(`https://api.telegram.org/bot${settings.ndaBotToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: message.chat.id,
        text: `Ваш код подтверждения NDA: <b>${code}</b>\n\nВведите его на сайте. Код действует 10 минут.`,
        parse_mode: "HTML",
      }),
    });
  }

  return NextResponse.json({ ok: true });
}
