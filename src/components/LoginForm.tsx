"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm({ siteName = "Актив.Каталог" }: { siteName?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [introOpen, setIntroOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIntroOpen(true), 60);
    return () => clearTimeout(t);
  }, []);

  const dotIndex = siteName.indexOf(".");
  const mainName = dotIndex >= 0 ? siteName.slice(0, dotIndex) : siteName;
  const restName = dotIndex >= 0 ? siteName.slice(dotIndex) : "";

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
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div
        aria-hidden
        className="fixed inset-y-0 left-0 z-50 bg-graphite pointer-events-none overflow-hidden"
        style={{
          width: introOpen ? "15%" : "50%",
          transition: "width 900ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div className="absolute inset-0 bg-hazard-stripe opacity-[0.05]" />
      </div>
      <div
        aria-hidden
        className="fixed inset-y-0 right-0 z-50 bg-graphite pointer-events-none overflow-hidden"
        style={{
          width: introOpen ? "15%" : "50%",
          transition: "width 900ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div className="absolute inset-0 bg-hazard-stripe opacity-[0.05]" />
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 bg-white rounded-lg shadow-2xl p-10 w-full max-w-sm"
        style={{
          opacity: introOpen ? 1 : 0,
          transform: introOpen ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 700ms ease-out 220ms, transform 700ms ease-out 220ms",
        }}
      >
        <div className="text-center mb-8">
          <div className="font-display font-800 text-2xl tracking-tight uppercase text-graphite">
            {mainName}
            {restName && <span className="text-amber-dark">{restName}</span>}
          </div>
          <p className="text-steel text-sm mt-3">Вход в панель управления</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-steel mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full bg-concrete border border-transparent rounded-sm px-4 py-3 text-sm text-graphite placeholder:text-steel focus:outline-none focus:ring-2 focus:ring-amber focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-steel mb-1.5">Пароль</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-concrete border border-transparent rounded-sm px-4 py-3 pr-11 text-sm text-graphite placeholder:text-steel focus:outline-none focus:ring-2 focus:ring-amber focus:bg-white transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-steel hover:text-graphite"
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-10-8-10-8a18.6 18.6 0 0 1 4.22-5.06M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <path d="M1 1l22 22" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {error && <div className="text-alert text-sm mt-4">{error}</div>}

        <a href="/forgot-password" className="block text-xs text-steel hover:text-graphite text-center mt-4">
          Забыли пароль?
        </a>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber text-graphite font-semibold py-3 rounded-sm mt-5 hover:bg-amber-dark transition-colors disabled:opacity-60"
        >
          {loading ? "Вход..." : "Войти"}
        </button>
      </form>
    </div>
  );
}
