import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { REQUEST_STATUS_LABELS, parseOfferedPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const ACTIVE_STATUSES = ["NEW", "IN_PROGRESS", "CONTACTED", "NEGOTIATION", "RESERVED"];

function extractSlugFromUrl(input: string): string | null {
  const match = input.match(/\/product\/([a-z0-9-]+)/i);
  return match ? match[1] : null;
}

export default async function RequestsByProductPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q?.trim();
  let product = null;

  if (q) {
    const slugFromUrl = extractSlugFromUrl(q);
    product = await prisma.product.findFirst({
      where: {
        OR: [{ id: q }, { slug: slugFromUrl ?? q }, { inventoryNumber: q }],
      },
      include: { category: true },
    });
  }

  const requests = product
    ? await prisma.request.findMany({
        where: { productId: product.id, status: { in: ACTIVE_STATUSES as any } },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const ranked = requests
    .map((r) => ({ ...r, offeredValue: parseOfferedPrice(r.desiredPrice) }))
    .sort((a, b) => (b.offeredValue ?? -1) - (a.offeredValue ?? -1));

  return (
    <div className="max-w-3xl">
      <h1 className="font-display font-800 text-2xl text-graphite mb-6">Заявки по товару</h1>

      <form className="bg-white border border-line rounded-sm p-4 mb-6 flex gap-2">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="ID товара, артикул, slug или ссылка на товар..."
          className="flex-1 border border-line rounded-sm px-3 py-2 text-sm"
        />
        <button type="submit" className="bg-amber text-graphite font-semibold px-5 py-2 rounded-sm text-sm hover:bg-amber-dark">
          Найти
        </button>
      </form>

      {q && !product && (
        <div className="bg-white border border-line rounded-sm p-6 text-center text-steel text-sm">Товар не найден</div>
      )}

      {product && (
        <>
          <div className="bg-white border border-line rounded-sm p-4 mb-4 flex items-center justify-between">
            <div>
              <div className="font-display font-700 text-graphite">{product.title}</div>
              <div className="text-xs text-steel font-mono">
                №{product.inventoryNumber} · {product.category.name}
              </div>
            </div>
            <Link href={`/product/${product.slug}`} target="_blank" className="text-xs text-amber-dark hover:underline">
              Открыть на сайте →
            </Link>
          </div>

          <div className="bg-white border border-line rounded-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-concrete text-steel text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">№</th>
                  <th className="px-4 py-3 font-medium">Клиент</th>
                  <th className="px-4 py-3 font-medium">Предложенная цена</th>
                  <th className="px-4 py-3 font-medium">Количество</th>
                  <th className="px-4 py-3 font-medium">Статус</th>
                  <th className="px-4 py-3 font-medium">Дата</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((r, i) => (
                  <tr key={r.id} className="border-t border-line hover:bg-concrete/40">
                    <td className="px-4 py-3">
                      <Link href={`/admin/requests/${r.id}`} className="font-mono text-xs text-amber-dark hover:underline">
                        {r.requestNumber ?? r.id.slice(-6)}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-graphite">{r.name}</div>
                      <div className="text-xs text-steel">{r.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-mono-tabular font-semibold text-graphite">{r.desiredPrice || "—"}</div>
                      {i === 0 && r.offeredValue !== null && (
                        <span className="text-[10px] font-bold uppercase tracking-wide text-amber-dark bg-amber/10 px-1.5 py-0.5 rounded-sm">
                          Лучшее предложение
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-steel">{r.quantity ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] bg-concrete px-2 py-1 rounded-sm">{REQUEST_STATUS_LABELS[r.status]}</span>
                    </td>
                    <td className="px-4 py-3 text-steel whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString("ru-RU")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {ranked.length === 0 && (
              <div className="p-8 text-center text-steel text-sm">Активных заявок по этому товару нет</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
