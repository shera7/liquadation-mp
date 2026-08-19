import { prisma } from "@/lib/prisma";
import NewProductForm from "@/components/admin/NewProductForm";
export const dynamic = "force-dynamic";
export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="max-w-2xl">
      <h1 className="font-display font-800 text-2xl text-graphite mb-6">Новый товар</h1>
      <NewProductForm categories={categories} />
    </div>
  );
}
