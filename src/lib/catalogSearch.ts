import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const CATALOG_PAGE_SIZE = 48;

export interface CatalogParams {
  q?: string;
  category?: string;
  status?: string;
  condition?: string;
  priceMin?: string;
  priceMax?: string;
  manufacturer?: string;
  yearMin?: string;
  yearMax?: string;
  sort?: string;
}

/** Фильтры без текстового поиска — используются, когда q не задан. */
function buildPrismaWhere(p: CatalogParams): Prisma.ProductWhereInput {
  return {
    ...(p.category && {
      category: { OR: [{ slug: p.category }, { parent: { slug: p.category } }] },
    }),
    ...(p.status ? { status: p.status as any } : { status: { not: "WITHDRAWN" } }),
    ...(p.condition && { condition: p.condition as any }),
    ...(p.manufacturer && { manufacturer: { equals: p.manufacturer, mode: "insensitive" } }),
    ...((p.yearMin || p.yearMax) && {
      year: {
        ...(p.yearMin && { gte: Number(p.yearMin) }),
        ...(p.yearMax && { lte: Number(p.yearMax) }),
      },
    }),
    ...((p.priceMin || p.priceMax) && {
      price: {
        ...(p.priceMin && { gte: Number(p.priceMin) }),
        ...(p.priceMax && { lte: Number(p.priceMax) }),
      },
    }),
  };
}

/** Те же фильтры, но как SQL-условия — для запроса с полнотекстовым поиском. */
function buildSqlConditions(p: CatalogParams): Prisma.Sql[] {
  const c: Prisma.Sql[] = [];

  if (p.status) {
    c.push(Prisma.sql`p."status" = ${p.status}::"ProductStatus"`);
  } else {
    c.push(Prisma.sql`p."status" != 'WITHDRAWN'`);
  }
  if (p.condition) c.push(Prisma.sql`p."condition" = ${p.condition}::"ProductCondition"`);
  if (p.manufacturer) c.push(Prisma.sql`p."manufacturer" ILIKE ${p.manufacturer}`);
  if (p.yearMin) c.push(Prisma.sql`p."year" >= ${Number(p.yearMin)}`);
  if (p.yearMax) c.push(Prisma.sql`p."year" <= ${Number(p.yearMax)}`);
  if (p.priceMin) c.push(Prisma.sql`p."price" >= ${Number(p.priceMin)}`);
  if (p.priceMax) c.push(Prisma.sql`p."price" <= ${Number(p.priceMax)}`);
  if (p.category) {
    c.push(Prisma.sql`(cat."slug" = ${p.category} OR parent_cat."slug" = ${p.category})`);
  }
  return c;
}

/**
 * Превращает поисковую фразу в tsquery: каждое слово обязательно (AND),
 * последнее слово — с префиксом (:*), чтобы находить недописанные слова
 * (полезно для автодополнения и при вводе на лету).
 */
export function toTsQuery(q: string, prefixLast = false): string {
  const words = q
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.replace(/[&|!():*']/g, ""))
    .filter(Boolean);
  if (words.length === 0) return "";
  return words.map((w, i) => (prefixLast && i === words.length - 1 ? `${w}:*` : w)).join(" & ");
}

/**
 * Основной поиск/листинг каталога. Если q не задан — обычный Prisma-запрос
 * с фильтрами. Если q задан — полнотекстовый поиск PostgreSQL с
 * ранжированием по релевантности (ts_rank), с теми же фильтрами.
 */
export async function searchCatalog(p: CatalogParams, page: number) {
  const q = p.q?.trim();

  if (!q) {
    const where = buildPrismaWhere(p);
    const orderBy: Prisma.ProductOrderByWithRelationInput =
      p.sort === "price_asc"
        ? { price: "asc" }
        : p.sort === "price_desc"
        ? { price: "desc" }
        : p.sort === "popular"
        ? { viewsCount: "desc" }
        : { createdAt: "desc" };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * CATALOG_PAGE_SIZE,
        take: CATALOG_PAGE_SIZE,
        include: { images: true, category: true },
      }),
      prisma.product.count({ where }),
    ]);
    return { products, total };
  }

  const tsQuery = toTsQuery(q);
  if (!tsQuery) return { products: [], total: 0 };

  const conditions = buildSqlConditions(p);
  conditions.push(Prisma.sql`p."searchVector" @@ to_tsquery('russian', ${tsQuery})`);
  const whereSql = Prisma.join(conditions, " AND ");

  const orderSql =
    p.sort === "price_asc"
      ? Prisma.sql`p."price" ASC NULLS LAST`
      : p.sort === "price_desc"
      ? Prisma.sql`p."price" DESC NULLS LAST`
      : p.sort === "popular"
      ? Prisma.sql`p."viewsCount" DESC`
      : Prisma.sql`ts_rank(p."searchVector", to_tsquery('russian', ${tsQuery})) DESC`;

  const rows = await prisma.$queryRaw<{ id: string }[]>(Prisma.sql`
    SELECT p."id"
    FROM "Product" p
    JOIN "Category" cat ON cat."id" = p."categoryId"
    LEFT JOIN "Category" parent_cat ON parent_cat."id" = cat."parentId"
    WHERE ${whereSql}
    ORDER BY ${orderSql}
    LIMIT ${CATALOG_PAGE_SIZE} OFFSET ${(page - 1) * CATALOG_PAGE_SIZE}
  `);

  const countRows = await prisma.$queryRaw<{ count: bigint }[]>(Prisma.sql`
    SELECT COUNT(*)::bigint as count
    FROM "Product" p
    JOIN "Category" cat ON cat."id" = p."categoryId"
    LEFT JOIN "Category" parent_cat ON parent_cat."id" = cat."parentId"
    WHERE ${whereSql}
  `);

  const total = Number(countRows[0]?.count ?? 0);
  const ids = rows.map((r) => r.id);
  if (ids.length === 0) return { products: [], total };

  const productsUnordered = await prisma.product.findMany({
    where: { id: { in: ids } },
    include: { images: true, category: true },
  });
  const byId = new Map(productsUnordered.map((pr) => [pr.id, pr]));
  const products = ids.map((id) => byId.get(id)).filter(Boolean) as typeof productsUnordered;

  return { products, total };
}
