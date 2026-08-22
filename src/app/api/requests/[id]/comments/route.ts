import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";

interface Params {
  params: { id: string };
}

export async function POST(req: NextRequest, { params }: Params) {
  const { text } = await req.json();
  if (!text?.trim()) {
    return NextResponse.json({ error: "Пустой комментарий" }, { status: 400 });
  }

  const token = cookies().get("admin_session")?.value;
  const session = token ? await verifySessionToken(token) : null;

  const comment = await prisma.requestComment.create({
    data: {
      requestId: params.id,
      authorId: session?.sub,
      authorName: session?.name ?? "Администратор",
      text,
    },
  });

  return NextResponse.json(comment, { status: 201 });
}
