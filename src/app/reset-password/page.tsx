"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Пароли не совпадают");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Не удалось сбросить пароль");
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  return (
    <div className="min-h-screen bg-graphite flex items-center justify-center px-4">
      <div className="bg-white rounded-sm p-8 w-full max-w-sm space-y-4">
        <div className="font-display font-800 text-xl text-graphite mb-2">Новый пароль</div>

        {done ? (
          <div className="text-sm text-okgreen bg-okgreen/10 rounded-sm p-3">Пароль изменён. Перенаправляем на вход...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-steel mb-1">Новый пароль</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-line rounded-sm px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-steel mb-1">Повторите пароль</label>
              <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full border border-line rounded-sm px-3 py-2 text-sm" />
            </div>
            {error && <div className="text-alert text-sm">{error}</div>}
            <button type="submit" disabled={loading || !token} className="w-full bg-amber text-graphite font-semibold py-2.5 rounded-sm hover:bg-amber-dark disabled:opacity-60">
              {loading ? "Сохранение..." : "Сохранить новый пароль"}
            </button>
            {!token && <div className="text-alert text-xs">Ссылка недействительна — токен отсутствует</div>}
          </form>
        )}
      </div>
    </div>
  );
}
