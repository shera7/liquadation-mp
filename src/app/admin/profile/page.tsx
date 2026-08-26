import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TelegramLinkCard from "@/components/admin/TelegramLinkCard";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const token = cookies().get("admin_session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) redirect("/login");

  const admin = await prisma.admin.findUnique({
    where: { id: session.sub },
    select: { name: true, email: true, telegramChatId: true },
  });
  if (!admin) redirect("/login");

  return (
    <div className="max-w-xl">
      <h1 className="font-display font-800 text-2xl text-graphite mb-6">Мой профиль</h1>
      <div className="bg-white border border-line rounded-sm p-6 mb-4">
        <div className="text-sm text-graphite font-medium">{admin.name}</div>
        <div className="text-xs text-steel">{admin.email}</div>
      </div>
      <TelegramLinkCard initiallyLinked={Boolean(admin.telegramChatId)} />
    </div>
  );
}
