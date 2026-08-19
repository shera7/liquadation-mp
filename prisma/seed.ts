import { PrismaClient } from "@prisma/client";
import slugify from "slugify";

const prisma = new PrismaClient();

async function main() {
  const equipment = await prisma.category.upsert({
    where: { slug: "oborudovanie" },
    update: {},
    create: { name: "Оборудование", slug: "oborudovanie", sortOrder: 1 },
  });

  const stanki = await prisma.category.upsert({
    where: { slug: "stanki" },
    update: {},
    create: {
      name: "Станки",
      slug: "stanki",
      parentId: equipment.id,
      sortOrder: 1,
    },
  });

  const parts = await prisma.category.upsert({
    where: { slug: "zapchasti" },
    update: {},
    create: { name: "Запчасти", slug: "zapchasti", sortOrder: 2 },
  });

  const materials = await prisma.category.upsert({
    where: { slug: "materialy" },
    update: {},
    create: { name: "Материалы", slug: "materialy", sortOrder: 3 },
  });

  const products = [
    {
      title: "Токарный станок XYZ ABC-500",
      inventoryNumber: "000123",
      categoryId: stanki.id,
      manufacturer: "XYZ",
      model: "ABC-500",
      year: 2018,
      power: "15 кВт",
      condition: "USED" as const,
      quantity: 2,
      unit: "шт",
      price: 12000,
      location: "Ташкент, склад №2",
      description:
        "Токарный станок в рабочем состоянии, проходил плановое ТО. Подходит для металлообработки средней серии.",
      specs: { "Диаметр обработки": "500 мм", "Вес": "1200 кг" },
    },
    {
      title: "Компрессор промышленный 500л",
      inventoryNumber: "000124",
      categoryId: equipment.id,
      manufacturer: "AtlasCopco",
      model: "GA55",
      year: 2020,
      power: "55 кВт",
      condition: "USED" as const,
      quantity: 1,
      unit: "шт",
      price: null,
      priceOnRequest: true,
      location: "Ташкент, склад №1",
      description: "Промышленный винтовой компрессор, объём ресивера 500 литров.",
      specs: { "Давление": "8 бар" },
    },
    {
      title: "Кабель силовой ВВГ 3х2.5",
      inventoryNumber: "000201",
      categoryId: materials.id,
      condition: "NEW" as const,
      quantity: 850,
      unit: "м",
      price: 1.8,
      location: "Ташкент, склад №3",
      description: "Новый силовой кабель на бухтах, остаток после демонтажа объекта.",
    },
    {
      title: "Гидравлический насос промышленный",
      inventoryNumber: "000305",
      categoryId: parts.id,
      manufacturer: "Bosch Rexroth",
      condition: "USED" as const,
      quantity: 4,
      unit: "шт",
      price: 450,
      location: "Ташкент, склад №2",
      description: "Гидравлические насосы, снятые с производственной линии, в рабочем состоянии.",
    },
  ];

  for (const p of products) {
    const slug = `${slugify(p.title, { lower: true, strict: true })}-${p.inventoryNumber}`;
    await prisma.product.upsert({
      where: { inventoryNumber: p.inventoryNumber },
      update: {},
      create: { ...p, slug },
    });
  }

  console.log("Seed завершён.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
