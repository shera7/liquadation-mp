import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";

export async function GET() {
  const token = cookies().get("admin_session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) return NextResponse.json({ linked: false }, { status: 401 });

  const admin = await prisma.admin.findUnique({ where: { id: session.sub }, select: { telegramChatId: true } });
  return NextResponse.json({ linked: Boolean(admin?.telegramChatId) });
}
