"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { REQUEST_STATUS_LABELS } from "@/lib/utils";
import { formatDuration } from "@/lib/sla";

const SLA_LABEL: Record<string, string> = { ok: "В норме", warning: "Под угрозой", breached: "Просрочен", none: "SLA не применяется" };
const SLA_COLOR: Record<string, string> = {
  ok: "text-okgreen bg-okgreen/10",
  warning: "text-amber-dark bg-amber/10",
  breached: "text-alert bg-alert/10",
  none: "text-steel bg-concrete",
};

export default function RequestDetail({ request, admins, slaState, slaRemainingMs }: any) {
  const router = useRouter();
  const [status, setStatus] = useState(request.status);
  const [assigneeId, setAssigneeId] = useState(request.assigneeId ?? "");
  const [statusComment, setStatusComment] = useState("");
  const [newComment, setNewComment] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleStatusSave() {
    setSaving(true);
    await fetch(`/api/requests/${request.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, historyComment: statusComment || undefined }),
    });
    setStatusComment("");
    setSaving(false);
    router.refresh();
  }

  async function handleAssigneeSave(newAssigneeId: string) {
    setAssigneeId(newAssigneeId);
    const admin = admins.find((a: any) => a.id === newAssigneeId);
    await fetch(`/api/requests/${request.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assigneeId: newAssigneeId || null, assigneeName: admin?.name || null }),
    });
    router.refresh();
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSaving(true);
    await fetch(`/api/requests/${request.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newComment }),
    });
    setNewComment("");
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="max-w-4xl">
      <Link
        href={request.type === "PRODUCT" ? "/admin/requests/product" : "/admin/requests/general"}
        className="text-xs text-steel hover:text-graphite mb-4 inline-block"
      >
        ← К списку заявок
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-800 text-2xl text-graphite">{request.requestNumber ?? request.id.slice(-6)}</h1>
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-sm ${SLA_COLOR[slaState]}`}>
          {SLA_LABEL[slaState]}
          {slaRemainingMs !== null && slaState !== "none" && (
            <> · {slaRemainingMs < 0 ? "просрочено на " : "осталось "}{formatDuration(slaRemainingMs)}</>
          )}
        </span>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <div className="bg-white border border-line rounded-sm p-5">
            <h2 className="font-display font-700 text-graphite mb-3">Информация</h2>
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-steel">Тип</dt>
              <dd className="text-graphite">{request.type === "PRODUCT" ? "Заявка на товар" : "Общая заявка"}</dd>
              <dt className="text-steel">Создана</dt>
              <dd className="text-graphite">{new Date(request.createdAt).toLocaleString("ru-RU")}</dd>
              <dt className="text-steel">Клиент</dt>
              <dd className="text-graphite">{request.name}{request.company ? ` (${request.company})` : ""}</dd>
              <dt className="text-steel">Телефон</dt>
              <dd className="text-graphite font-mono">{request.phone}</dd>
              {request.telegram && (<><dt className="text-steel">Telegram</dt><dd className="text-graphite">{request.telegram}</dd></>)}
              {request.email && (<><dt className="text-steel">Email</dt><dd className="text-graphite">{request.email}</dd></>)}
                           {request.quantity && (
                <>
                  <dt className="text-steel">Количество</dt>
                  <dd className="text-graphite">{request.quantity}</dd>
                </>
              )}
              {request.desiredPrice && (
                <>
                  <dt className="text-steel">Предложенная цена</dt>
                  <dd className="text-graphite font-semibold">{request.desiredPrice}</dd>
                </>
              )}
              {request.contactMethod && (
                <>
                  <dt className="text-steel">Способ связи</dt>
                  <dd className="text-graphite">{request.contactMethod}</dd>
                </>
              )}
              {request.budget && (
                <>
                  <dt className="text-steel">Бюджет</dt>
                  <dd className="text-graphite">{request.budget}</dd>
                </>
              )}
              {request.product && (
                <>
                  <dt className="text-steel">Товар</dt>
                  <dd>

                    <a href={`/product/${request.product.slug}`} target="_blank" className="text-amber-dark hover:underline">{request.product.title}</a>
                                                        {" · "}
                  <Link href={`/admin/requests/by-product?q=${request.productId}`} className="text-amber-dark hover:underline">
                    Все заявки по этому товару
                  </Link>
                  </dd>
                </>
              )}
              {request.interestedCategory && (<><dt className="text-steel">Категория интереса</dt><dd className="text-graphite">{request.interestedCategory}</dd></>)}
              {request.comment && (<><dt className="text-steel">Комментарий клиента</dt><dd className="text-graphite">{request.comment}</dd></>)}
              {request.ndaAcceptance && (
                <>
                  <dt className="text-steel">NDA</dt>
                  <dd className="text-graphite font-mono text-xs">
                    №{request.ndaAcceptance.id.slice(-6)} · v{request.ndaAcceptance.ndaVersion}
                    {request.ndaAcceptance.telegramUsername && ` · @${request.ndaAcceptance.telegramUsername}`}
                  </dd>
                </>
              )}
            </dl>
          </div>

          <div className="bg-white border border-line rounded-sm p-5">
            <h2 className="font-display font-700 text-graphite mb-3">История изменений</h2>
            {request.history.length === 0 ? (
              <div className="text-sm text-steel">Изменений пока не было</div>
            ) : (
              <ul className="space-y-2 text-sm">
                {request.history.map((h: any) => (
                  <li key={h.id} className="border-l-2 border-line pl-3">
                    <div className="text-steel text-xs">{new Date(h.createdAt).toLocaleString("ru-RU")} — {h.changedByName ?? "Система"}</div>
                    <div className="text-graphite">
                      {h.previousStatus ? REQUEST_STATUS_LABELS[h.previousStatus] : "—"} → {REQUEST_STATUS_LABELS[h.newStatus]}
                    </div>
                    {h.comment && <div className="text-steel text-xs mt-0.5">«{h.comment}»</div>}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white border border-line rounded-sm p-5">
            <h2 className="font-display font-700 text-graphite mb-3">Комментарии</h2>
            <div className="space-y-3 mb-4">
              {request.comments.map((c: any) => (
                <div key={c.id} className="bg-concrete rounded-sm p-3 text-sm">
                  <div className="text-xs text-steel mb-1">{c.authorName} · {new Date(c.createdAt).toLocaleString("ru-RU")}</div>
                  <div className="text-graphite">{c.text}</div>
                </div>
              ))}
              {request.comments.length === 0 && <div className="text-sm text-steel">Комментариев пока нет</div>}
            </div>
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Внутренний комментарий..."
                className="flex-1 border border-line rounded-sm px-3 py-2 text-sm"
              />
              <button type="submit" disabled={saving} className="bg-amber text-graphite font-semibold px-4 py-2 rounded-sm text-sm hover:bg-amber-dark disabled:opacity-60">
                Добавить
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-line rounded-sm p-5">
            <h2 className="font-display font-700 text-graphite mb-3 text-sm">Статус</h2>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border border-line rounded-sm px-3 py-2 text-sm mb-2">
              {Object.entries(REQUEST_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label as string}</option>
              ))}
            </select>
            <textarea
              value={statusComment}
              onChange={(e) => setStatusComment(e.target.value)}
              placeholder="Комментарий к изменению (необязательно)"
              rows={2}
              className="w-full border border-line rounded-sm px-3 py-2 text-xs mb-2"
            />
            <button
              onClick={handleStatusSave}
              disabled={saving || (status === request.status && !statusComment)}
              className="w-full bg-graphite text-white font-semibold py-2 rounded-sm text-sm hover:bg-graphite2 disabled:opacity-50"
            >
              Сохранить статус
            </button>
          </div>

          <div className="bg-white border border-line rounded-sm p-5">
            <h2 className="font-display font-700 text-graphite mb-3 text-sm">Ответственный</h2>
            <select value={assigneeId} onChange={(e) => handleAssigneeSave(e.target.value)} className="w-full border border-line rounded-sm px-3 py-2 text-sm">
              <option value="">Не назначен</option>
              {admins.map((a: any) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
