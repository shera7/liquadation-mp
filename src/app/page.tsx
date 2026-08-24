import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getEffectiveUsdRate } from "@/lib/exchangeRate";
import ProductCard from "@/components/ProductCard";
import QuickRequestForm from "@/components/QuickRequestForm";
import HeroSearchBar from "@/components/HeroSearchBar";

export const dynamic = "force-dynamic";

const STEPS = [
  {
    title: "Выбор позиции",
    desc: "Находите товар в каталоге или оставляете общую заявку",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C8842A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
  },
  {
    title: "Заявка",
    desc: "Заполняете форму — заявка сразу попадает к менеджеру",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C8842A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
        <path d="M10 9H8" />
      </svg>
    ),
  },
  {
    title: "Переговоры",
    desc: "Менеджер связывается с вами, уточняет детали и условия",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C8842A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      </svg>
    ),
  },
  {
    title: "Сделка",
    desc: "Согласовываете цену, оформляете и забираете имущество",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C8842A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.801 10A10 10 0 1 1 17 3.335" />
        <path d="m9 11 3 3L22 4" />
      </svg>
    ),
  },
];

export default async function HomePage() {
  const [categories, activeCounts, newest, { rate: usdToUzsRate }] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { sortOrder: "asc" },
      include: { children: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.product.groupBy({
      by: ["categoryId"],
      where: { status: { not: "WITHDRAWN" } },
      _count: true,
    }),
    prisma.product.findMany({
      where: { status: "IN_STOCK" },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { images: true, category: true },
    }),
    getEffectiveUsdRate(),
  ]);

  const countMap = new Map(activeCounts.map((c) => [c.categoryId, c._count]));

  function categoryActiveCount(cat: { id: string; children: { id: string }[] }) {
    const own = countMap.get(cat.id) ?? 0;
    const childrenSum = cat.children.reduce((sum, ch) => sum + (countMap.get(ch.id) ?? 0), 0);
    return own + childrenSum;
  }

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
            <div className="mb-6">
              <HeroSearchBar />
            </div>
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
                  <div className="text-2xl font-display font-700">{categoryActiveCount(c)}</div>
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
              <div className="text-xs font-mono text-steel mb-2">{categoryActiveCount(c)} позиций</div>
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
              <ProductCard key={p.id} product={p} usdToUzsRate={usdToUzsRate} />
            ))}
          </div>
        </section>
      )}

      {/* Как проходит покупка */}
      <section id="how-it-works" className="bg-white border-y border-line">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <span className="font-mono text-xs tracking-widest text-amber-dark">ПРОЦЕСС</span>
          <h2 className="font-display font-800 text-3xl text-graphite mt-2 mb-12">
            Как проходит покупка
          </h2>

          <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10">
            <div className="hidden lg:block absolute top-7 left-0 right-0 h-px bg-line" />

            {STEPS.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="relative z-10 w-14 h-14 rounded-full bg-white border-2 border-amber flex items-center justify-center mb-5">
                  {step.icon}
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-graphite text-white text-[10px] font-mono flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <div className="font-display font-700 text-graphite text-lg mb-1.5">{step.title}</div>
                <div className="text-sm text-steel leading-relaxed">{step.desc}</div>
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
