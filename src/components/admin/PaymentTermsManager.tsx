"use client";

import { useState } from "react";

interface Term {
  id: string;
  label: string;
  minAmountUsd: number | null;
  isActive: boolean;
  sortOrder: number;
}

export default function PaymentTermsManager({ initialTerms }: { initialTerms: Term[] }) {
  const [terms, setTerms] = useState(initialTerms);
  const [label, setLabel] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [creating, setCreating] = useState(false);

  async function addTerm() {
    if (!label.trim()) return;
    setCreating(true);
    const res = await fetch("/api/admin/payment-terms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, minAmountUsd: minAmount || null }),
    });
    const created = await res.json();
    setCreating(false);
    if (res.ok) {
      setTerms((prev) => [...prev, created]);
      setLabel("");
      setMinAmount("");
    }
  }

  async function toggleActive(term: Term) {
    setTerms((prev) => prev.map((t) => (t.id === term.id ? { ...t, isActive: !t.isActive } : t)));
    await fetch(`/api/admin/payment-terms/${term.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !term.isActive }),
    });
  }

  async function updateMinAmount(term: Term, value: string) {
    setTerms((prev) =>
      prev.map((t) => (t.id === term.id ? { ...t, minAmountUsd: value === "" ? null : Number(value) } : t))
    );
    await fetch(`/api/admin/payment-terms/${term.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ minAmountUsd: value === "" ? null : Number(value) }),
    });
  }

  async function remove(term: Term) {
    if (!confirm(`Удалить условие «${term.label}»?`)) return;
    await fetch(`/api/admin/payment-terms/${term.id}`, { method: "DELETE" });
    setTerms((prev) => prev.filter((t) => t.id !== term.id));
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-line rounded-sm divide-y divide-line">
        {terms.length === 0 && (
          <div className="px-4 py-6 text-sm text-steel">Условий пока нет — добавьте первое ниже.</div>
        )}
        {terms.map((term) => (
          <div key={term.id} className="px-4 py-3 flex items-center gap-4">
            <div className="flex-1 text-sm text-graphite font-medium">{term.label}</div>
            <div className="flex items-center gap-1.5 text-xs text-steel">
              Порог от
              <input
                type="number"
                min={0}
                defaultValue={term.minAmountUsd ?? ""}
                placeholder="без порога"
                onBlur={(e) => updateMinAmount(term, e.target.value)}
                className="w-28 border border-line rounded-sm px-2 py-1 text-sm"
              />
              USD
            </div>
            <label className="flex items-center gap-1.5 text-xs text-steel">
              <input type="checkbox" checked={term.isActive} onChange={() => toggleActive(term)} className="accent-amber" />
              Активно
            </label>
            <button onClick={() => remove(term)} className="text-xs text-alert hover:underline">
              Удалить
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white border border-line rounded-sm p-4">
        <div className="text-sm font-medium text-graphite mb-2">Добавить условие</div>
        <div className="flex gap-2">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Например: 100% предоплата"
            className="flex-1 border border-line rounded-sm px-3 py-2 text-sm"
          />
          <input
            type="number"
            min={0}
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            placeholder="Порог от, USD (необязательно)"
            className="w-56 border border-line rounded-sm px-3 py-2 text-sm"
          />
          <button
            onClick={addTerm}
            disabled={!label.trim() || creating}
            className="bg-amber text-graphite font-semibold px-5 py-2 rounded-sm hover:bg-amber-dark disabled:opacity-60"
          >
            {creating ? "Добавление..." : "Добавить"}
          </button>
        </div>
      </div>
    </div>
  );
}
