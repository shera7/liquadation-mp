import crypto from "crypto";
import { getSiteSettings } from "@/lib/settings";

function sha256(value: string) {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

interface LeadEventParams {
  eventId: string;
  eventSourceUrl: string;
  clientIp?: string | null;
  userAgent?: string | null;
  email?: string | null;
  phone?: string | null;
  fbclid?: string | null;
}

/**
 * Отправляет событие "Lead" в Meta Conversions API — серверный аналог
 * события в браузерном пикселе, с тем же eventId (для дедупликации).
 * Без этого события Meta теряет заметную часть сигналов из-за блокировщиков
 * рекламы и ограничений iOS/Safari на стороне браузера.
 * Не блокирует и не бросает исключение наружу — рекламная аналитика не
 * должна ломать основной сценарий отправки заявки.
 */
export async function sendMetaLeadEvent(params: LeadEventParams) {
  try {
    const settings = await getSiteSettings();
    const pixelId = settings.metaPixelId;
    const token = settings.metaConversionsApiToken;
    if (!pixelId || !token) return;

    const userData: Record<string, unknown> = {};
    if (params.email) userData.em = [sha256(params.email)];
    if (params.phone) userData.ph = [sha256(params.phone.replace(/[^\d]/g, ""))];
    if (params.clientIp) userData.client_ip_address = params.clientIp;
    if (params.userAgent) userData.client_user_agent = params.userAgent;
    if (params.fbclid) userData.fbc = `fb.1.${Date.now()}.${params.fbclid}`;

    const body = {
      data: [
        {
          event_name: "Lead",
          event_time: Math.floor(Date.now() / 1000),
          event_id: params.eventId,
          event_source_url: params.eventSourceUrl,
          action_source: "website",
          user_data: userData,
        },
      ],
      ...(settings.metaTestEventCode ? { test_event_code: settings.metaTestEventCode } : {}),
    };

    await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });
  } catch (e) {
    console.error("[metaCapi] Не удалось отправить событие Lead:", e);
  }
}
