"use client";

import { useEffect, useRef, useState } from "react";

interface NdaDocument {
  id: string;
  version: string;
  title: string;
  content: string;
}

interface NdaGateProps {
  onSigned: (acceptanceId: string, telegramId: string) => void;
  onCancel: () => void;
}

export default function NdaGate({ onSigned, onCancel }: NdaGateProps) {
  const [doc, setDoc] = useState<NdaDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepted, setAccepted] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [deepLink, setDeepLink] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch("/api/nda/current")
      .then((r) => r.json())
      .then((data) => {
        if (data.active) setDoc(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  async function handleAccept() {
    setAccepted(true);
    setError(null);

    const res = await fetch("/api/nda/start-session", { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Не удалось начать проверку");
      return;
    }

    setToken(data.token);
    setDeepLink(data.deepLink);

    pollRef.current = setInterval(async () => {
      const statusRes = await fetch(`/api/nda/session-status?token=${data.token}`);
      const statusData = await statusRes.json();
      if (statusData.codeSent) {
        setCodeSent(true);
        if (pollRef.current) clearInterval(pollRef.current);
      }
    }, 2000);
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setVerifying(true);
    setError(null);

    const res = await fetch("/api/nda/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, code }),
    });
    const data = await res.json();
    setVerifying(false);

    if (!res.ok) {
      setError(data.error || "Не удалось подтвердить код");
      return;
    }

    localStorage.setItem(
      "nda_acceptance",
      JSON.stringify({
        acceptanceId: data.acceptanceId,
        telegramId: data.telegramId,
        ndaVersion: data.ndaVersion,
      })
    );

    onSigned(data.acceptanceId, data.telegramId);
  }

  if (loading) return <div className="text-sm text-steel py-4">Загрузка...</div>;
  if (!doc) return null;

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
              onChange={(e) => e.target.checked && handleAccept()}
              className="accent-amber mt-0.5"
            />
            Я ознакомился с NDA и принимаю его условия
          </label>
          <button type="button" onClick={onCancel} className="text-sm text-steel hover:text-graphite">
            Отмена
          </button>
        </>
      ) : !codeSent ? (
        <div className="text-center py-2 space-y-3">
          <div className="text-sm text-steel">
            Откройте Telegram-бота и нажмите «Start» — мы пришлём код подтверждения
          </div>
          {deepLink && (
            
              href={deepLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-amber text-graphite font-semibold px-5 py-2.5 rounded-sm hover:bg-amber-dark"
            >
              Открыть Telegram-бота
            </a>
          )}
          <div className="text-xs text-steel">Ожидаем сообщение от бота...</div>
          {error && <div className="text-alert text-xs">{error}</div>}
        </div>
      ) : (
        <form onSubmit={handleVerify} className="space-y-3">
          <div className="text-sm text-okgreen">Код отправлен в Telegram — введите его ниже:</div>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="6-значный код"
            maxLength={6}
            className="w-full border border-line rounded-sm px-3 py-2 text-sm text-center tracking-widest font-mono"
          />
          {error && <div className="text-alert text-xs">{error}</div>}
          <button
            type="submit"
            disabled={verifying || code.length < 6}
            className="w-full bg-amber text-graphite font-semibold py-2.5 rounded-sm hover:bg-amber-dark disabled:opacity-50"
          >
            {verifying ? "Проверка..." : "Подтвердить"}
          </button>
        </form>
      )}
    </div>
  );
}
