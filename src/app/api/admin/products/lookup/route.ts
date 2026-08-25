import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    select: { id: true, inventoryNumber: true },
  });
  return NextResponse.json(products);
}
