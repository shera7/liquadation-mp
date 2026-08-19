"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Employee {
  id: string;
  name: string;
  email: string;
  role: "FULL" | "MODERATOR";
}

export default function EmployeeManager({ initialEmployees }: { initialEmployees: Employee[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"FULL" | "MODERATOR">("MODERATOR");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Не удалось добавить сотрудника");
      return;
    }

    setName("");
    setEmail("");
    setPassword("");
    setRole("MODERATOR");
    router.refresh();
  }

  async function handleRoleChange(id: string, newRole: "FULL" | "MODERATOR") {
    await fetch(`/api/admin/employees/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Удалить сотрудника?")) return;
    const res = await fetch(`/api/admin/employees/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error ?? "Не удалось удалить");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="bg-white border border-line rounded-sm p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input
            placeholder="Имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="border border-line rounded-sm px-3 py-2 text-sm"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border border-line rounded-sm px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="password"
            placeholder="Пароль (мин. 8 символов)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border border-line rounded-sm px-3 py-2 text-sm"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            className="border border-line rounded-sm px-3 py-2 text-sm"
          >
            <option value="MODERATOR">Только модерация</option>
            <option value="FULL">Полный контроль</option>
          </select>
        </div>
        {error && <div className="text-alert text-sm">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="bg-amber text-graphite font-semibold px-5 py-2 rounded-sm text-sm hover:bg-amber-dark disabled:opacity-60"
        >
          {loading ? "Добавление..." : "+ Добавить сотрудника"}
        </button>
      </form>

      <div className="bg-white border border-line rounded-sm divide-y divide-line">
        {initialEmployees.map((emp) => (
          <div key={emp.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="font-medium text-graphite text-sm">{emp.name}</div>
              <div className="text-xs text-steel">{emp.email}</div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={emp.role}
                onChange={(e) => handleRoleChange(emp.id, e.target.value as any)}
                className="text-xs border border-line rounded-sm px-2 py-1"
              >
                <option value="MODERATOR">Только модерация</option>
                <option value="FULL">Полный контроль</option>
              </select>
              <button onClick={() => handleDelete(emp.id)} className="text-xs text-alert hover:underline">
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
