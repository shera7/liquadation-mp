"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Recipient {
  id: string;
  chatId: string;
  label: string | null;
  active: boolean;
}

export default function TelegramRecipientsManager({ initialRecipients }: { initialRecipients: Recipient[] }) {
  const router = useRouter();
  const [chatId, setChatId] = useState("");
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!chatId.trim()) return;
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/telegram-recipients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId, label }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Не удалось добавить получателя");
      return;
    }

    setChatId("");
    setLabel("");
    router.refresh();
  }

  async function handleToggle(id: string, active: boolean) {
    await fetch(`/api/admin/telegram-recipients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Удалить получателя уведомлений?")) return;
    await fetch(`/api/admin/telegram-recipients/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleAdd} className="flex gap-2 flex-wrap">
        <input
          value={chatId}
          onChange={(e) => setChatId(e.target.value)}
          placeholder="Chat ID, напр. 123456789"
          className="flex-1 min-w-[140px] border border-line rounded-sm px-3 py-2 text-sm"
        />
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Имя (необязательно, напр. Менеджер Азиз)"
          className="flex-1 min-w-[180px] border border-line rounded-sm px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-amber text-graphite font-semibold px-4 py-2 rounded-sm text-sm hover:bg-amber-dark disabled:opacity-60"
        >
          + Добавить
        </button>
      </form>
      {error && <div className="text-alert text-xs">{error}</div>}

      <div className="border border-line rounded-sm divide-y divide-line">
        {initialRecipients.map((r) => (
          <div key={r.id} className="px-3 py-2.5 flex items-center justify-between text-sm">
            <div>
              <span className="font-mono text-graphite">{r.chatId}</span>
              {r.label && <span className="text-xs text-steel ml-2">{r.label}</span>}
              {!r.active && <span className="text-[10px] font-semibold bg-steel/10 text-steel px-1.5 py-0.5 rounded-sm ml-2">Выключен</span>}
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-steel cursor-pointer">
                <input type="checkbox" checked={r.active} onChange={(e) => handleToggle(r.id, e.target.checked)} className="accent-amber" />
                Получает уведомления
              </label>
              <button onClick={() => handleDelete(r.id)} className="text-xs text-alert hover:underline">
                Удалить
              </button>
            </div>
          </div>
        ))}
        {initialRecipients.length === 0 && (
          <div className="px-3 py-4 text-center text-steel text-xs">Получателей пока нет — уведомления никому не приходят</div>
        )}
      </div>
    </div>
  );
}
