"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Slide {
  id: string;
  imageUrl: string;
  title: string | null;
  subtitle: string | null;
  buttonLabel: string | null;
  linkUrl: string | null;
}

function SlideContent({ slide }: { slide: Slide }) {
  return (
    <div className="relative w-full h-full">
      <Image
        src={slide.imageUrl}
        alt={slide.title || ""}
        fill
        className="object-cover"
        sizes="100vw"
        priority
      />
      {(slide.title || slide.subtitle || slide.buttonLabel) && (
        <div className="absolute inset-0 bg-gradient-to-t from-graphite/85 via-graphite/25 to-transparent flex flex-col justify-end p-6 sm:p-10 lg:p-12">
          {slide.title && (
            <h3 className="font-display font-800 text-white text-xl sm:text-3xl lg:text-4xl mb-2 max-w-xl leading-tight">
              {slide.title}
            </h3>
          )}
          {slide.subtitle && (
            <p className="text-steelLight text-sm sm:text-base max-w-lg mb-4">{slide.subtitle}</p>
          )}
          {slide.buttonLabel && (
            <span className="inline-block w-fit bg-amber text-graphite font-semibold px-5 py-2.5 rounded-sm text-sm hover:bg-amber-dark transition-colors">
              {slide.buttonLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Крупная карусель-баннер вверху главной страницы.
 * Высота фиксирована по брейкпоинтам — не "плывёт" в зависимости от
 * пропорций загруженной картинки, поэтому дизайн выглядит собранно
 * при любых изображениях.
 */
export function HeroCarousel({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length]);

  if (slides.length === 0) return null;

  function go(dir: -1 | 1) {
    setIndex((i) => (i + dir + slides.length) % slides.length);
  }

  return (
    <div className="relative w-full h-[220px] sm:h-[340px] lg:h-[440px] overflow-hidden rounded-2xl bg-graphite2 shadow-sm">
      {slides.map((slide, i) => {
        const inner = <SlideContent slide={slide} />;
        return (
          <div
            key={slide.id}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === index ? 1 : 0, pointerEvents: i === index ? "auto" : "none" }}
          >
            {slide.linkUrl ? <Link href={slide.linkUrl}>{inner}</Link> : inner}
          </div>
        );
      })}

      {slides.length > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            aria-label="Предыдущий слайд"
            className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/15 backdrop-blur text-white items-center justify-center hover:bg-white/25 transition-colors"
          >
            ←
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Следующий слайд"
            className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/15 backdrop-blur text-white items-center justify-center hover:bg-white/25 transition-colors"
          >
            →
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setIndex(i)}
                aria-label={`Слайд ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-amber" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Ряд небольших баннеров. Тоже фиксированная высота по брейкпоинтам,
 * одинаковая для всех карточек ряда независимо от их количества.
 */
export function MiniBannerRow({ slides }: { slides: Slide[] }) {
  if (slides.length === 0) return null;
  const cols = slides.length >= 3 ? "sm:grid-cols-3" : slides.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-1";

  return (
    <div className={`grid grid-cols-1 ${cols} gap-4`}>
      {slides.map((slide) => {
        const inner = (
          <div className="relative w-full h-[150px] sm:h-[170px] overflow-hidden rounded-2xl bg-graphite2 group shadow-sm">
            <Image
              src={slide.imageUrl}
              alt={slide.title || ""}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(min-width: 640px) 33vw, 100vw"
            />
            {(slide.title || slide.subtitle) && (
              <div className="absolute inset-0 bg-gradient-to-t from-graphite/80 via-graphite/10 to-transparent flex flex-col justify-end p-4">
                {slide.title && <div className="font-display font-700 text-white text-base leading-tight">{slide.title}</div>}
                {slide.subtitle && <div className="text-steelLight text-xs mt-0.5">{slide.subtitle}</div>}
              </div>
            )}
          </div>
        );
        return slide.linkUrl ? (
          <Link key={slide.id} href={slide.linkUrl} className="block hover:shadow-md rounded-2xl transition-shadow">
            {inner}
          </Link>
        ) : (
          <div key={slide.id}>{inner}</div>
        );
      })}
    </div>
  );
}
