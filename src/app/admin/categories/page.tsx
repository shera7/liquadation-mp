import { prisma } from "@/lib/prisma";
import CategoryManager from "@/components/admin/CategoryManager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { products: true } },
      children: {
        orderBy: { sortOrder: "asc" },
        include: { _count: { select: { products: true } } },
      },
    },
  });

  return (
    <div className="max-w-3xl">
      <h1 className="font-display font-800 text-2xl text-graphite mb-6">Категории</h1>
      <CategoryManager initialCategories={categories} />
    </div>
  );
}
