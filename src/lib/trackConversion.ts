"use client";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    __googleAdsConversionSendTo?: string;
  }
}

/**
 * Событие конверсии "заявка отправлена" — единственная точка, где считается
 * CR для Google Ads / Meta Ads. eventId используется и здесь (браузерное
 * событие), и на сервере (Meta Conversions API) для дедупликации одного и
 * того же события, отправленного дважды — так рекомендует сама Meta.
 */
export function trackLeadConversion(eventId: string) {
  if (typeof window === "undefined") return;

  if (window.gtag) {
    window.gtag("event", "generate_lead", { event_id: eventId });
    const sendTo = window.__googleAdsConversionSendTo;
    if (sendTo) {
      window.gtag("event", "conversion", { send_to: sendTo, event_id: eventId });
    }
  }

  if (window.fbq) {
    window.fbq("track", "Lead", {}, { eventID: eventId });
  }
}

/** Просмотр карточки товара — важно для ремаркетинга и обучения алгоритмов,
 *  раз рекламные кампании ведут именно на карточки товаров. */
export function trackViewProduct(product: { id: string; title: string; price: number | null; currency: string }) {
  if (typeof window === "undefined") return;

  if (window.gtag) {
    window.gtag("event", "view_item", {
      currency: product.currency,
      value: product.price ?? undefined,
      items: [{ item_id: product.id, item_name: product.title, price: product.price ?? undefined }],
    });
  }

  if (window.fbq) {
    window.fbq("track", "ViewContent", {
      content_ids: [product.id],
      content_name: product.title,
      content_type: "product",
      currency: product.currency,
      value: product.price ?? undefined,
    });
  }
}
