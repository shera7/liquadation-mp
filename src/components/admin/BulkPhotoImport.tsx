"use client";

import { useState } from "react";
import { uploadProductImage } from "@/lib/uploadImage";

interface ResultRow {
  fileName: string;
  inventoryNumber: string;
  status: "success" | "error";
  message: string;
}

export default function BulkPhotoImport() {
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  function extractInventoryNumber(fileName: string): string {
    const withoutExt = fileName.replace(/\.[^.]+$/, "");
    return withoutExt.replace(/-\d+$/, "");
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    setUploading(true);
    setResults([]);
    setProgress({ done: 0, total: files.length });

    const lookupRes = await fetch("/api/admin/products/lookup");
    const products: { id: string; inventoryNumber: string }[] = await lookupRes.json();
const map = new Map(
  products.map((p) => [String(p.inventoryNumber).trim(), p.id])
);

    const rows: ResultRow[] = [];

    for (const file of Array.from(files)) {
      const inventoryNumber = extractInventoryNumber(file.name);
      const productId = map.get(inventoryNumber);

      if (!productId) {
        rows.push({ fileName: file.name, inventoryNumber, status: "error", message: "Товар с таким ID не найден" });
        setProgress((p) => ({ ...p, done: p.done + 1 }));
        continue;
      }

      try {
        const url = await uploadProductImage(file);
        const saveRes = await fetch(`/api/products/${productId}/images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        if (!saveRes.ok) throw new Error("Не удалось сохранить фото");
        rows.push({ fileName: file.name, inventoryNumber, status: "success", message: "Загружено" });
      } catch (e: any) {
        rows.push({ fileName: file.name, inventoryNumber, status: "error", message: e.message || "Ошибка загрузки" });
      }

      setProgress((p) => ({ ...p, done: p.done + 1 }));
    }

    setResults(rows);
    setUploading(false);
  }

  const successCount = results.filter((r) => r.status === "success").length;
  const errorCount = results.filter((r) => r.status === "error").length;

  return (
    <div className="space-y-4">
      <label className="block border-2 border-dashed border-line rounded-sm bg-white p-10 text-center cursor-pointer hover:border-amber transition-colors">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          disabled={uploading}
          className="hidden"
        />
        <div className="font-display font-700 text-graphite mb-1">
          {uploading ? `Загрузка... ${progress.done} / ${progress.total}` : "Выберите фото или перетащите сюда"}
        </div>
        <div className="text-xs text-steel">Имя файла = инвентарный номер товара, напр. 000123.jpg</div>
      </label>

      {uploading && (
        <div className="h-1.5 bg-concrete rounded-full overflow-hidden">
          <div
            className="h-full bg-amber transition-all"
            style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}
          />
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-line rounded-sm p-4 text-center">
              <div className="text-2xl font-display font-800 text-okgreen">{successCount}</div>
              <div className="text-xs text-steel mt-1">Загружено успешно</div>
            </div>
            <div className="bg-white border border-line rounded-sm p-4 text-center">
              <div className={`text-2xl font-display font-800 ${errorCount ? "text-alert" : "text-graphite"}`}>{errorCount}</div>
              <div className="text-xs text-steel mt-1">Ошибок</div>
            </div>
          </div>

          <div className="bg-white border border-line rounded-sm divide-y divide-line max-h-80 overflow-y-auto">
            {results.map((r, i) => (
              <div key={i} className="px-4 py-2 flex items-center justify-between text-sm">
                <div>
                  <span className="font-mono text-xs text-steel">{r.fileName}</span>
                  <span className="text-xs text-steel ml-2">→ №{r.inventoryNumber}</span>
                </div>
                <span className={r.status === "success" ? "text-okgreen text-xs" : "text-alert text-xs"}>{r.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
