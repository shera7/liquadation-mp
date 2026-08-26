"use client";

import { useEffect, useRef, useState } from "react";

export default function TelegramLinkCard({ initiallyLinked }: { initiallyLinked: boolean }) {
  const [linked, setLinked] = useState(initiallyLinked);
  const [deepLink, setDeepLink] = useState<string | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  async function handleStart() {
    setError(null);
    const res = await fetch("/api/admin/telegram-link/start", { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Не удалось начать привязку");
      return;
    }
    setDeepLink(data.deepLink);
    setWaiting(true);

    pollRef.current = setInterval(async () => {
      const statusRes = await fetch("/api/admin/telegram-link/status");
      const statusData = await statusRes.json();
      if (statusData.linked) {
        setLinked(true);
        setWaiting(false);
        if (pollRef.current) clearInterval(pollRef.current);
      }
    }, 2000);
  }

  return (
    <div className="bg-white border border-line rounded-sm p-6">
      <h2 className="font-display font-700 text-graphite mb-1">Telegram для восстановления пароля</h2>
      <p className="text-xs text-steel mb-4">
        Привяжите свой личный Telegram — если забудете пароль, ссылка для сброса придёт именно туда.
      </p>

      {linked ? (
        <div className="text-sm text-okgreen bg-okgreen/10 rounded-sm px-3 py-2 inline-block">✓ Telegram привязан</div>
      ) : waiting ? (
        <div className="space-y-2">
          {deepLink && (
            <a href={deepLink} target="_blank" rel="noopener noreferrer" className="inline-block bg-amber text-graphite font-semibold px-5 py-2.5 rounded-sm hover:bg-amber-dark">
              Открыть Telegram-бота
            </a>
          )}
          <div className="text-xs text-steel">Ожидаем подтверждение...</div>
        </div>
      ) : (
        <button onClick={handleStart} className="bg-amber text-graphite font-semibold px-5 py-2.5 rounded-sm hover:bg-amber-dark text-sm">
          Привязать Telegram
        </button>
      )}

      {error && <div className="text-alert text-xs mt-2">{error}</div>}
    </div>
  );
}
