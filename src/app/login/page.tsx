"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Intro-анимация открытия: две панели, изначально сходящиеся точно по
  // центру экрана, разъезжаются к краям, оставляя ~5% с каждой стороны.
  // Чисто визуальный слой (position: fixed поверх всего) — не влияет на
  // разметку/логику страницы под собой.
  const [introOpen, setIntroOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIntroOpen(true), 60);
    return () => clearTimeout(t);
  }, []);

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
    <>
      <div
        aria-hidden
        className="fixed inset-y-0 left-0 z-50 bg-graphite pointer-events-none"
        style={{
          width: introOpen ? "5%" : "50%",
          transition: "width 900ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />
      <div
        aria-hidden
        className="fixed inset-y-0 right-0 z-50 bg-graphite pointer-events-none"
        style={{
          width: introOpen ? "5%" : "50%",
          transition: "width 900ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />

      <div className="min-h-screen bg-graphite flex items-center justify-center px-4">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-sm p-8 w-full max-w-sm space-y-4"
          style={{
            opacity: introOpen ? 1 : 0,
            transform: introOpen ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 700ms ease-out 220ms, transform 700ms ease-out 220ms",
          }}
        >
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
          <a href="/forgot-password" className="block text-xs text-steel hover:text-graphite text-center mt-3">
            Забыли пароль?
          </a>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber text-graphite font-semibold py-2.5 rounded-sm hover:bg-amber-dark disabled:opacity-60"
          >
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>
      </div>
    </>
  );
}
