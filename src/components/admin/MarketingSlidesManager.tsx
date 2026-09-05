"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { uploadMarketingImage } from "@/lib/uploadMarketingImage";

interface Slide {
  id: string;
  imageUrl: string;
  title: string | null;
  subtitle: string | null;
  buttonLabel: string | null;
  linkUrl: string | null;
  isActive: boolean;
}

export default function MarketingSlidesManager({
  blockId,
  initialSlides,
}: {
  blockId: string;
  initialSlides: Slide[];
}) {
  const router = useRouter();
  const [slides, setSlides] = useState(initialSlides);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);

    for (const file of Array.from(files)) {
      try {
        const imageUrl = await uploadMarketingImage(file);
        const res = await fetch(`/api/admin/marketing-blocks/${blockId}/slides`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl }),
        });
        const saved = await res.json();
        if (!res.ok) throw new Error(saved.error || "Не удалось сохранить слайд");
        setSlides((prev) => [...prev, saved]);
      } catch (e: any) {
        setError(e.message || "Не удалось загрузить одно из изображений");
      }
    }
    setUploading(false);
    router.refresh();
  }

  function updateLocal(id: string, patch: Partial<Slide>) {
    setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  async function saveSlide(slide: Slide) {
    await fetch(`/api/admin/marketing-blocks/${blockId}/slides/${slide.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: slide.title,
        subtitle: slide.subtitle,
        buttonLabel: slide.buttonLabel,
        linkUrl: slide.linkUrl,
      }),
    });
  }

  async function removeSlide(id: string) {
    if (!confirm("Удалить слайд?")) return;
    await fetch(`/api/admin/marketing-blocks/${blockId}/slides/${id}`, { method: "DELETE" });
    setSlides((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {slides.map((slide) => (
          <div key={slide.id} className="bg-white border border-line rounded-sm p-4 flex gap-4">
            <div className="relative w-40 h-24 shrink-0 rounded-sm overflow-hidden bg-concrete">
              <Image src={slide.imageUrl} alt="" fill className="object-cover" />
            </div>
            <div className="flex-1 grid grid-cols-2 gap-2">
              <input
                placeholder="Заголовок"
                value={slide.title ?? ""}
                onChange={(e) => updateLocal(slide.id, { title: e.target.value })}
                onBlur={() => saveSlide(slide)}
                className="border border-line rounded-sm px-2 py-1.5 text-sm col-span-2"
              />
              <input
                placeholder="Подзаголовок"
                value={slide.subtitle ?? ""}
                onChange={(e) => updateLocal(slide.id, { subtitle: e.target.value })}
                onBlur={() => saveSlide(slide)}
                className="border border-line rounded-sm px-2 py-1.5 text-sm col-span-2"
              />
              <input
                placeholder="Текст кнопки"
                value={slide.buttonLabel ?? ""}
                onChange={(e) => updateLocal(slide.id, { buttonLabel: e.target.value })}
                onBlur={() => saveSlide(slide)}
                className="border border-line rounded-sm px-2 py-1.5 text-sm"
              />
              <input
                placeholder="Ссылка (/catalog?category=...)"
                value={slide.linkUrl ?? ""}
                onChange={(e) => updateLocal(slide.id, { linkUrl: e.target.value })}
                onBlur={() => saveSlide(slide)}
                className="border border-line rounded-sm px-2 py-1.5 text-sm"
              />
            </div>
            <button onClick={() => removeSlide(slide.id)} className="text-xs text-alert hover:underline self-start">
              Удалить
            </button>
          </div>
        ))}
      </div>

      {error && <div className="text-alert text-sm">{error}</div>}

      <label className="inline-block bg-white border border-dashed border-line rounded-sm px-5 py-3 text-sm text-steel hover:border-amber cursor-pointer">
        {uploading ? "Загрузка..." : "+ Добавить слайд (изображение)"}
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          disabled={uploading}
          onChange={(e) => handleUpload(e.target.files)}
        />
      </label>
    </div>
  );
}
