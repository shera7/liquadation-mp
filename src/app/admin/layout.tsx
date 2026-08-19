import Link from "next/link";

// ВАЖНО: на Фазе 1 админка не защищена полноценной авторизацией с ролями (раздел 24 ТЗ).
// Перед продакшн-запуском обязательно обернуть эту секцию в middleware.ts с проверкой
// авторизации (например, NextAuth + роли Администратор/Менеджер/Контент-менеджер).
// Сейчас доступ можно временно ограничить на уровне сервера (VPN/Basic Auth) —
// см. README.md, раздел "Безопасность до подключения ролей".

const NAV = [
  { href: "/admin", label: "Обзор" },
  { href: "/admin/products", label: "Товары" },
  { href: "/admin/categories", label: "Категории" },
  { href: "/admin/requests", label: "Заявки" },
  { href: "/admin/import", label: "Импорт Excel" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-concrete flex">
      <aside className="w-56 shrink-0 bg-graphite text-steelLight min-h-screen p-5">
        <div className="font-display font-800 text-white mb-8">АДМИН-ПАНЕЛЬ</div>
        <nav className="space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 rounded-sm text-sm hover:bg-white/10 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link href="/" className="block mt-10 text-xs text-steel hover:text-white">
          ← На сайт
        </Link>
      </aside>
      <div className="flex-1 p-8">{children}</div>
    </div>
  );
}
