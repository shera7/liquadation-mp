import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { compareVersions } from "@/lib/nda";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const acceptanceId = searchParams.get("acceptanceId");
  const telegramId = searchParams.get("telegramId");

  if (!acceptanceId || !telegramId) {
    return NextResponse.json({ valid: false });
  }

  const acceptance = await prisma.ndaAcceptance.findUnique({ where: { id: acceptanceId } });
  const activeDoc = await prisma.ndaDocument.findFirst({ where: { status: "ACTIVE" } });

  if (!acceptance || acceptance.telegramId !== telegramId || !activeDoc) {
    return NextResponse.json({ valid: false });
  }

  const upToDate = compareVersions(acceptance.ndaVersion, activeDoc.version) >= 0;
  return NextResponse.json({ valid: upToDate, currentVersion: activeDoc.version });
}
