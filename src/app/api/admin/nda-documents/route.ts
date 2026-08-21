import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashContent } from "@/lib/nda";

export async function GET() {
  const documents = await prisma.ndaDocument.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { acceptances: true } } },
  });
  return NextResponse.json(documents);
}

export async function POST(req: NextRequest) {
  const { version, title, content } = await req.json();

  if (!version || !title || !content) {
    return NextResponse.json({ error: "Заполните все поля" }, { status: 400 });
  }

  const doc = await prisma.ndaDocument.create({
    data: {
      version,
      title,
      content,
      contentHash: hashContent(content),
      status: "DRAFT",
    },
  });

  return NextResponse.json(doc, { status: 201 });
}
