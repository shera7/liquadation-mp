import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";
import { z } from "zod";

const createProductSchema = z.object({
  title: z.string().min(2),
  categoryId: z.string(),
  inventoryNumber: z.string().min(1),
  description: z.string().optional(),
  price: z.number().nullable().optional(),
  priceOnRequest: z.boolean().optional(),
  currency: z.enum(["USD", "UZS"]).optional(),
  quantity: z.number().int().min(0).optional(),
  unit: z.string().optional(),
  location: z.string().optional(),
  condition: z.enum(["NEW", "USED", "NEEDS_REPAIR"]).optional(),
  status: z.enum(["IN_STOCK", "RESERVED", "SOLD", "WITHDRAWN"]).optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  year: z.number().int().optional(),
  power: z.string().optional(),
  images: z
    .array(z.object({ url: z.string(), isPrimary: z.boolean().optional() }))
    .optional(),
});

export async function GET(req: NextRequest) {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { images: true, category: true },
    take: 50,
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createProductSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { images, ...productData } = parsed.data;
  const slug = `${slugify(productData.title, { lower: true, strict: true })}-${productData.inventoryNumber}`;

  try {
    const product = await prisma.product.create({
      data: {
        ...productData,
        slug,
        images: images
          ? {
              create: images.map((img, i) => ({
                url: img.url,
                isPrimary: img.isPrimary ?? i === 0,
                sortOrder: i,
              })),
            }
          : undefined,
      },
      include: { images: true },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json(
        { error: "Товар с таким инвентарным номером уже существует" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Не удалось создать товар" }, { status: 500 });
  }
}
