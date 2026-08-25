import { getSiteSettings } from "@/lib/settings";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionToken } from "@/lib/auth";
import TelegramRecipientsManager from "@/components/admin/TelegramRecipientsManager";
import { prisma } from "@/lib/prisma";
import SettingsForm from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const token = cookies().get("admin_session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (session?.role !== "FULL") redirect("/admin");

  const settings = await getSiteSettings();
  const recipients = await prisma.telegramRecipient.findMany({ orderBy: { createdAt: "asc" } });
  
  return (
    <div className="max-w-xl">
      <h1 className="font-display font-800 text-2xl text-graphite mb-6">Настройки сайта</h1>
      <SettingsForm settings={settings as any} />
      <div className="mt-8 bg-white border border-line rounded-sm p-6">
        <h2 className="font-display font-700 text-graphite mb-1">Получатели уведомлений</h2>
        <p className="text-xs text-steel mb-4">
          Все активные получатели получат уведомление о каждой новой заявке. Можно добавить сколько угодно менеджеров.
        </p>
        <TelegramRecipientsManager initialRecipients={recipients} />
      </div>
    </div>
  );
}
