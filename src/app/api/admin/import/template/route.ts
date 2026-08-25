import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET() {
  const headers = [
    "ID", "Название", "Категория", "Подкатегория", "Производитель", "Модель", "Год",
    "Состояние", "Количество", "Цена", "Валюта", "Местонахождение", "Описание",
    "Статус", "Мощность", "Характеристики", "Старая цена", "Метка цены",
  ];

  const exampleRow = {
    "ID": "000123",
    "Название": "Токарный станок XYZ ABC-500",
    "Категория": "Оборудование",
    "Подкатегория": "Станки",
    "Производитель": "XYZ",
    "Модель": "ABC-500",
    "Год": 2018,
    "Состояние": "Б/У",
    "Количество": 2,
    "Цена": 12000,
    "Валюта": "USD",
    "Местонахождение": "Ташкент, склад №2",
    "Описание": "Токарный станок в рабочем состоянии, проходил плановое ТО.",
    "Статус": "В продаже",
    "Мощность": "15 кВт",
    "Характеристики": "Диаметр обработки: 500 мм; Вес: 1200 кг",
    "Старая цена": "",
    "Метка цены": "",
  };

  const worksheet = XLSX.utils.json_to_sheet([exampleRow], { header: headers });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Товары");

  const referenceRows = [
    { "Поле": "Статус", "Допустимые значения": "В продаже, Забронировано, Продано, Снято с продажи" },
    { "Поле": "Состояние", "Допустимые значения": "Новое, Б/У, Требует ремонта" },
    { "Поле": "Валюта", "Допустимые значения": "USD, UZS" },
    { "Поле": "Характеристики", "Допустимые значения": "формат: Ключ: значение; Ключ2: значение2" },
  ];
  const refSheet = XLSX.utils.json_to_sheet(referenceRows);
  XLSX.utils.book_append_sheet(workbook, refSheet, "Справочник");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="shablon-import-tovarov.xlsx"`,
    },
  });
}
