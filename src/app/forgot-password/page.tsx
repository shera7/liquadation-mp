"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setMessage(data.message);
    setStatus("done");
  }

  return (
    <div className="min-h-screen bg-graphite flex items-center justify-center px-4">
      <div className="bg-white rounded-sm p-8 w-full max-w-sm space-y-4">
        <div className="font-display font-800 text-xl text-graphite mb-2">Восстановление пароля</div>

        {status === "done" ? (
          <div className="text-sm text-okgreen bg-okgreen/10 rounded-sm p-3">{message}</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-steel mb-1">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-line rounded-sm px-3 py-2 text-sm" />
            </div>
            <button type="submit" disabled={status === "loading"} className="w-full bg-amber text-graphite font-semibold py-2.5 rounded-sm hover:bg-amber-dark disabled:opacity-60">
              {status === "loading" ? "Отправка..." : "Отправить ссылку в Telegram"}
            </button>
          </form>
        )}

        <Link href="/login" className="block text-xs text-steel hover:text-graphite text-center">← Назад ко входу</Link>
      </div>
    </div>
  );
}
