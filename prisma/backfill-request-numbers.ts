import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const requests = await prisma.request.findMany({
    where: { requestNumber: null },
    orderBy: { createdAt: "asc" },
  });

  for (const r of requests) {
    const year = r.createdAt.getFullYear();
    const requestNumber = `REQ-${year}-${String(r.seq).padStart(6, "0")}`;
    await prisma.request.update({ where: { id: r.id }, data: { requestNumber } });
  }

  console.log(`Обновлено заявок: ${requests.length}`);
}

main().finally(() => prisma.$disconnect());
