import type { ResolvedBlock } from "@/lib/marketing";
import { HeroCarousel, MiniBannerRow } from "./BannerCarousel";
import ProductScrollRow from "./ProductScrollRow";
import CategoryScrollRow from "./CategoryScrollRow";

const SECTION_TITLES: Partial<Record<ResolvedBlock["type"], string>> = {
  NEWEST_PRODUCTS: "Новые поступления",
  POPULAR_PRODUCTS: "Популярные позиции",
  DISCOUNTED_PRODUCTS: "Специальные цены",
  CATEGORY_CAROUSEL: "Категории имущества",
};

export default function MarketingBlockRenderer({
  block,
  usdToUzsRate,
}: {
  block: ResolvedBlock;
  usdToUzsRate?: number | null;
}) {
  const heading = block.title || SECTION_TITLES[block.type];

  switch (block.type) {
    case "HERO_CAROUSEL":
      return (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10">
          <HeroCarousel slides={block.slides} />
        </section>
      );

    case "MINI_BANNER":
      return (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <MiniBannerRow slides={block.slides} />
        </section>
      );

    case "NEWEST_PRODUCTS":
    case "POPULAR_PRODUCTS":
    case "DISCOUNTED_PRODUCTS":
      return (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          {heading && (
            <h2 className="font-display font-700 text-2xl text-graphite mb-6">{heading}</h2>
          )}
          <ProductScrollRow products={block.products} usdToUzsRate={usdToUzsRate} />
        </section>
      );

    case "CATEGORY_CAROUSEL":
      return (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          {heading && (
            <h2 className="font-display font-700 text-2xl text-graphite mb-6">{heading}</h2>
          )}
          <CategoryScrollRow categories={block.categories} />
        </section>
      );

    case "TEXT_HTML":
      return (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          {heading && (
            <h2 className="font-display font-700 text-2xl text-graphite mb-6">{heading}</h2>
          )}
          {/* Контент задаётся администратором в панели управления */}
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: block.html }} />
        </section>
      );

    default:
      return null;
  }
}
