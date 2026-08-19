import { prisma } from "@/lib/prisma";
import RequestStatusSelect from "@/components/admin/RequestStatusSelect";

interface AdminRequestsPageProps {
  searchParams: { status?: string };
}

export default async function AdminRequestsPage({ searchParams }: AdminRequestsPageProps) {
  const requests = await prisma.request.findMany({
    where: searchParams.status ? { status: searchParams.status as any } : undefined,
    orderBy: { createdAt: "desc" },
    include: { product: { select: { title: true, slug: true } } },
    take: 100,
  });

  return (
    <div>
      <h1 className="font-display font-800 text-2xl text-graphite mb-6">Заявки</h1>

      <div className="bg-white border border-line rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-concrete text-steel text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Дата</th>
              <th className="px-4 py-3 font-medium">Клиент</th>
              <th className="px-4 py-3 font-medium">Телефон</th>
              <th className="px-4 py-3 font-medium">Товар</th>
              <th className="px-4 py-3 font-medium">Комментарий</th>
              <th className="px-4 py-3 font-medium">Статус</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-t border-line align-top">
                <td className="px-4 py-3 text-steel whitespace-nowrap">
                  {new Date(r.createdAt).toLocaleString("ru-RU")}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-graphite">{r.name}</div>
                  {r.company && <div className="text-xs text-steel">{r.company}</div>}
                </td>
                <td className="px-4 py-3 font-mono text-xs">{r.phone}</td>
                <td className="px-4 py-3 text-steel">
                  {r.product?.title ?? (
                    <span className="italic">
                      Общая заявка{r.interestedCategory ? ` · ${r.interestedCategory}` : ""}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-steel max-w-xs truncate">{r.comment}</td>
                <td className="px-4 py-3">
                  <RequestStatusSelect requestId={r.id} currentStatus={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {requests.length === 0 && (
          <div className="p-10 text-center text-steel text-sm">Заявок пока нет</div>
        )}
      </div>
    </div>
  );
}
