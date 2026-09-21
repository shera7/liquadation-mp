"use client";

const STORAGE_KEY = "attribution_data";
const ATTRIBUTION_DAYS = 30; // окно атрибуции "первый клик"

export interface AttributionData {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  gclid?: string;
  fbclid?: string;
}

/**
 * Читает UTM/gclid/fbclid из текущего URL и, если они есть, сохраняет как
 * атрибуцию "первого касания" на ATTRIBUTION_DAYS дней. Если в URL меток
 * нет — оставляет уже сохранённые (не затирает атрибуцию последующими
 * визитами без меток, как и положено при first-touch attribution).
 * Вызывается один раз при заходе на сайт (см. AttributionCapture.tsx).
 */
export function captureAttribution() {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const fromUrl: AttributionData = {
    utmSource: params.get("utm_source") || undefined,
    utmMedium: params.get("utm_medium") || undefined,
    utmCampaign: params.get("utm_campaign") || undefined,
    utmContent: params.get("utm_content") || undefined,
    utmTerm: params.get("utm_term") || undefined,
    gclid: params.get("gclid") || undefined,
    fbclid: params.get("fbclid") || undefined,
  };

  const hasAny = Object.values(fromUrl).some(Boolean);
  if (!hasAny) return;

  try {
    const expiresAt = Date.now() + ATTRIBUTION_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ data: fromUrl, expiresAt }));
  } catch {}
}

/** Возвращает сохранённую атрибуцию (если не истёк срок), для отправки вместе с заявкой. */
export function getAttribution(): AttributionData {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const { data, expiresAt } = JSON.parse(raw);
    if (Date.now() > expiresAt) {
      localStorage.removeItem(STORAGE_KEY);
      return {};
    }
    return data ?? {};
  } catch {
    return {};
  }
}
