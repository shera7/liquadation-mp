import { formatPrice, CONDITION_LABELS } from "@/lib/utils";

type SeoProduct = {
  title: string;
  slug: string;
  description: string | null;
  manufacturer: string | null;
  model: string | null;
  year: number | null;
  condition: string;
  status: string;
  price: number | string | null;
  oldPrice: number | string | null;
  currency: "USD" | "UZS";
  priceOnRequest: boolean;
  quantity: number;
  location: string | null;
  inventoryNumber: string;
  images: { url: string }[];
  category: { name: string };
  updatedAt: Date;
  viewsCount?: number;
};

const SITE_NAME = "Актив.Каталог";

/**
 * Собирает SEO title/description/keywords автоматически из полей товара —
 * без ручного ввода со стороны администратора.
 */
export function buildProductSeo(p: SeoProduct) {
  const priceStr = formatPrice(p.price, p.currency, p.priceOnRequest);
  const conditionLabel = CONDITION_LABELS[p.condition] ?? "";

  const titleParts = [p.title];
  if (p.manufacturer) titleParts.push(p.manufacturer);
  if (p.model) titleParts.push(p.model);
  const title = `${titleParts.join(" ")} — ${priceStr} | ${SITE_NAME}`.slice(0, 70);

  const descBits: string[] = [];
  if (p.description) {
    descBits.push(p.description.replace(/\s+/g, " ").trim());
  } else {
    descBits.push(`Купить ${p.title.toLowerCase()} в категории «${p.category.name}».`);
  }
  descBits.push(
    [
      p.manufacturer && `производитель ${p.manufacturer}`,
      p.model && `модель ${p.model}`,
      p.year && `${p.year} г.`,
      conditionLabel && `состояние: ${conditionLabel.toLowerCase()}`,
      p.location && `наличие: ${p.location}`,
    ]
      .filter(Boolean)
      .join(", ")
  );
  descBits.push(`Цена: ${priceStr}.`);
  const description = descBits.join(" ").replace(/\s+/g, " ").trim().slice(0, 160);

  const keywords = [
    p.title,
    p.manufacturer,
    p.model,
    p.category.name,
    conditionLabel,
    "купить оборудование",
    "ликвидация имущества",
  ]
    .filter(Boolean)
    .join(", ");

  return { title, description, keywords };
}

const AVAILABILITY_MAP: Record<string, string> = {
  IN_STOCK: "https://schema.org/InStock",
  RESERVED: "https://schema.org/LimitedAvailability",
  SOLD: "https://schema.org/SoldOut",
  WITHDRAWN: "https://schema.org/Discontinued",
};

/**
 * JSON-LD (schema.org/Product) для карточки товара — помогает Google
 * показывать расширенные сниппеты (цена, наличие, изображение) в поиске.
 */
export function buildProductJsonLd(p: SeoProduct, baseUrl: string) {
  const url = `${baseUrl}/product/${p.slug}`;
  const priceValue =
    p.price === null || p.price === undefined ? undefined : Number(p.price);

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title,
    sku: p.inventoryNumber,
    description: p.description?.slice(0, 500) || p.title,
    image: p.images.map((img) => img.url),
    category: p.category.name,
    url,
    ...(p.manufacturer ? { brand: { "@type": "Brand", name: p.manufacturer } } : {}),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: p.currency,
      ...(priceValue !== undefined && !p.priceOnRequest ? { price: priceValue } : {}),
      availability: AVAILABILITY_MAP[p.status] ?? "https://schema.org/InStock",
      itemCondition:
        p.condition === "NEW"
          ? "https://schema.org/NewCondition"
          : "https://schema.org/UsedCondition",
    },
  };

  return jsonLd;
}

export function buildBreadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
