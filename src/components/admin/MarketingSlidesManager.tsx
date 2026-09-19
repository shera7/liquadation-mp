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

// Рекомендации по размеру — разные для крупной карусели и мини-баннеров,
// у них разная пропорция на сайте (см. BannerCarousel.tsx).
const RECOMMENDATIONS: Record<string, { size: string; ratio: string; note: string }> = {
  HERO_CAROUSEL: {
    size: "1920 × 640 px",
    ratio: "3:1",
    note: "Широкий баннер во всю ширину страницы. Меньше 1200 px по ширине — фото может быть размытым на больших экранах.",
  },
  MINI_BANNER: {
    size: "800 × 340 px",
    ratio: "~2.4:1",
    note: "Показывается в ряду из 2–3 карточек — не делайте фото слишком узким/высоким.",
  },
};

function checkAspect(file: File, blockType: string): Promise<string | null> {
  const rec = RECOMMENDATIONS[blockType];
  if (!rec) return Promise.resolve(null);

  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const actual = img.width / img.height;
      const [rw, rh] = blockType === "HERO_CAROUSEL" ? [3, 1] : [2.4, 1];
      const expected = rw / rh;
      const deviation = Math.abs(actual - expected) / expected;
      URL.revokeObjectURL(img.src);
      if (deviation > 0.35) {
        resolve(
          `«${file.name}»: пропорции сильно отличаются от рекомендованных (${rec.ratio}) — на сайте фото может обрезаться или выглядеть иначе, чем ожидалось.`
        );
      } else {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = URL.createObjectURL(file);
  });
}

export default function MarketingSlidesManager({
  blockId,
  blockType,
  initialSlides,
}: {
  blockId: string;
  blockType: string;
  initialSlides: Slide[];
}) {
  const router = useRouter();
  const [slides, setSlides] = useState(initialSlides);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const recommendation = RECOMMENDATIONS[blockType];

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    setWarning(null);

    for (const file of Array.from(files)) {
      try {
        const aspectWarning = await checkAspect(file, blockType);
        if (aspectWarning) setWarning((prev) => (prev ? `${prev}\n${aspectWarning}` : aspectWarning));

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
      {recommendation && (
        <div className="text-xs text-steel bg-concrete rounded-sm px-3 py-2">
          Рекомендуемый размер фото: <span className="font-medium text-graphite">{recommendation.size}</span>{" "}
          (пропорция {recommendation.ratio}). {recommendation.note}
        </div>
      )}

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

      {warning && <div className="text-amber-dark text-xs whitespace-pre-line bg-amber/10 rounded-sm px-3 py-2">{warning}</div>}
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
