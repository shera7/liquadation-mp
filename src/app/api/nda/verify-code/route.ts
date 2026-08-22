import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { token, code } = await req.json();
  if (!token || !code) {
    return NextResponse.json({ error: "Не хватает данных" }, { status: 400 });
  }

  const session = await prisma.ndaOtpSession.findUnique({ where: { token } });
  if (!session || !session.codeHash || !session.expiresAt) {
    return NextResponse.json({ error: "Сессия не найдена. Начните заново." }, { status: 400 });
  }
  if (session.verifiedAt) {
    return NextResponse.json({ error: "Код уже использован" }, { status: 400 });
  }
  if (session.expiresAt < new Date()) {
    return NextResponse.json({ error: "Код истёк. Запросите новый." }, { status: 400 });
  }
  if (session.attempts >= 5) {
    return NextResponse.json({ error: "Слишком много попыток. Начните заново." }, { status: 429 });
  }

  const valid = await verifyPassword(code, session.codeHash);
  if (!valid) {
    await prisma.ndaOtpSession.update({ where: { token }, data: { attempts: { increment: 1 } } });
    return NextResponse.json({ error: "Неверный код" }, { status: 400 });
  }

  const activeDoc = await prisma.ndaDocument.findFirst({ where: { status: "ACTIVE" } });
  if (!activeDoc || !session.telegramChatId) {
    return NextResponse.json({ error: "NDA недоступен" }, { status: 400 });
  }

  const acceptance = await prisma.ndaAcceptance.create({
    data: {
      telegramId: session.telegramChatId,
      telegramUsername: session.telegramUsername,
      telegramFirstName: session.telegramFirstName,
      ndaDocumentId: activeDoc.id,
      ndaVersion: activeDoc.version,
      documentHash: activeDoc.contentHash,
      ipAddress: session.ip,
      userAgent: req.headers.get("user-agent") || undefined,
    },
  });

  await prisma.ndaOtpSession.update({ where: { token }, data: { verifiedAt: new Date() } });

  return NextResponse.json({
    ok: true,
    acceptanceId: acceptance.id,
    telegramId: acceptance.telegramId,
    telegramUsername: acceptance.telegramUsername,
    ndaVersion: acceptance.ndaVersion,
  });
}
