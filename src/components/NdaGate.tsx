"use client";

import { useEffect, useState } from "react";

interface NdaDocument {
  id: string;
  version: string;
  title: string;
  content: string;
  effectiveFrom: string | null;
}

interface NdaGateProps {
  onSigned: (acceptanceId: string, telegramId: string) => void;
  onCancel: () => void;
}

declare global {
  interface Window {
    onTelegramAuth?: (user: any) => void;
  }
}

export default function NdaGate({ onSigned, onCancel }: NdaGateProps) {
  const [doc, setDoc] = useState<NdaDocument | null>(null);
  const [botUsername, setBotUsername] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/nda/current").then((r) => r.json()),
      fetch("/api/public/settings").then((r) => r.json()),
    ]).then(([ndaData, settingsData]) => {
      if (ndaData.active) setDoc(ndaData);
      setBotUsername(settingsData.telegramBotUsername);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!accepted || !doc || !botUsername) return;

    window.onTelegramAuth = async (user: any) => {
      setVerifying(true);
      setError(null);
      try {
        const res = await fetch("/api/nda/verify-telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...user, ndaDocumentId: doc.id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Не удалось подтвердить");

        localStorage.setItem(
          "nda_acceptance",
          JSON.stringify({
            acceptanceId: data.acceptanceId,
            telegramId: data.telegramId,
            ndaVersion: data.ndaVersion,
          })
        );

        onSigned(data.acceptanceId, data.telegramId);
      } catch (e: any) {
        setError(e.message || "Ошибка подтверждения");
        setVerifying(false);
      }
    };

    const container = document.getElementById("telegram-login-container");
    if (container && container.childElementCount === 0) {
      const script = document.createElement("script");
      script.src = "https://telegram.org/js/telegram-widget.js?22";
      script.async = true;
      script.setAttribute("data-telegram-login", botUsername);
      script.setAttribute("data-size", "large");
      script.setAttribute("data-onauth", "onTelegramAuth(user)");
      script.setAttribute("data-request-access", "write");
      container.appendChild(script);
    }
  }, [accepted, doc, botUsername]);

  if (loading) {
    return <div className="text-sm text-steel py-4">Загрузка...</div>;
  }

  if (!doc) {
    // NDA не настроен администратором — пропускаем шаг
    return null;
  }

  return (
    <div className="border border-line rounded-sm bg-white p-5 space-y-4">
      <div>
        <div className="text-sm font-semibold text-graphite mb-1">
          Соглашение о конфиденциальности (NDA)
        </div>
        <div className="text-xs text-steel mb-3">Версия {doc.version}</div>
        <div className="max-h-40 overflow-y-auto border border-line rounded-sm p-3 text-xs text-steel leading-relaxed whitespace-pre-line bg-concrete">
          {doc.content}
        </div>
      </div>

      {!accepted ? (
        <>
          <label className="flex items-start gap-2 text-sm text-graphite cursor-pointer">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="accent-amber mt-0.5"
            />
            Я ознакомился с NDA и принимаю его условия
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!accepted}
              className="flex-1 bg-amber text-graphite font-semibold py-2.5 rounded-sm hover:bg-amber-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            onClick={() => {}}
            >
              Продолжить
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 text-sm text-steel hover:text-graphite"
            >
              Отмена
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-2">
          <div className="text-sm text-steel mb-3">
            {verifying ? "Подтверждаем..." : "Подтвердите личность через Telegram:"}
          </div>
          <div id="telegram-login-container" className="flex justify-center" />
          {error && <div className="text-alert text-xs mt-2">{error}</div>}
        </div>
      )}
    </div>
  );
}
