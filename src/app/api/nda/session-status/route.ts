import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) return NextResponse.json({ codeSent: false });

  const session = await prisma.ndaOtpSession.findUnique({ where: { token } });
  return NextResponse.json({ codeSent: Boolean(session?.codeSentAt) });
}
