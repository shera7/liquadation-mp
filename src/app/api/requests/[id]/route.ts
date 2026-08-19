import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: { id: string };
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const body = await req.json();
  try {
    const request = await prisma.request.update({
      where: { id: params.id },
      data: {
        status: body.status,
        managerNote: body.managerNote,
      },
    });
    return NextResponse.json(request);
  } catch {
    return NextResponse.json({ error: "Не удалось обновить заявку" }, { status: 400 });
  }
}
