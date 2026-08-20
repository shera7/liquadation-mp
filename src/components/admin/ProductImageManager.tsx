"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { uploadProductImage } from "@/lib/uploadImage";

interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
}

export default function ProductImageManager({
  productId,
  initialImages,
}: {
  productId: string;
  initialImages: ProductImage[];
}) {
  const router = useRouter();
  const [images, setImages] = useState(initialImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    for (const file of Array.from(files)) {
      try {
        const url = await uploadProductImage(file);

        const saveRes = await fetch(`/api/products/${productId}/images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        const saved = await saveRes.json();
        if (!saveRes.ok) throw new Error(saved.error || "Не удалось сохранить фото");

        setImages((prev) => [...prev, saved]);
      } catch (e: any) {
        setError(e.message || "Не удалось загрузить одно из фото");
      }
    }

    setUploading(false);
    router.refresh();
  }

  async function handleRemove(imageId: string) {
    if (!confirm("Удалить фото?")) return;
    await fetch(`/api/products/${productId}/images/${imageId}`, { method: "DELETE" });
    setImages((prev) => prev.filter((img) => img.id !== imageId));
    router.refresh();
  }

  async function handleSetPrimary(imageId: string) {
    await fetch(`/api/products/${productId}/images/${imageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPrimary: true }),
    });
    setImages((prev) => prev.map((img) => ({ ...img, isPrimary: img.id === imageId })));
    router.refresh();
  }

  return (
    <div>
      <label className="block text-xs font-medium text-steel mb-1">Фотографии</label>

      <div className="grid grid-cols-4 gap-2 mb-3">
        {images.map((img) => (
          <div key={img.id} className="relative aspect-square border border-line rounded-sm overflow-hidden group">
            <Image src={img.url} alt="" fill className="object-cover" />
            {img.isPrimary && (
              <span className="absolute top-1 left-1 text-[10px] bg-amber text-graphite px-1.5 py-0.5 rounded-sm font-semibold">
                Главное
              </span>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {!img.isPrimary && (
                <button
                  type="button"
                  onClick={() => handleSetPrimary(img.id)}
                  className="text-[10px] bg-white text-graphite px-2 py-1 rounded-sm"
                >
                  Сделать главным
                </button>
              )}
              <button
                type="button"
                onClick={() => handleRemove(img.id)}
                className="text-[10px] bg-alert text-white px-2 py-1 rounded-sm"
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>

      <label className="inline-block border border-dashed border-line rounded-sm px-4 py-2 text-sm text-steel cursor-pointer hover:border-amber">
        {uploading ? "Загрузка..." : "+ Добавить фото"}
        <input
          type="file"
          accept="image/*"
          multiple
          disabled={uploading}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </label>

      {error && <div className="text-alert text-xs mt-1">{error}</div>}
    </div>
  );
}
