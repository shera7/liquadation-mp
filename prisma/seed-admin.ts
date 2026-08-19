import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Администратор";

  if (!email || !password) {
    throw new Error("Задайте ADMIN_EMAIL и ADMIN_PASSWORD в .env перед запуском");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.admin.upsert({
    where: { email },
    update: { passwordHash, name, role: "FULL" },
    create: { email, passwordHash, name, role: "FULL" },
  });

  console.log(`Администратор с полным доступом готов: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
