import { prisma } from "@/lib/prisma";
import MarketingBlocksList from "@/components/admin/MarketingBlocksList";

export const dynamic = "force-dynamic";

export default async function AdminMarketingPage() {
  const blocks = await prisma.marketingBlock.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { slides: true } } },
  });

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display font-800 text-2xl text-graphite">Маркетинг</h1>
      </div>
      <p className="text-sm text-steel mb-6">
        Блоки главной страницы: карусель-баннер, мини-баннеры, подборки товаров и категорий.
        Порядок блоков в списке — это порядок отображения на сайте.
      </p>
      <MarketingBlocksList initialBlocks={blocks as any} />
    </div>
  );
}
