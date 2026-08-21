import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: { id: string; documentId: string };
}

export async function DELETE(req: NextRequest, { params }: Params) {
  await prisma.productDocument.delete({ where: { id: params.documentId } });
  return NextResponse.json({ ok: true });
}
