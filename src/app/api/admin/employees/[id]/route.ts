import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { logAdminAction } from "@/lib/auditLog";

interface Params {
  params: { id: string };
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const body = await req.json();
  const data: any = {};

  if (body.role && ["FULL", "MODERATOR"].includes(body.role)) data.role = body.role;
  if (body.name) data.name = body.name;
  if (body.password) {
    if (body.password.length < 8) {
      return NextResponse.json({ error: "Пароль должен быть не короче 8 символов" }, { status: 400 });
    }
    data.passwordHash = await hashPassword(body.password);
  }

  try {
    const admin = await prisma.admin.update({
      where: { id: params.id },
      data,
      select: { id: true, name: true, email: true, role: true },
    });
    await logAdminAction({
      action: "employee.update",
      entityType: "Employee",
      entityId: admin.id,
      description: `Изменён сотрудник «${admin.name}» (${admin.email})`,
      metadata: { changedFields: { role: body.role, name: body.name, passwordChanged: Boolean(body.password) } },
    });
    return NextResponse.json(admin);
  } catch {
    return NextResponse.json({ error: "Не удалось обновить сотрудника" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const remainingFull = await prisma.admin.count({
      where: { role: "FULL", NOT: { id: params.id } },
    });
    const target = await prisma.admin.findUnique({ where: { id: params.id } });

    if (target?.role === "FULL" && remainingFull === 0) {
      return NextResponse.json(
        { error: "Нельзя удалить последнего администратора с полным доступом" },
        { status: 400 }
      );
    }

    await prisma.admin.delete({ where: { id: params.id } });
    if (target) {
      await logAdminAction({
        action: "employee.delete",
        entityType: "Employee",
        entityId: params.id,
        description: `Удалён сотрудник «${target.name}» (${target.email})`,
      });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Не удалось удалить сотрудника" }, { status: 400 });
  }
}
