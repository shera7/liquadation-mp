import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashContent } from "@/lib/nda";

interface Params {
  params: { id: string };
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const body = await req.json();

  if (body.action === "activate") {
    await prisma.$transaction([
      prisma.ndaDocument.updateMany({ where: { status: "ACTIVE" }, data: { status: "ARCHIVED" } }),
      prisma.ndaDocument.update({ where: { id: params.id }, data: { status: "ACTIVE", effectiveFrom: new Date() } }),
    ]);
    return NextResponse.json({ ok: true });
  }

  if (body.action === "archive") {
    await prisma.ndaDocument.update({ where: { id: params.id }, data: { status: "ARCHIVED" } });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "update") {
    const doc = await prisma.ndaDocument.findUnique({ where: { id: params.id } });
    if (!doc) return NextResponse.json({ error: "Не найдено" }, { status: 404 });
    if (doc.status !== "DRAFT") {
      return NextResponse.json({ error: "Редактировать можно только черновики" }, { status: 400 });
    }
    const updated = await prisma.ndaDocument.update({
      where: { id: params.id },
      data: {
        title: body.title,
        version: body.version,
        content: body.content,
        contentHash: hashContent(body.content),
      },
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Неизвестное действие" }, { status: 400 });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const doc = await prisma.ndaDocument.findUnique({
    where: { id: params.id },
    include: { _count: { select: { acceptances: true } } },
  });
  if (!doc) return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  if (doc.status !== "DRAFT") {
    return NextResponse.json({ error: "Удалять можно только черновики" }, { status: 400 });
  }
  if (doc._count.acceptances > 0) {
    return NextResponse.json({ error: "У черновика есть подписания, удаление невозможно" }, { status: 400 });
  }
  await prisma.ndaDocument.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
