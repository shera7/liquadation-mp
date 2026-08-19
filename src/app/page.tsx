import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import QuickRequestForm from "@/components/QuickRequestForm";
export const dynamic = "force-dynamic";
export default async function HomePage() {
  const [categories, newest] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { products: true } } },
    }),
    prisma.product.findMany({
      where: { status: "IN_STOCK" },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { images: true, category: true },
    }),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-graphite text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center">
          <div>
            <span className="inline-block font-mono text-xs tracking-widest text-amber mb-4">
              РЕАЛИЗАЦИЯ ИМУЩЕСТВА · ПРЯМАЯ ПРОДАЖА
            </span>
            <h1 className="font-display font-800 text-4xl sm:text-5xl leading-[1.05] mb-6">
              Имущество и оборудование
              <br />
              по специальным ценам
            </h1>
            <p className="text-steelLight text-lg max-w-xl mb-8">
              Оборудование, материалы, запчасти и другие активы в наличии.
              Оставьте заявку — мы свяжемся с вами.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/catalog"
                className="bg-amber text-graphite font-semibold px-6 py-3 rounded-sm hover:bg-amber-dark transition-colors"
              >
                Смотреть каталог
              </Link>
              <Link
                href="#quick-request"
                className="border border-white/30 text-white font-semibold px-6 py-3 rounded-sm hover:bg-white/10 transition-colors"
              >
                Оставить заявку
              </Link>
            </div>
          </div>

          <div className="bg-graphite2 border border-white/10 rounded-sm p-6">
            <div className="font-mono text-xs text-steelLight mb-4">СВОДКА ПО КАТАЛОГУ</div>
            <div className="grid grid-cols-2 gap-4">
              {categories.map((c) => (
                <div key={c.id} className="border-l-2 border-amber pl-3">
                  <div className="text-2xl font-display font-700">{c._count.products}</div>
                  <div className="text-xs text-steelLight">{c.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Категории */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="font-display font-700 text-2xl text-graphite mb-6">Категории имущества</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/catalog?category=${c.slug}`}
              className="group bg-white border border-line rounded-sm p-5 hover:border-amber transition-colors"
            >
              <div className="text-xs font-mono text-steel mb-2">{c._count.products} позиций</div>
              <div className="font-display font-700 text-graphite group-hover:text-amber-dark transition-colors">
                {c.name}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Новые поступления */}
      {newest.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-700 text-2xl text-graphite">Новые поступления</h2>
            <Link href="/catalog" className="text-sm text-amber-dark font-medium hover:underline">
              Весь каталог →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {newest.map((p) => (
              // @ts-expect-error Decimal -> number сериализация из Prisma
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Как проходит покупка */}
      <section id="how-it-works" className="bg-white border-y border-line">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="font-display font-700 text-2xl text-graphite mb-8">Как проходит покупка</h2>
          <div className="grid sm:grid-cols-4 gap-6">
            {[
              ["01", "Выбор позиции", "Находите товар в каталоге или оставляете общую заявку"],
              ["02", "Заявка", "Заполняете форму — заявка сразу попадает к менеджеру"],
              ["03", "Переговоры", "Менеджер связывается с вами, уточняет детали и условия"],
              ["04", "Сделка", "Согласовываете цену, оформляете и забираете имущество"],
            ].map(([n, title, desc]) => (
              <div key={n}>
                <div className="font-mono text-amber-dark text-sm mb-2">{n}</div>
                <div className="font-display font-700 text-graphite mb-1">{title}</div>
                <div className="text-sm text-steel">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Быстрая заявка */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="font-display font-700 text-2xl text-graphite mb-2">
          Не нашли нужную позицию?
        </h2>
        <p className="text-steel mb-6">
          Оставьте общую заявку — опишите, что ищете, и менеджер подберёт подходящие варианты.
        </p>
        <QuickRequestForm />
      </section>
    </div>
  );
}
