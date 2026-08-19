import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-graphite text-concrete sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="font-display font-800 text-lg tracking-tight">
            EQUIP<span className="text-amber">.PRO</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-steelLight">
          <Link href="/catalog" className="hover:text-white transition-colors">
            Каталог
          </Link>
          <Link href="/#how-it-works" className="hover:text-white transition-colors">
            Как купить
          </Link>
          <Link href="/#contacts" className="hover:text-white transition-colors">
            Контакты
          </Link>
        </nav>

        <Link
          href="/#quick-request"
          className="shrink-0 inline-flex items-center rounded-sm bg-amber px-4 py-2 text-sm font-semibold text-graphite hover:bg-amber-dark transition-colors"
        >
          Оставить заявку
        </Link>
      </div>
    </header>
  );
}
