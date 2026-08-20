"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: { id: string; url: string }[];
  title: string;
}

export default function ProductGallery({ images, title }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);

  if (images.length === 0) {
    return (
      <div className="relative aspect-[4/3] bg-concrete border border-line rounded-sm flex items-center justify-center text-steel mb-3">
        Нет фото
      </div>
    );
  }

  function goPrev() {
    setSelected((i) => (i === 0 ? images.length - 1 : i - 1));
  }

  function goNext() {
    setSelected((i) => (i === images.length - 1 ? 0 : i + 1));
  }

  return (
    <div>
      <div className="relative aspect-[4/3] bg-concrete border border-line rounded-sm overflow-hidden mb-3">
        <Image
          src={images[selected].url}
          alt={title}
          fill
          className="object-contain"
          sizes="(max-width: 1024px) 100vw, 60vw"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Предыдущее фото"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white w-8 h-8 rounded-full flex items-center justify-center text-graphite shadow"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Следующее фото"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white w-8 h-8 rounded-full flex items-center justify-center text-graphite shadow"
            >
              ›
            </button>
            <span className="absolute bottom-2 right-2 text-[11px] bg-graphite/80 text-white px-2 py-0.5 rounded-sm">
              {selected + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setSelected(i)}
              className={`relative aspect-square bg-concrete rounded-sm overflow-hidden border-2 transition-colors ${
                i === selected ? "border-amber" : "border-transparent hover:border-line"
              }`}
            >
              <Image src={img.url} alt="" fill className="object-contain" sizes="120px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
