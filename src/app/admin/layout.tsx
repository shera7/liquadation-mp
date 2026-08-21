import Link from "next/link";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import LogoutButton from "@/components/admin/LogoutButton";

const NAV = [
  { href: "/admin", label: "Обзор" },
  { href: "/admin/products", label: "Товары" },
  { href: "/admin/categories", label: "Категории" },
  { href: "/admin/requests", label: "Заявки" },
  { href: "/admin/import", label: "Импорт Excel" },
];

const FULL_ONLY_NAV = [
  { href: "/admin/settings", label: "Настройки" },
  { href: "/admin/nda", label: "NDA" },
  { href: "/admin/employees", label: "Сотрудники" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get("admin_session")?.value;
  const session = token ? await verifySessionToken(token) : null;

  return (
    <div className="min-h-screen bg-concrete flex">
      <aside className="w-56 shrink-0 bg-graphite text-steelLight min-h-screen p-5 flex flex-col">
        <div className="font-display font-800 text-white mb-8">АДМИН-ПАНЕЛЬ</div>
        <nav className="space-y-1 flex-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 rounded-sm text-sm hover:bg-white/10 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ))}
          {session?.role === "FULL" &&
            FULL_ONLY_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 rounded-sm text-sm hover:bg-white/10 hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ))}
        </nav>

        {session && (
          <div className="border-t border-white/10 pt-4 mt-4 text-xs">
            <div className="text-white">{session.name}</div>
            <div className="text-steel mb-3">
              {session.role === "FULL" ? "Полный доступ" : "Модератор"}
            </div>
            <LogoutButton />
          </div>
        )}

        <Link href="/" className="block mt-4 text-xs text-steel hover:text-white">
          ← На сайт
        </Link>
      </aside>
      <div className="flex-1 p-8">{children}</div>
    </div>
  );
}
