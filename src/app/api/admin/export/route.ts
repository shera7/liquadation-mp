import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

const STATUS_LABELS_RU: Record<string, string> = {
  IN_STOCK: "В продаже",
  RESERVED: "Забронировано",
  SOLD: "Продано",
  WITHDRAWN: "Снято с продажи",
};

const CONDITION_LABELS_RU: Record<string, string> = {
  NEW: "Новое",
  USED: "Б/У",
  NEEDS_REPAIR: "Требует ремонта",
};

export async function POST(req: NextRequest) {
  const { ids } = await req.json();

  const products = await prisma.product.findMany({
    where: Array.isArray(ids) && ids.length > 0 ? { id: { in: ids } } : undefined,
    include: { category: { include: { parent: true } } },
    orderBy: { createdAt: "desc" },
  });

  const rows = products.map((p) => ({
    ID: p.inventoryNumber,
    Название: p.title,
    Категория: p.category.parent ? p.category.parent.name : p.category.name,
    Подкатегория: p.category.parent ? p.category.name : "",
    Производитель: p.manufacturer ?? "",
    Модель: p.model ?? "",
    Год: p.year ?? "",
    Состояние: CONDITION_LABELS_RU[p.condition],
    Количество: p.quantity,
    Цена: p.priceOnRequest ? "" : p.price?.toString() ?? "",
    Валюта: p.currency,
    Местонахождение: p.location ?? "",
    Описание: p.description ?? "",
    Статус: STATUS_LABELS_RU[p.status],
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Товары");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="products-export.xlsx"`,
    },
  });
}
