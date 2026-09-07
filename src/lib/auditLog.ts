import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getAdminSession() {
  const token = cookies().get("admin_session")?.value;
  return token ? await verifySessionToken(token) : null;
}

interface LogParams {
  action: string;
  entityType: string;
  entityId?: string;
  description: string;
  metadata?: Record<string, unknown>;
}

/**
 * Записывает действие администратора в журнал. Не прерывает основной
 * запрос, если запись лога по какой-то причине не удалась.
 */
export async function logAdminAction(params: LogParams) {
  try {
    const session = await getAdminSession();
    if (!session) return;

    await prisma.adminActionLog.create({
      data: {
        adminId: session.sub,
        adminName: session.name,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        description: params.description,
        metadata: params.metadata as any,
      },
    });
  } catch (e) {
    console.error("[logAdminAction] не удалось записать в журнал:", e);
  }
}
