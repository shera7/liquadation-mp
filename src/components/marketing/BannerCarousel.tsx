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
        <div className="absolute inset-0 bg-gradient-to-t from-graphite/80 via-graphite/10 to-transparent flex flex-col justify-end p-6 sm:p-10">
          {slide.title && (
            <h3 className="font-display font-800 text-white text-2xl sm:text-3xl mb-2 max-w-xl">
              {slide.title}
            </h3>
          )}
          {slide.subtitle && (
            <p className="text-steelLight text-sm sm:text-base max-w-lg mb-4">{slide.subtitle}</p>
          )}
          {slide.buttonLabel && (
            <span className="inline-block w-fit bg-amber text-graphite font-semibold px-5 py-2.5 rounded-sm text-sm">
              {slide.buttonLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/** Крупная карусель-баннер (обычно вверху главной страницы). */
export function HeroCarousel({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <div className="relative w-full aspect-[21/9] sm:aspect-[3/1] overflow-hidden rounded-sm bg-graphite2">
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
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setIndex(i)}
              aria-label={`Слайд ${i + 1}`}
              className={`w-2 h-2 rounded-full transition-colors ${i === index ? "bg-amber" : "bg-white/50"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** Ряд небольших баннеров в сетке. */
export function MiniBannerRow({ slides }: { slides: Slide[] }) {
  if (slides.length === 0) return null;
  const cols = slides.length >= 3 ? "sm:grid-cols-3" : slides.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-1";

  return (
    <div className={`grid grid-cols-1 ${cols} gap-4`}>
      {slides.map((slide) => {
        const inner = (
          <div className="relative w-full aspect-[16/7] overflow-hidden rounded-sm bg-graphite2 group">
            <Image
              src={slide.imageUrl}
              alt={slide.title || ""}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(min-width: 640px) 33vw, 100vw"
            />
            {(slide.title || slide.subtitle) && (
              <div className="absolute inset-0 bg-gradient-to-t from-graphite/75 to-transparent flex flex-col justify-end p-4">
                {slide.title && <div className="font-display font-700 text-white text-base">{slide.title}</div>}
                {slide.subtitle && <div className="text-steelLight text-xs">{slide.subtitle}</div>}
              </div>
            )}
          </div>
        );
        return slide.linkUrl ? (
          <Link key={slide.id} href={slide.linkUrl}>
            {inner}
          </Link>
        ) : (
          <div key={slide.id}>{inner}</div>
        );
      })}
    </div>
  );
}
