import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: { id: string };
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { active } = await req.json();
  const recipient = await prisma.telegramRecipient.update({
    where: { id: params.id },
    data: { active: Boolean(active) },
  });
  return NextResponse.json(recipient);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  await prisma.telegramRecipient.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
