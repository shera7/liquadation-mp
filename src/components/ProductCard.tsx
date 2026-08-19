import Link from "next/link";
import Image from "next/image";
import { formatPrice, STATUS_LABELS, CONDITION_LABELS } from "@/lib/utils";

interface ProductCardProps {
  product: {
    id: string;
    slug: string;
    title: string;
    inventoryNumber: string;
    price: number | string | null;
    currency: "USD" | "UZS";
    priceOnRequest: boolean;
    status: string;
    condition: string;
    location: string | null;
    images: { url: string }[];
    category: { name: string; slug: string };
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const statusInfo = STATUS_LABELS[product.status] ?? STATUS_LABELS.IN_STOCK;
  const image = product.images[0]?.url;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block bg-white border border-line rounded-sm overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all"
    >
      <div className="tag-perforation" />
      <div className="relative aspect-[4/3] bg-concrete overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-steel text-sm">
            Нет фото
          </div>
        )}
        <span
          className={`absolute top-2 left-2 text-[11px] font-semibold px-2 py-1 rounded-sm ${statusInfo.className}`}
        >
          {statusInfo.label}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] uppercase tracking-wide text-steel">
            {product.category.name}
          </span>
          <span className="font-mono text-[11px] text-steel">
            №{product.inventoryNumber}
          </span>
        </div>

        <h3 className="font-display font-700 text-graphite leading-snug mb-2 line-clamp-2">
          {product.title}
        </h3>

        <div className="flex items-center justify-between">
          <span className="font-mono-tabular font-semibold text-lg text-graphite">
            {formatPrice(product.price, product.currency, product.priceOnRequest)}
          </span>
          <span className="text-xs text-steel">
            {CONDITION_LABELS[product.condition]}
          </span>
        </div>

        {product.location && (
          <div className="mt-2 text-xs text-steel">{product.location}</div>
        )}
      </div>
    </Link>
  );
}
