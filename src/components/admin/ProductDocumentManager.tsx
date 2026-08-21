"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadProductDocument } from "@/lib/uploadDocument";

interface ProductDocument {
  id: string;
  title: string;
  url: string;
}

export default function ProductDocumentManager({
  productId,
  initialDocuments,
}: {
  productId: string;
  initialDocuments: ProductDocument[];
}) {
  const router = useRouter();
  const [documents, setDocuments] = useState(initialDocuments);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | null) {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const url = await uploadProductDocument(file);

      const saveRes = await fetch(`/api/products/${productId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, title: file.name }),
      });
      const saved = await saveRes.json();
      if (!saveRes.ok) throw new Error(saved.error || "Не удалось сохранить документ");

      setDocuments((prev) => [...prev, saved]);
    } catch (e: any) {
      setError(e.message || "Не удалось загрузить файл");
    }

    setUploading(false);
    router.refresh();
  }

  async function handleRemove(documentId: string) {
    if (!confirm("Удалить документ?")) return;
    await fetch(`/api/products/${productId}/documents/${documentId}`, { method: "DELETE" });
    setDocuments((prev) => prev.filter((d) => d.id !== documentId));
    router.refresh();
  }

  return (
    <div>
      <label className="block text-xs font-medium text-steel mb-1">Документы</label>

      {documents.length > 0 && (
        <ul className="space-y-1.5 mb-3">
          {documents.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between bg-concrete rounded-sm px-3 py-2 text-sm">
              <a href={doc.url} target="_blank" className="text-amber-dark hover:underline truncate">
                📄 {doc.title}
              </a>
              <button
                type="button"
                onClick={() => handleRemove(doc.id)}
                className="text-xs text-alert hover:underline shrink-0 ml-3"
              >
                Удалить
              </button>
            </li>
          ))}
        </ul>
      )}

      <label className="inline-block border border-dashed border-line rounded-sm px-4 py-2 text-sm text-steel cursor-pointer hover:border-amber">
        {uploading ? "Загрузка..." : "+ Добавить документ (PDF, DOC и т.п.)"}
        <input
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx"
          disabled={uploading}
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          className="hidden"
        />
      </label>

      {error && <div className="text-alert text-xs mt-1">{error}</div>}
    </div>
  );
}
