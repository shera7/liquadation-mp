import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const PAGE_SIZE = 48;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || undefined;
  const category = searchParams.get("category") || undefined;
  const status = searchParams.get("status") || undefined;
  const condition = searchParams.get("condition") || undefined;
  const priceMin = searchParams.get("priceMin") || undefined;
  const priceMax = searchParams.get("priceMax") || undefined;
  const sort = searchParams.get("sort") || undefined;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const where: Prisma.ProductWhereInput = {
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { inventoryNumber: { contains: q, mode: "insensitive" } },
      ],
    }),
    ...(category && { category: { OR: [{ slug: category }, { parent: { slug: category } }] } }),
    ...(status ? { status: status as any } : { status: { not: "WITHDRAWN" } }),
    ...(condition && { condition: condition as any }),
    ...(priceMin || priceMax
      ? {
          price: {
            ...(priceMin && { gte: Number(priceMin) }),
            ...(priceMax && { lte: Number(priceMax) }),
          },
        }
      : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price_asc"
      ? { price: "asc" }
      : sort === "price_desc"
      ? { price: "desc" }
      : sort === "popular"
      ? { viewsCount: "desc" }
      : { createdAt: "desc" };

  const products = await prisma.product.findMany({
    where,
    orderBy,
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: { images: true, category: true },
  });

  return NextResponse.json({ products });
}
