import Link from "next/link";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LogoutButton from "@/components/admin/LogoutButton";

const CATALOG_NAV = [
  { href: "/admin/products", label: "Товары" },
  { href: "/admin/categories", label: "Категории" },
  { href: "/admin/import", label: "Импорт Excel" },
];

const FULL_ONLY_NAV = [
  { href: "/admin/marketing", label: "Маркетинг" },
  { href: "/admin/settings", label: "Настройки" },
  { href: "/admin/nda", label: "NDA" },
  { href: "/admin/sla", label: "SLA" },
  { href: "/admin/employees", label: "Сотрудники" },
];

function NavSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 pt-4 pb-1.5 text-[10px] font-semibold tracking-widest text-steel/70 uppercase">
      {children}
    </div>
  );
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get("admin_session")?.value;
  const session = token ? await verifySessionToken(token) : null;

  const [newProductCount, newGeneralCount] = await Promise.all([
    prisma.request.count({ where: { type: "PRODUCT", status: "NEW" } }),
    prisma.request.count({ where: { type: "GENERAL", status: "NEW" } }),
  ]);

  return (
    <div className="min-h-screen bg-concrete flex">
      <aside className="w-60 shrink-0 bg-graphite text-steelLight min-h-screen p-4 flex flex-col">

        <nav className="flex-1">
          <Link href="/admin" className="block px-3 py-2 rounded-sm text-sm hover:bg-white/10 hover:text-white transition-colors">
            Дашборд
          </Link>
          <Link href="/admin/profile" className="block px-3 py-2 rounded-sm text-sm hover:bg-white/10 hover:text-white transition-colors">
            Мой профиль
          </Link>

          <NavSectionLabel>Каталог</NavSectionLabel>
          <div className="border-l border-white/10 ml-3">
            {CATALOG_NAV.map((item) => (
              <Link key={item.href} href={item.href} className="block px-3 py-2 rounded-sm text-sm hover:bg-white/10 hover:text-white transition-colors">
                {item.label}
              </Link>
            ))}
          </div>

          <NavSectionLabel>Заявки</NavSectionLabel>
          <div className="border-l border-white/10 ml-3">
            <Link href="/admin/requests" className="block px-3 py-2 rounded-sm text-sm hover:bg-white/10 hover:text-white transition-colors">
              Обзор SLA
            </Link>
            <Link href="/admin/requests/product" className="flex items-center justify-between px-3 py-2 rounded-sm text-sm hover:bg-white/10 hover:text-white transition-colors">
              <span>На товар</span>
              {newProductCount > 0 && <span className="bg-alert text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{newProductCount}</span>}
            </Link>
            <Link href="/admin/requests/general" className="flex items-center justify-between px-3 py-2 rounded-sm text-sm hover:bg-white/10 hover:text-white transition-colors">
              <span>Общие</span>
              {newGeneralCount > 0 && <span className="bg-alert text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{newGeneralCount}</span>}
            </Link>
            <Link href="/admin/requests/by-product" className="block px-3 py-2 rounded-sm text-sm hover:bg-white/10 hover:text-white transition-colors">
              По товару
            </Link>
          </div>

          {session?.role === "FULL" && (
            <>
              <NavSectionLabel>Управление</NavSectionLabel>
              <div className="border-l border-white/10 ml-3">
                {FULL_ONLY_NAV.map((item) => (
                  <Link key={item.href} href={item.href} className="block px-3 py-2 rounded-sm text-sm hover:bg-white/10 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                ))}
              </div>
            </>
          )}
        </nav>

        {session && (
          <div className="border-t border-white/10 pt-4 mt-4 px-3 text-xs">
            <div className="text-white">{session.name}</div>
            <div className="text-steel mb-3">{session.role === "FULL" ? "Полный доступ" : "Модератор"}</div>
            <LogoutButton />
          </div>
        )}

        <Link href="/" className="block mt-4 px-3 text-xs text-steel hover:text-white">
          ← На сайт
        </Link>
      </aside>
      <div className="flex-1 p-8">{children}</div>
    </div>
  );
}
