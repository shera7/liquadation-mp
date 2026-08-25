"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface NdaDoc {
  id: string;
  version: string;
  title: string;
  content: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  effectiveFrom: string | null;
  _count: { acceptances: number };
}

function suggestNextVersion(current: string): string {
  const parts = current.split(".");
  const last = parseInt(parts[parts.length - 1], 10);
  parts[parts.length - 1] = Number.isNaN(last) ? "1" : String(last + 1);
  return parts.join(".");
}

export default function NdaDocumentManager({ initialDocuments }: { initialDocuments: NdaDoc[] }) {
  const router = useRouter();
  const [showNewForm, setShowNewForm] = useState(false);
  const [version, setVersion] = useState("");
  const [title, setTitle] = useState("Соглашение о конфиденциальности");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const active = initialDocuments.find((d) => d.status === "ACTIVE");
  const drafts = initialDocuments.filter((d) => d.status === "DRAFT");
  const archived = initialDocuments.filter((d) => d.status === "ARCHIVED");

  function startDuplicate(doc: NdaDoc) {
    setShowNewForm(true);
    setVersion(suggestNextVersion(doc.version));
    setTitle(doc.title);
    setContent(doc.content);
    window.scrollTo({ top: 400, behavior: "smooth" });
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!version.trim() || !content.trim()) return;
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/nda-documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ version, title, content }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Не удалось создать версию");
      return;
    }

    setVersion("");
    setContent("");
    setShowNewForm(false);
    router.refresh();
  }

  async function handleAction(id: string, action: "activate" | "delete") {
    if (action === "activate" && !confirm("Сделать эту версию активной? Предыдущая активная версия будет заархивирована.")) return;
    if (action === "delete" && !confirm("Удалить черновик безвозвратно?")) return;

    if (action === "delete") {
      const res = await fetch(`/api/admin/nda-documents/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Не удалось удалить");
      }
    } else {
      await fetch(`/api/admin/nda-documents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
    }
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display font-700 text-graphite mb-3">Текущая активная версия</h2>
        {active ? (
          <div className="bg-white border border-line rounded-sm overflow-hidden">
            <div className="bg-okgreen/10 px-5 py-3 flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-sm font-semibold text-graphite">Версия {active.version}</span>
                <span className="text-xs text-steel ml-2">
                  {active._count.acceptances} подписаний
                  {active.effectiveFrom && ` · действует с ${new Date(active.effectiveFrom).toLocaleDateString("ru-RU")}`}
                </span>
              </div>
              <button onClick={() => startDuplicate(active)} className="text-xs bg-graphite text-white px-3 py-1.5 rounded-sm hover:bg-graphite2">
                Создать новую версию на основе этой
              </button>
            </div>
            <div className="p-5 max-h-64 overflow-y-auto text-sm text-graphite leading-relaxed whitespace-pre-line">
              {active.content}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-dashed border-line rounded-sm p-8 text-center text-steel text-sm">
            Активной версии NDA пока нет — заявки на товар отправляются без запроса подтверждения.
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-700 text-graphite">Черновики</h2>
          {!showNewForm && (
            <button onClick={() => setShowNewForm(true)} className="text-xs bg-amber text-graphite font-semibold px-3 py-1.5 rounded-sm hover:bg-amber-dark">
              + Новый черновик с нуля
            </button>
          )}
        </div>

        {showNewForm && (
          <form onSubmit={handleCreate} className="bg-white border border-line rounded-sm p-4 space-y-3 mb-4">
            <div className="text-sm font-semibold text-graphite">Новая версия NDA</div>
            <div className="grid grid-cols-3 gap-3">
              <input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="Версия, напр. 1.1" className="border border-line rounded-sm px-3 py-2 text-sm col-span-1" />
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Заголовок" className="border border-line rounded-sm px-3 py-2 text-sm col-span-2" />
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Полный текст соглашения..."
              rows={10}
              className="w-full border border-line rounded-sm px-3 py-2 text-sm font-mono"
            />
            {error && <div className="text-alert text-sm">{error}</div>}
            <div className="flex gap-2">
              <button type="submit" disabled={loading} className="bg-amber text-graphite font-semibold px-5 py-2 rounded-sm text-sm hover:bg-amber-dark disabled:opacity-60">
                {loading ? "Создание..." : "Сохранить черновик"}
              </button>
              <button type="button" onClick={() => setShowNewForm(false)} className="text-sm text-steel hover:text-graphite px-3">
                Отмена
              </button>
            </div>
          </form>
        )}

        {drafts.length === 0 && !showNewForm && <div className="text-sm text-steel">Черновиков нет</div>}

        <div className="space-y-3">
          {drafts.map((doc) => (
            <DraftEditor
              key={doc.id}
              doc={doc}
              onSaved={() => router.refresh()}
              onActivate={() => handleAction(doc.id, "activate")}
              onDelete={() => handleAction(doc.id, "delete")}
            />
          ))}
        </div>
      </div>

      {archived.length > 0 && (
        <div>
          <h2 className="font-display font-700 text-graphite mb-3">Архив версий</h2>
          <div className="bg-white border border-line rounded-sm divide-y divide-line">
            {archived.map((doc) => (
              <div key={doc.id} className="px-4 py-3 flex items-center justify-between text-sm">
                <div>
                  <span className="text-graphite font-medium">Версия {doc.version}</span>
                  <span className="text-xs text-steel ml-2">{doc._count.acceptances} подписаний</span>
                </div>
                <button onClick={() => startDuplicate(doc)} className="text-xs text-amber-dark hover:underline">
                  Использовать как основу
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DraftEditor({
  doc,
  onSaved,
  onActivate,
  onDelete,
}: {
  doc: NdaDoc;
  onSaved: () => void;
  onActivate: () => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [version, setVersion] = useState(doc.version);
  const [title, setTitle] = useState(doc.title);
  const [content, setContent] = useState(doc.content);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/admin/nda-documents/${doc.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", version, title, content }),
    });
    setSaving(false);
    setEditing(false);
    onSaved();
  }

  return (
    <div className="bg-white border border-line rounded-sm overflow-hidden">
      <div className="bg-concrete px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
        <div className="text-sm">
          <span className="font-medium text-graphite">Версия {doc.version}</span>
          <span className="text-[11px] font-semibold bg-steel/10 text-steel px-2 py-0.5 rounded-sm ml-2">Черновик</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setEditing((v) => !v)} className="text-xs text-amber-dark hover:underline">
            {editing ? "Скрыть редактор" : "Редактировать"}
          </button>
          <button onClick={onActivate} className="text-xs bg-graphite text-white px-3 py-1 rounded-sm hover:bg-graphite2">
            Сделать активной
          </button>
          <button onClick={onDelete} className="text-xs text-alert hover:underline">
            Удалить
          </button>
        </div>
      </div>

      {editing ? (
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <input value={version} onChange={(e) => setVersion(e.target.value)} className="border border-line rounded-sm px-3 py-2 text-sm" />
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="border border-line rounded-sm px-3 py-2 text-sm col-span-2" />
          </div>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={10} className="w-full border border-line rounded-sm px-3 py-2 text-sm font-mono" />
          <button onClick={handleSave} disabled={saving} className="bg-amber text-graphite font-semibold px-5 py-2 rounded-sm text-sm hover:bg-amber-dark disabled:opacity-60">
            {saving ? "Сохранение..." : "Сохранить изменения"}
          </button>
        </div>
      ) : (
        <div className="p-4 text-sm text-steel line-clamp-3 whitespace-pre-line">{doc.content}</div>
      )}
    </div>
  );
}
