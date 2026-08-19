import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { children: true, _count: { select: { products: true } } },
  });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.name) {
    return NextResponse.json({ error: "Название обязательно" }, { status: 400 });
  }

  const category = await prisma.category.create({
    data: {
      name: body.name,
      slug: slugify(body.name, { lower: true, strict: true }),
      parentId: body.parentId ?? null,
      sortOrder: body.sortOrder ?? 0,
    },
  });
  return NextResponse.json(category, { status: 201 });
}
