import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSessionToken } from "@/lib/auth";

const WINDOW_MINUTES = 10;
const MAX_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const recentFailed = await prisma.loginAttempt.count({
    where: {
      ip,
      success: false,
      createdAt: { gte: new Date(Date.now() - WINDOW_MINUTES * 60 * 1000) },
    },
  });

  if (recentFailed >= MAX_ATTEMPTS) {
    return NextResponse.json(
      { error: `Слишком много неудачных попыток входа. Повторите через ${WINDOW_MINUTES} минут.` },
      { status: 429 }
    );
  }

  if (!email || !password) {
    return NextResponse.json({ error: "Укажите email и пароль" }, { status: 400 });
  }

  const admin = await prisma.admin.findUnique({ where: { email } });
  const valid = admin ? await verifyPassword(password, admin.passwordHash) : false;

  await prisma.loginAttempt.create({ data: { ip, success: valid } });

  if (!admin || !valid) {
    return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });
  }

  const token = await createSessionToken({ sub: admin.id, name: admin.name, role: admin.role as any });

  const res = NextResponse.json({ ok: true, role: admin.role });
  res.cookies.set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return res;
}
