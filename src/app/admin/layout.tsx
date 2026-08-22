import Link from "next/link";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LogoutButton from "@/components/admin/LogoutButton";

const NAV = [
  { href: "/admin", label: "Обзор" },
  { href: "/admin/products", label: "Товары" },
  { href: "/admin/categories", label: "Категории" },
  { href: "/admin/import", label: "Импорт Excel" },
];

const FULL_ONLY_NAV = [
  { href: "/admin/settings", label: "Настройки" },
  { href: "/admin/nda", label: "NDA" },
  { href: "/admin/sla", label: "SLA" },
  { href: "/admin/employees", label: "Сотрудники" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get("admin_session")?.value;
  const session = token ? await verifySessionToken(token) : null;

  const [newProductCount, newGeneralCount] = await Promise.all([
    prisma.request.count({ where: { type: "PRODUCT", status: "NEW" } }),
    prisma.request.count({ where: { type: "GENERAL", status: "NEW" } }),
  ]);

  return (
    <div className="min-h-screen bg-concrete flex">
      <aside className="w-56 shrink-0 bg-graphite text-steelLight min-h-screen p-5 flex flex-col">
        <div className="font-display font-800 text-white mb-8">АДМИН-ПАНЕЛЬ</div>
        <nav className="space-y-1 flex-1">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="block px-3 py-2 rounded-sm text-sm hover:bg-white/10 hover:text-white transition-colors">
              {item.label}
            </Link>
          ))}

          <Link href="/admin/requests" className="block px-3 py-2 rounded-sm text-sm hover:bg-white/10 hover:text-white transition-colors">
            Заявки — обзор
          </Link>
          <Link href="/admin/requests/product" className="flex items-center justify-between px-3 py-2 rounded-sm text-sm hover:bg-white/10 hover:text-white transition-colors">
            <span>Заявки на товар</span>
            {newProductCount > 0 && (
              <span className="bg-alert text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{newProductCount}</span>
            )}
          </Link>
          <Link href="/admin/requests/general" className="flex items-center justify-between px-3 py-2 rounded-sm text-sm hover:bg-white/10 hover:text-white transition-colors">
            <span>Общие заявки</span>
            {newGeneralCount > 0 && (
              <span className="bg-alert text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{newGeneralCount}</span>
            )}
          </Link>

          {session?.role === "FULL" &&
            FULL_ONLY_NAV.map((item) => (
              <Link key={item.href} href={item.href} className="block px-3 py-2 rounded-sm text-sm hover:bg-white/10 hover:text-white transition-colors">
                {item.label}
              </Link>
            ))}
        </nav>

        {session && (
          <div className="border-t border-white/10 pt-4 mt-4 text-xs">
            <div className="text-white">{session.name}</div>
            <div className="text-steel mb-3">{session.role === "FULL" ? "Полный доступ" : "Модератор"}</div>
            <LogoutButton />
          </div>
        )}

        <Link href="/" className="block mt-4 text-xs text-steel hover:text-white">← На сайт</Link>
      </aside>
      <div className="flex-1 p-8">{children}</div>
    </div>
  );
}
