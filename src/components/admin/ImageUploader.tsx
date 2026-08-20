"use client";

import { useState } from "react";
import Image from "next/image";
import { uploadProductImage } from "@/lib/uploadImage";

export interface UploadedImage {
  url: string;
  isPrimary: boolean;
}

interface ImageUploaderProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
}

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    const uploaded: UploadedImage[] = [];

    for (const file of Array.from(files)) {
      try {
        const url = await uploadProductImage(file);
        uploaded.push({ url, isPrimary: false });
      } catch (e: any) {
        setError(e.message || "Не удалось загрузить одно из фото");
      }
    }

    const combined = [...images, ...uploaded];
    if (combined.length > 0 && !combined.some((img) => img.isPrimary)) {
      combined[0].isPrimary = true;
    }

    onChange(combined);
    setUploading(false);
  }

  function handleRemove(url: string) {
    const filtered = images.filter((img) => img.url !== url);
    if (filtered.length > 0 && !filtered.some((img) => img.isPrimary)) {
      filtered[0].isPrimary = true;
    }
    onChange(filtered);
  }

  function handleSetPrimary(url: string) {
    onChange(images.map((img) => ({ ...img, isPrimary: img.url === url })));
  }

  return (
    <div>
      <label className="block text-xs font-medium text-steel mb-1">Фотографии</label>

      <div className="grid grid-cols-4 gap-2 mb-3">
        {images.map((img) => (
          <div key={img.url} className="relative aspect-square border border-line rounded-sm overflow-hidden group">
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
                  onClick={() => handleSetPrimary(img.url)}
                  className="text-[10px] bg-white text-graphite px-2 py-1 rounded-sm"
                >
                  Сделать главным
                </button>
              )}
              <button
                type="button"
                onClick={() => handleRemove(img.url)}
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
