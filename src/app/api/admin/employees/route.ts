import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function GET() {
  const employees = await prisma.admin.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  return NextResponse.json(employees);
}

export async function POST(req: NextRequest) {
  const { name, email, password, role } = await req.json();

  if (!name || !email || !password || !["FULL", "MODERATOR"].includes(role)) {
    return NextResponse.json({ error: "Заполните все поля корректно" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Пароль должен быть не короче 8 символов" }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);

  try {
    const admin = await prisma.admin.create({
      data: { name, email, passwordHash, role },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    return NextResponse.json(admin, { status: 201 });
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json({ error: "Сотрудник с таким email уже существует" }, { status: 409 });
    }
    return NextResponse.json({ error: "Не удалось создать сотрудника" }, { status: 500 });
  }
}
