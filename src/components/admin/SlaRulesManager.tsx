"use client";

import { useState } from "react";
import { REQUEST_STATUS_LABELS } from "@/lib/utils";

export default function SlaRulesManager({ initialRules }: { initialRules: { status: string; hours: number; isFinal: boolean }[] }) {
  const [rules, setRules] = useState(initialRules);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function update(status: string, patch: Partial<{ hours: number; isFinal: boolean }>) {
    setRules((prev) => prev.map((r) => (r.status === status ? { ...r, ...patch } : r)));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    await fetch("/api/admin/sla-rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rules }),
    });
    setSaving(false);
    setSaved(true);
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-line rounded-sm divide-y divide-line">
        {rules.map((r) => (
          <div key={r.status} className="px-4 py-3 flex items-center gap-4">
            <div className="flex-1 text-sm text-graphite">{REQUEST_STATUS_LABELS[r.status]}</div>
            <label className="flex items-center gap-1.5 text-xs text-steel">
              <input type="checkbox" checked={r.isFinal} onChange={(e) => update(r.status, { isFinal: e.target.checked })} className="accent-amber" />
              Финальный статус
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min={0}
                value={r.hours}
                disabled={r.isFinal}
                onChange={(e) => update(r.status, { hours: Number(e.target.value) })}
                className="w-20 border border-line rounded-sm px-2 py-1 text-sm disabled:opacity-40"
              />
              <span className="text-xs text-steel">часов</span>
            </div>
          </div>
        ))}
      </div>

      {saved && <div className="text-okgreen text-sm">Сохранено</div>}

      <button onClick={handleSave} disabled={saving} className="bg-amber text-graphite font-semibold px-6 py-2.5 rounded-sm hover:bg-amber-dark disabled:opacity-60">
        {saving ? "Сохранение..." : "Сохранить SLA"}
      </button>
    </div>
  );
}
