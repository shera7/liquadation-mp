import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const settings = await getSiteSettings();
  if (!settings.ndaBotUsername) {
    return NextResponse.json({ error: "NDA-бот не настроен" }, { status: 500 });
  }

  const activeDoc = await prisma.ndaDocument.findFirst({ where: { status: "ACTIVE" } });
  if (!activeDoc) {
    return NextResponse.json({ error: "NDA не настроен" }, { status: 400 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const recentCount = await prisma.ndaOtpSession.count({
    where: { ip, createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } },
  });
  if (recentCount >= 5) {
    return NextResponse.json({ error: "Слишком много попыток. Попробуйте позже." }, { status: 429 });
  }

  const token = crypto.randomBytes(16).toString("hex");

  await prisma.ndaOtpSession.create({
    data: { token, ip, ndaDocumentId: activeDoc.id },
  });

  return NextResponse.json({
    token,
    deepLink: `https://t.me/${settings.ndaBotUsername}?start=${token}`,
  });
}
