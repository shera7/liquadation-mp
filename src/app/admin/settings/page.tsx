import { getSiteSettings } from "@/lib/settings";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionToken } from "@/lib/auth";
import SettingsForm from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const token = cookies().get("admin_session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (session?.role !== "FULL") redirect("/admin");

  const settings = await getSiteSettings();

  // Decimal (Prisma) нельзя напрямую передать в клиентский компонент —
  // превращаем в обычное число здесь, на сервере.
  const settingsForForm = {
    ...settings,
    usdToUzsRate: settings.usdToUzsRate !== null && settings.usdToUzsRate !== undefined ? Number(settings.usdToUzsRate) : null,
    ndaMinPriceUsd: settings.ndaMinPriceUsd !== null && settings.ndaMinPriceUsd !== undefined ? Number(settings.ndaMinPriceUsd) : null,
  };

  return (
    <div className="max-w-xl">
      <h1 className="font-display font-800 text-2xl text-graphite mb-6">Настройки сайта</h1>
      <SettingsForm settings={settingsForForm as any} />
    </div>
  );
}
