import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const recipients = await prisma.telegramRecipient.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(recipients);
}

export async function POST(req: NextRequest) {
  const { chatId, label } = await req.json();
  if (!chatId?.trim()) {
    return NextResponse.json({ error: "Укажите Chat ID" }, { status: 400 });
  }

  const recipient = await prisma.telegramRecipient.create({
    data: { chatId: chatId.trim(), label: label?.trim() || null },
  });

  return NextResponse.json(recipient, { status: 201 });
}
