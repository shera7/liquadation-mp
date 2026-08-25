"use client";

import { useState } from "react";
import Link from "next/link";

interface ImportResult {
  total: number;
  successCount: number;
  errorCount: number;
  errors: { row: number; message: string }[];
}

export default function ImportPage() {
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/import", { method: "POST", body: formData });
    const data = await res.json();
    setResult(data);
    setLoading(false);
    e.target.value = "";
  }

  function downloadErrorsCsv() {
    if (!result) return;
    const header = "Строка,Ошибка\n";
    const rows = result.errors.map((e) => `${e.row},"${e.message.replace(/"/g, '""')}"`).join("\n");
    const blob = new Blob(["\uFEFF" + header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "import-errors.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display font-800 text-2xl text-graphite">Импорт из Excel/CSV</h1>
        <a href="/api/admin/import/template" className="text-xs border border-line rounded-sm px-3 py-1.5 hover:border-amber text-steel">
          Скачать шаблон
        </a>
      </div>
      <p className="text-steel text-sm mb-6">
        Загрузите файл .xlsx или .csv по образцу шаблона. Товары с существующим ID будут обновлены, остальные — созданы.
        Фото к товарам после импорта загружаются{" "}
        <Link href="/admin/import/photos" className="text-amber-dark hover:underline">
          отдельным шагом здесь
        </Link>
        .
      </p>

      <label className="block border-2 border-dashed border-line rounded-sm bg-white p-10 text-center cursor-pointer hover:border-amber transition-colors">
        <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="hidden" disabled={loading} />
        <div className="font-display font-700 text-graphite mb-1">
          {loading ? "Загрузка и обработка..." : "Выберите файл или перетащите сюда"}
        </div>
        <div className="text-xs text-steel">.xlsx, .xls, .csv</div>
      </label>

      {result && (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Stat label="Всего строк" value={result.total} />
            <Stat label="Успешно загружено" value={result.successCount} tone="ok" />
            <Stat label="Ошибок" value={result.errorCount} tone={result.errorCount ? "error" : undefined} />
          </div>

          {result.errors.length > 0 && (
            <div className="bg-white border border-alert/30 rounded-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-alert">Строки с ошибками</div>
                <button onClick={downloadErrorsCsv} className="text-xs text-amber-dark hover:underline">
                  Скачать список ошибок (CSV)
                </button>
              </div>
              <ul className="text-sm space-y-1 max-h-64 overflow-y-auto">
                {result.errors.map((e, i) => (
                  <li key={i} className="text-steel">
                    <span className="font-mono text-xs text-alert">Строка {e.row}:</span> {e.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.successCount > 0 && (
            <div className="bg-white border border-line rounded-sm p-4 text-sm text-steel">
              Товары загружены без фото. Чтобы добавить фотографии, перейдите на{" "}
              <Link href="/admin/import/photos" className="text-amber-dark hover:underline">
                страницу массовой загрузки фото
              </Link>{" "}
              и назовите файлы по инвентарным номерам товаров.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "ok" | "error" }) {
  const color = tone === "ok" ? "text-okgreen" : tone === "error" ? "text-alert" : "text-graphite";
  return (
    <div className="bg-white border border-line rounded-sm p-4 text-center">
      <div className={`text-2xl font-display font-800 ${color}`}>{value}</div>
      <div className="text-xs text-steel mt-1">{label}</div>
    </div>
  );
}
