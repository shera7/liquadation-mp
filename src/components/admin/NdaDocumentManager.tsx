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

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Черновик", className: "bg-steel/10 text-steel" },
  ACTIVE: { label: "Активна", className: "bg-okgreen/10 text-okgreen" },
  ARCHIVED: { label: "В архиве", className: "bg-concrete text-steel" },
};

export default function NdaDocumentManager({ initialDocuments }: { initialDocuments: NdaDoc[] }) {
  const router = useRouter();
  const [version, setVersion] = useState("");
  const [title, setTitle] = useState("Соглашение о конфиденциальности");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    router.refresh();
  }

  async function handleAction(id: string, action: "activate" | "archive") {
    if (action === "activate" && !confirm("Сделать эту версию активной? Предыдущая активная версия будет заархивирована.")) {
      return;
    }
    await fetch(`/api/admin/nda-documents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="bg-white border border-line rounded-sm p-4 space-y-3">
        <div className="text-sm font-semibold text-graphite">Новая версия NDA</div>
        <div className="grid grid-cols-3 gap-3">
          <input
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="Версия, напр. 1.0"
            className="border border-line rounded-sm px-3 py-2 text-sm col-span-1"
          />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Заголовок"
            className="border border-line rounded-sm px-3 py-2 text-sm col-span-2"
          />
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Полный текст соглашения..."
          rows={8}
          className="w-full border border-line rounded-sm px-3 py-2 text-sm"
        />
        {error && <div className="text-alert text-sm">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="bg-amber text-graphite font-semibold px-5 py-2 rounded-sm text-sm hover:bg-amber-dark disabled:opacity-60"
        >
          {loading ? "Создание..." : "Создать как черновик"}
        </button>
      </form>

      <div className="bg-white border border-line rounded-sm divide-y divide-line">
        {initialDocuments.map((doc) => {
          const statusInfo = STATUS_LABELS[doc.status];
          return (
            <div key={doc.id} className="px-4 py-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-graphite text-sm">Версия {doc.version}</span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-sm ${statusInfo.className}`}>
                    {statusInfo.label}
                  </span>
                </div>
                <div className="text-xs text-steel">
                  {doc._count.acceptances} подписаний
                  {doc.effectiveFrom && ` · действует с ${new Date(doc.effectiveFrom).toLocaleDateString("ru-RU")}`}
                </div>
              </div>
              <div className="flex gap-2">
                {doc.status !== "ACTIVE" && (
                  <button
                    onClick={() => handleAction(doc.id, "activate")}
                    className="text-xs bg-graphite text-white px-3 py-1.5 rounded-sm hover:bg-graphite2"
                  >
                    Сделать активной
                  </button>
                )}
                {doc.status === "ACTIVE" && (
                  <button
                    onClick={() => handleAction(doc.id, "archive")}
                    className="text-xs border border-line px-3 py-1.5 rounded-sm hover:border-amber"
                  >
                    В архив
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {initialDocuments.length === 0 && (
          <div className="p-8 text-center text-steel text-sm">Версий пока нет</div>
        )}
      </div>
    </div>
  );
}
