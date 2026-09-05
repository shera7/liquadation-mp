import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import MarketingBlockForm from "@/components/admin/MarketingBlockForm";
import MarketingSlidesManager from "@/components/admin/MarketingSlidesManager";

export const dynamic = "force-dynamic";

const SLIDE_TYPES = ["HERO_CAROUSEL", "MINI_BANNER"];

export default async function EditMarketingBlockPage({ params }: { params: { id: string } }) {
  const block = await prisma.marketingBlock.findUnique({
    where: { id: params.id },
    include: { slides: { orderBy: { sortOrder: "asc" } } },
  });
  if (!block) notFound();

  const categories =
    block.type === "CATEGORY_CAROUSEL"
      ? await prisma.category.findMany({ where: { parentId: null }, orderBy: { sortOrder: "asc" } })
      : [];

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="font-display font-800 text-2xl text-graphite">Настройка блока</h1>

      <MarketingBlockForm block={block as any} categories={categories} />

      {SLIDE_TYPES.includes(block.type) && (
        <div>
          <h2 className="font-display font-700 text-lg text-graphite mb-3">Слайды</h2>
          <MarketingSlidesManager blockId={block.id} initialSlides={block.slides as any} />
        </div>
      )}
    </div>
  );
}
