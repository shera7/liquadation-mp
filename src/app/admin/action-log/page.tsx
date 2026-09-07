import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ENTITY_LABELS: Record<string, string> = {
  Product: "Товары",
  Request: "Заявки",
  Settings: "Настройки",
  Employee: "Сотрудники",
};

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default async function AdminActionLogPage({
  searchParams,
}: {
  searchParams: { entityType?: string };
}) {
  const entityType = searchParams.entityType;

  const logs = await prisma.adminActionLog.findMany({
    where: entityType ? { entityType } : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="max-w-4xl">
      <h1 className="font-display font-800 text-2xl text-graphite mb-2">Журнал действий</h1>
      <p className="text-sm text-steel mb-6">
        Кто и когда вносил изменения в товары, заявки, настройки и сотрудников. Показаны последние 200 записей.
      </p>

      <div className="flex gap-2 mb-4">
        
          href="/admin/action-log"
          className={`text-xs px-3 py-1.5 rounded-full border ${
            !entityType ? "bg-amber border-amber text-graphite" : "border-line text-steel hover:border-amber"
          }`}
        >
          Все
        </a>
        {Object.entries(ENTITY_LABELS).map(([value, label]) => (
          
            key={value}
            href={`/admin/action-log?entityType=${value}`}
            className={`text-xs px-3 py-1.5 rounded-full border ${
              entityType === value ? "bg-amber border-amber text-graphite" : "border-line text-steel hover:border-amber"
            }`}
          >
            {label}
          </a>
        ))}
      </div>

      <div className="bg-white border border-line rounded-sm divide-y divide-line">
        {logs.length === 0 && (
          <div className="px-4 py-6 text-sm text-steel">Записей пока нет.</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="px-4 py-3 flex items-start gap-4">
            <div className="text-xs font-mono text-steel whitespace-nowrap pt-0.5">
              {formatDate(log.createdAt)}
            </div>
            <div className="flex-1">
              <div className="text-sm text-graphite">{log.description}</div>
              <div className="text-xs text-steel mt-0.5">
                {log.adminName} · {ENTITY_LABELS[log.entityType] ?? log.entityType}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
