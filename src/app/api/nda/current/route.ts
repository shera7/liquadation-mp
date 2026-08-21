import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const doc = await prisma.ndaDocument.findFirst({ where: { status: "ACTIVE" } });
  if (!doc) return NextResponse.json({ active: false });

  return NextResponse.json({
    active: true,
    id: doc.id,
    version: doc.version,
    title: doc.title,
    content: doc.content,
    contentHash: doc.contentHash,
    effectiveFrom: doc.effectiveFrom,
  });
}
