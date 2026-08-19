import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";
import slugify from "slugify";

// Ожидаемые колонки Excel/CSV (см. раздел 10 ТЗ):
// ID | Название | Категория | Подкатегория | Производитель | Модель | Год |
// Состояние | Количество | Цена | Валюта | Местонахождение | Описание | Статус
//
// На Фазе 2 сюда добавляется экран визуального сопоставления колонок (раздел 30 ТЗ).
// На Фазе 1 колонки должны называться точно как в шаблоне ниже.

const STATUS_MAP: Record<string, string> = {
  "в продаже": "IN_STOCK",
  "забронировано": "RESERVED",
  "продано": "SOLD",
  "снято с продажи": "WITHDRAWN",
};

const CONDITION_MAP: Record<string, string> = {
  "новое": "NEW",
  "б/у": "USED",
  "требует ремонта": "NEEDS_REPAIR",
};

interface ImportError {
  row: number;
  message: string;
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Файл не передан" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  const errors: ImportError[] = [];
  let successCount = 0;

  // Категории кешируем по имени, чтобы не создавать дубликаты и не бить БД в цикле
  const categoryCache = new Map<string, string>(); // имя категории -> id
  const existingCategories = await prisma.category.findMany();
  existingCategories.forEach((c) => categoryCache.set(c.name.toLowerCase(), c.id));

  async function resolveCategoryId(categoryName: string, subcategoryName?: string) {
    const targetName = subcategoryName?.trim() || categoryName.trim();
    const key = targetName.toLowerCase();
    if (categoryCache.has(key)) return categoryCache.get(key)!;

    let parentId: string | undefined;
    if (subcategoryName) {
      const parentKey = categoryName.trim().toLowerCase();
      if (!categoryCache.has(parentKey)) {
        const parent = await prisma.category.create({
          data: { name: categoryName.trim(), slug: slugify(categoryName, { lower: true, strict: true }) },
        });
        categoryCache.set(parentKey, parent.id);
      }
      parentId = categoryCache.get(parentKey);
    }

    const created = await prisma.category.create({
      data: {
        name: targetName,
        slug: slugify(targetName, { lower: true, strict: true }),
        parentId,
      },
    });
    categoryCache.set(key, created.id);
    return created.id;
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // +1 заголовок, +1 индексация с 1

    try {
      const title = String(row["Название"] || "").trim();
      const inventoryNumber = String(row["ID"] || "").trim();
      const categoryName = String(row["Категория"] || "").trim();

      if (!title) throw new Error("Не заполнено поле «Название»");
      if (!inventoryNumber) throw new Error("Не заполнено поле «ID» (инвентарный номер)");
      if (!categoryName) throw new Error("Не заполнено поле «Категория»");

      const categoryId = await resolveCategoryId(categoryName, String(row["Подкатегория"] || "").trim());

      const priceRaw = row["Цена"];
      const price = priceRaw === "" || priceRaw === undefined ? null : Number(priceRaw);
      if (priceRaw !== "" && Number.isNaN(price)) {
        throw new Error(`Некорректная цена: "${priceRaw}"`);
      }

      const statusKey = String(row["Статус"] || "").trim().toLowerCase();
      const conditionKey = String(row["Состояние"] || "").trim().toLowerCase();

      const slug = `${slugify(title, { lower: true, strict: true })}-${inventoryNumber}`;

      await prisma.product.upsert({
        where: { inventoryNumber },
        create: {
          title,
          slug,
          inventoryNumber,
          categoryId,
          manufacturer: String(row["Производитель"] || "") || undefined,
          model: String(row["Модель"] || "") || undefined,
          year: row["Год"] ? Number(row["Год"]) : undefined,
          condition: (CONDITION_MAP[conditionKey] as any) || "USED",
          quantity: row["Количество"] ? Number(row["Количество"]) : 1,
          price: price ?? undefined,
          priceOnRequest: price === null,
          currency: (String(row["Валюта"] || "USD").toUpperCase() as any) || "USD",
          location: String(row["Местонахождение"] || "") || undefined,
          description: String(row["Описание"] || "") || undefined,
          status: (STATUS_MAP[statusKey] as any) || "IN_STOCK",
        },
        update: {
          title,
          categoryId,
          manufacturer: String(row["Производитель"] || "") || undefined,
          model: String(row["Модель"] || "") || undefined,
          year: row["Год"] ? Number(row["Год"]) : undefined,
          condition: (CONDITION_MAP[conditionKey] as any) || undefined,
          quantity: row["Количество"] ? Number(row["Количество"]) : undefined,
          price: price ?? undefined,
          priceOnRequest: price === null,
          currency: (String(row["Валюта"] || "").toUpperCase() as any) || undefined,
          location: String(row["Местонахождение"] || "") || undefined,
          description: String(row["Описание"] || "") || undefined,
          status: (STATUS_MAP[statusKey] as any) || undefined,
        },
      });

      successCount++;
    } catch (e: any) {
      errors.push({ row: rowNum, message: e.message || "Неизвестная ошибка" });
    }
  }

  return NextResponse.json({
    total: rows.length,
    successCount,
    errorCount: errors.length,
    errors,
  });
}
