import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getEffectiveUsdRate } from "@/lib/exchangeRate";
import Link from "next/link";
import type { Metadata } from "next";
import { formatPrice, formatDualPrice, formatOldPrice, STATUS_LABELS, CONDITION_LABELS } from "@/lib/utils";
import RequestForm from "@/components/RequestForm";
import ProductGallery from "@/components/ProductGallery";
import StatusBadge from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: { id: string };
}

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      images: true,
      documents: true,
      category: { include: { parent: true } },
    },
  });
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProduct(params.id);
  if (!product) return {};

  const priceStr = formatPrice(product.price as any, product.currency, product.priceOnRequest);
  return {
    title: `${product.title} — ${priceStr} | Актив.Каталог`,
    description: product.description?.slice(0, 160) ?? product.title,
    openGraph: {
      title: product.title,
      description: product.description?.slice(0, 160) ?? undefined,
      images: product.images[0] ? [product.images[0].url] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.id);
  const { rate: usdToUzsRate, date: rateDate } = await getEffectiveUsdRate();
  if (!product) notFound();

  await prisma.product.update({
    where: { id: product.id },
    data: { viewsCount: { increment: 1 } },
  });

  const statusInfo = STATUS_LABELS[product.status];
  const specs = (product.specs as Record<string, string> | null) ?? {};
  const parentCategory = product.category.parent;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <nav className="text-xs text-steel mb-6 flex items-center gap-1.5 flex-wrap">
        <Link href="/catalog" className="hover:text-amber-dark">
          Каталог
        </Link>
        {parentCategory && (
          <>
            <span>/</span>
            <Link href={`/catalog?category=${parentCategory.slug}`} className="hover:text-amber-dark">
              {parentCategory.name}
            </Link>
          </>
        )}
        <span>/</span>
        <Link href={`/catalog?category=${product.category.slug}`} className="hover:text-amber-dark">
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-graphite">{product.title}</span>
      </nav>

      <div className="grid lg:grid-cols-[1.3fr_1fr] gap-10">
        <div>
          <ProductGallery images={product.images} title={product.title} />

          {product.description && (
            <div className="mt-8">
              <h2 className="font-display font-700 text-lg text-graphite mb-2">Описание</h2>
              <p className="text-steel leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          )}

          <div className="mt-8">
            <h2 className="font-display font-700 text-lg text-graphite mb-3">Характеристики</h2>
            <dl className="grid grid-cols-2 gap-y-2 text-sm border border-line rounded-sm bg-white p-4">
              {product.manufacturer && (
                <>
                  <dt className="text-steel">Производитель</dt>
                  <dd className="text-graphite font-medium">{product.manufacturer}</dd>
                </>
              )}
              {product.model && (
                <>
                  <dt className="text-steel">Модель</dt>
                  <dd className="text-graphite font-medium">{product.model}</dd>
                </>
              )}
              {product.year && (
                <>
                  <dt className="text-steel">Год выпуска</dt>
                  <dd className="text-graphite font-medium">{product.year}</dd>
                </>
              )}
              {product.power && (
                <>
                  <dt className="text-steel">Мощность</dt>
                  <dd className="text-graphite font-medium">{product.power}</dd>
                </>
              )}
              {Object.entries(specs).map(([k, v]) => (
                <>
                  <dt key={k} className="text-steel">{k}</dt>
                  <dd key={`${k}-v`} className="text-graphite font-medium">{v}</dd>
                </>
              ))}
            </dl>
          </div>

          {product.documents.length > 0 && (
            <div className="mt-8">
              <h2 className="font-display font-700 text-lg text-graphite mb-3">Документы</h2>
              <ul className="space-y-2">
                {product.documents.map((doc) => (
                  <li key={doc.id}>
                    
                      <a href={doc.url}
                      target="_blank"
                      className="text-amber-dark text-sm hover:underline"
                    >
                      📄 {doc.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <div className="border border-line rounded-sm bg-white p-6 sticky top-24">
            <div className="tag-perforation -mx-6 -mt-6 mb-4" />
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs text-steel">№{product.inventoryNumber}</span>
               <StatusBadge status={product.status} />
            </div>

            <h1 className="font-display font-800 text-2xl text-graphite mb-3 leading-tight">
              {product.title}
            </h1>

            {product.oldPrice && (
              <div className="text-sm text-steel line-through mb-0.5">
                {formatOldPrice(product.oldPrice as any, product.currency)}
              </div>
            )}
            <div className="font-mono-tabular font-800 text-3xl text-graphite mb-1">
              {formatDualPrice(product.price as any, product.currency, product.priceOnRequest, usdToUzsRate).primary}
            </div>
            {formatDualPrice(product.price as any, product.currency, product.priceOnRequest, usdToUzsRate).secondary && (
              <div className="font-mono-tabular text-sm text-steel mb-1">
                {formatDualPrice(product.price as any, product.currency, product.priceOnRequest, usdToUzsRate).secondary}
                {rateDate && <span className="text-[11px] text-steel/70"> · курс ЦБ на {rateDate}</span>}
              </div>
            )}
            {product.priceLabel && (
              <div className="inline-block text-[11px] font-bold uppercase tracking-wide text-amber-dark bg-amber/10 px-2 py-1 rounded-sm mb-4">
                {product.priceLabel}
              </div>
            )}

            <dl className="text-sm space-y-1.5 mb-6 text-steel">
              <div className="flex justify-between">
                <dt>Состояние</dt>
                <dd className="text-graphite">{CONDITION_LABELS[product.condition]}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Количество</dt>
                <dd className="text-graphite">
                  {product.quantity} {product.unit}
                </dd>
              </div>
              {product.location && (
                <div className="flex justify-between">
                  <dt>Местонахождение</dt>
                  <dd className="text-graphite">{product.location}</dd>
                </div>
              )}
            </dl>

          {product.status === "SOLD" || product.status === "WITHDRAWN" ? (
              <div className="border border-line rounded-sm bg-concrete p-4 text-center text-sm text-steel">
                Этот товар уже продан. Посмотрите похожие позиции в{" "}
                <Link href={`/catalog?category=${product.category.slug}`} className="text-amber-dark hover:underline">
                  этой категории
                </Link>
                .
              </div>
            ) : (
              <div className="space-y-2">
                <RequestForm productId={product.id} productTitle={product.title} mode="request" />
                {product.priceOnRequest && (
                  <RequestForm productId={product.id} productTitle={product.title} mode="price" />
                )}
                //<RequestForm productId={product.id} productTitle={product.title} mode="question" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
