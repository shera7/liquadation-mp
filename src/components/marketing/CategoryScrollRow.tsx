import Link from "next/link";

interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
}

export default function CategoryScrollRow({ categories }: { categories: CategoryDTO[] }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
      {categories.map((c) => (
        <Link
          key={c.id}
          href={`/catalog?category=${c.slug}`}
          className="min-w-[180px] group bg-white border border-line rounded-sm p-5 hover:border-amber transition-colors"
        >
          <div className="text-xs font-mono text-steel mb-2">{c._count.products} позиций</div>
          <div className="font-display font-700 text-graphite group-hover:text-amber-dark transition-colors">
            {c.name}
          </div>
        </Link>
      ))}
    </div>
  );
}
