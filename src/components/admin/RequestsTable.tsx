"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { REQUEST_STATUS_LABELS } from "@/lib/utils";
import { formatDuration } from "@/lib/sla";

const SLA_DOT: Record<string, string> = { ok: "#3E7A4C", warning: "#E8A33D", breached: "#C0392B", none: "#B9BCC2" };
const SLA_LABEL: Record<string, string> = { ok: "В норме", warning: "Под угрозой", breached: "Просрочен", none: "—" };

interface RequestRow {
  id: string;
  requestNumber: string | null;
  name: string;
  phone: string;
  status: string;
  createdAt: string | Date;
  product: { title: string; slug: string } | null;
  interestedCategory: string | null;
  assigneeName: string | null;
  desiredPrice: string | null;
  slaState: "ok" | "warning" | "breached" | "none";
  slaRemainingMs: number | null;
}

export default function RequestsTable({
  requests,
  admins,
  basePath,
}: {
  requests: RequestRow[];
  admins: { id: string; name: string }[];
  basePath: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input
          defaultValue={searchParams.get("q") ?? ""}
          onKeyDown={(e) => e.key === "Enter" && updateParam("q", (e.target as HTMLInputElement).value)}
          placeholder="Поиск по номеру, имени, телефону..."
          className="border border-line rounded-sm px-3 py-1.5 text-sm w-64"
        />
        <select
          defaultValue={searchParams.get("status") ?? ""}
          onChange={(e) => updateParam("status", e.target.value || null)}
          className="border border-line rounded-sm px-2 py-1.5 text-sm"
        >
          <option value="">Все статусы</option>
          {Object.entries(REQUEST_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          defaultValue={searchParams.get("assignee") ?? ""}
          onChange={(e) => updateParam("assignee", e.target.value || null)}
          className="border border-line rounded-sm px-2 py-1.5 text-sm"
        >
          <option value="">Все ответственные</option>
          {admins.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        <button
          onClick={() => updateParam("sla", searchParams.get("sla") === "breached" ? null : "breached")}
          className={`text-xs px-3 py-1.5 rounded-sm border ${
            searchParams.get("sla") === "breached" ? "bg-alert text-white border-alert" : "border-line text-steel hover:border-alert"
          }`}
        >
          Только просроченные
        </button>
        <select
          defaultValue={searchParams.get("sort") ?? "newest"}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="border border-line rounded-sm px-2 py-1.5 text-sm ml-auto"
        >
          <option value="newest">Сначала новые</option>
          <option value="oldest">Сначала старые</option>
        </select>
      </div>

      <div className="bg-white border border-line rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-concrete text-steel text-left">
            <tr>
              <th className="px-4 py-3 font-medium">№</th>
              <th className="px-4 py-3 font-medium">Дата</th>
              <th className="px-4 py-3 font-medium">Клиент</th>
              <th className="px-4 py-3 font-medium">Товар / категория</th>
              <th className="px-4 py-3 font-medium">Ответственный</th>
              <th className="px-4 py-3 font-medium">Предложено</th>
              <th className="px-4 py-3 font-medium">Статус</th>
              <th className="px-4 py-3 font-medium">SLA</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr
                key={r.id}
                className="border-t border-line hover:bg-concrete/40 cursor-pointer"
                onClick={() => router.push(`/admin/requests/${r.id}`)}
              >
                <td className="px-4 py-3 font-mono text-xs text-graphite">{r.requestNumber ?? "—"}</td>
                <td className="px-4 py-3 text-steel whitespace-nowrap">{new Date(r.createdAt).toLocaleString("ru-RU")}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-graphite">{r.name}</div>
                  <div className="text-xs text-steel">{r.phone}</div>
                </td>
                <td className="px-4 py-3 text-steel">{r.product?.title ?? r.interestedCategory ?? "—"}</td>
                <td className="px-4 py-3 text-steel text-xs">{r.assigneeName ?? "Не назначен"}</td>
                <td className="px-4 py-3 text-graphite text-xs font-mono-tabular">{r.desiredPrice || "—"}</td>
                <td className="px-4 py-3">
                  <span className="text-[11px] bg-concrete px-2 py-1 rounded-sm">{REQUEST_STATUS_LABELS[r.status]}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: SLA_DOT[r.slaState] }} />
                    <span>
                      {SLA_LABEL[r.slaState]}
                      {r.slaRemainingMs !== null && r.slaState !== "none" && (
                        <>{" · "}{r.slaRemainingMs < 0 ? "просрочено на " : "осталось "}{formatDuration(r.slaRemainingMs)}</>
                      )}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {requests.length === 0 && <div className="p-10 text-center text-steel text-sm">Заявок не найдено</div>}
      </div>
    </div>
  );
}
