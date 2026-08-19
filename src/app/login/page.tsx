"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Не удалось войти");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-graphite flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-sm p-8 w-full max-w-sm space-y-4">
        <div className="font-display font-800 text-xl text-graphite mb-2">Вход в админку</div>
        <div>
          <label className="block text-xs font-medium text-steel mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-line rounded-sm px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-steel mb-1">Пароль</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-line rounded-sm px-3 py-2 text-sm"
          />
        </div>
        {error && <div className="text-alert text-sm">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber text-graphite font-semibold py-2.5 rounded-sm hover:bg-amber-dark disabled:opacity-60"
        >
          {loading ? "Вход..." : "Войти"}
        </button>
      </form>
    </div>
  );
}
