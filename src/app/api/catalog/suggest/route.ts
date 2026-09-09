import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { toTsQuery } from "@/lib/catalogSearch";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() || "";
  if (q.length < 2) return NextResponse.json([]);

  const tsQuery = toTsQuery(q, true); // префикс на последнем слове — для ввода "на лету"
  if (!tsQuery) return NextResponse.json([]);

  const rows = await prisma.$queryRaw<{ id: string }[]>(Prisma.sql`
    SELECT p."id"
    FROM "Product" p
    WHERE p."status" != 'WITHDRAWN' AND p."searchVector" @@ to_tsquery('russian', ${tsQuery})
    ORDER BY ts_rank(p."searchVector", to_tsquery('russian', ${tsQuery})) DESC
    LIMIT 6
  `);

  const ids = rows.map((r) => r.id);
  if (ids.length === 0) return NextResponse.json([]);

  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      slug: true,
      title: true,
      price: true,
      currency: true,
      priceOnRequest: true,
      images: { take: 1, orderBy: { sortOrder: "asc" } },
    },
  });
  const byId = new Map(products.map((p) => [p.id, p]));
  const ordered = ids.map((id) => byId.get(id)).filter(Boolean);

  return NextResponse.json(ordered);
}
