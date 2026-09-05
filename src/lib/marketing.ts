import { prisma } from "@/lib/prisma";

export type ResolvedBlock =
  | { id: string; type: "HERO_CAROUSEL" | "MINI_BANNER"; title: string | null; slides: SlideDTO[] }
  | {
      id: string;
      type: "NEWEST_PRODUCTS" | "POPULAR_PRODUCTS" | "DISCOUNTED_PRODUCTS" | "CATEGORY_CAROUSEL";
      title: string | null;
      products: any[];
    }
  | { id: string; type: "TEXT_HTML"; title: string | null; html: string };

interface SlideDTO {
  id: string;
  imageUrl: string;
  title: string | null;
  subtitle: string | null;
  buttonLabel: string | null;
  linkUrl: string | null;
}

const PRODUCT_INCLUDE = { images: true, category: true } as const;

/**
 * Возвращает активные блоки главной страницы в заданном администратором
 * порядке, с уже подгруженными данными (товары/категории/слайды).
 */
export async function getResolvedMarketingBlocks(): Promise<ResolvedBlock[]> {
  const blocks = await prisma.marketingBlock.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      slides: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
    },
  });

  const resolved: ResolvedBlock[] = [];

  for (const block of blocks) {
    const settings = (block.settings as Record<string, any>) ?? {};
    const limit = typeof settings.limit === "number" ? settings.limit : 8;

    switch (block.type) {
      case "HERO_CAROUSEL":
      case "MINI_BANNER": {
        if (block.slides.length === 0) continue;
        resolved.push({
          id: block.id,
          type: block.type,
          title: block.title,
          slides: block.slides.map((s) => ({
            id: s.id,
            imageUrl: s.imageUrl,
            title: s.title,
            subtitle: s.subtitle,
            buttonLabel: s.buttonLabel,
            linkUrl: s.linkUrl,
          })),
        });
        break;
      }

      case "NEWEST_PRODUCTS": {
        const products = await prisma.product.findMany({
          where: { status: { not: "WITHDRAWN" } },
          orderBy: { createdAt: "desc" },
          take: limit,
          include: PRODUCT_INCLUDE,
        });
        if (products.length === 0) continue;
        resolved.push({ id: block.id, type: "NEWEST_PRODUCTS", title: block.title, products });
        break;
      }

      case "POPULAR_PRODUCTS": {
        const products = await prisma.product.findMany({
          where: { status: { not: "WITHDRAWN" } },
          orderBy: { viewsCount: "desc" },
          take: limit,
          include: PRODUCT_INCLUDE,
        });
        if (products.length === 0) continue;
        resolved.push({ id: block.id, type: "POPULAR_PRODUCTS", title: block.title, products });
        break;
      }

      case "DISCOUNTED_PRODUCTS": {
        const products = await prisma.product.findMany({
          where: { status: { not: "WITHDRAWN" }, oldPrice: { not: null } },
          orderBy: { updatedAt: "desc" },
          take: limit,
          include: PRODUCT_INCLUDE,
        });
        if (products.length === 0) continue;
        resolved.push({ id: block.id, type: "DISCOUNTED_PRODUCTS", title: block.title, products });
        break;
      }

        case "CATEGORY_CAROUSEL": {
        // Администратор выбирает одну категорию — блок показывает товары
        // именно этой категории (и её подкатегорий), в том же виде,
        // что и «Новые поступления».
        const categoryId: string | undefined = settings.categoryId;
        if (!categoryId) continue;

        const category = await prisma.category.findUnique({
          where: { id: categoryId },
          include: { children: true },
        });
        if (!category) continue;

        const categoryIds = [category.id, ...category.children.map((c) => c.id)];
        const products = await prisma.product.findMany({
          where: { status: { not: "WITHDRAWN" }, categoryId: { in: categoryIds } },
          orderBy: { createdAt: "desc" },
          take: limit,
          include: PRODUCT_INCLUDE,
        });
        if (products.length === 0) continue;
        resolved.push({
          id: block.id,
          type: "CATEGORY_CAROUSEL",
          title: block.title || category.name,
          products,
        });
        break;
      }

      case "TEXT_HTML": {
        const html = typeof settings.html === "string" ? settings.html : "";
        if (!html.trim()) continue;
        resolved.push({ id: block.id, type: "TEXT_HTML", title: block.title, html });
        break;
      }
    }
  }

  return resolved;
}
