import { getSiteSettings } from "./settings";

interface RequestNotificationPayload {
  requestId: string;
  type: "PRODUCT" | "GENERAL";
  productTitle?: string;
  price?: string;
  clientName: string;
  company?: string | null;
  phone: string;
  telegram?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  quantity?: number | null;
  desiredPrice?: string | null;
  contactMethod?: string | null;
  interestedCategory?: string | null;
  budget?: string | null;
  comment?: string | null;
  productUrl?: string;
  adminUrl?: string;
}

const CONTACT_METHOD_LABELS: Record<string, string> = {
  phone: "Звонок",
  telegram: "Telegram",
  whatsapp: "WhatsApp",
  email: "Email",
};

function escapeHtml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function notifyManagerNewRequest(payload: RequestNotificationPayload) {
  const settings = await getSiteSettings();
  const token = settings.telegramBotToken;
  const chatId = settings.telegramManagerChatId;

  if (!token || !chatId) {
    console.warn(
      "[telegram] Токен бота или Chat ID не заданы — настройте их в Админка → Настройки"
    );
    return;
  }

  const lines: string[] = [`<b>Новая заявка #${payload.requestId.slice(-6)}</b>`, ""];

  if (payload.type === "PRODUCT") {
    lines.push(`<b>Товар:</b> ${escapeHtml(payload.productTitle ?? "—")}`);
    if (payload.price) lines.push(`<b>Цена:</b> ${escapeHtml(payload.price)}`);
  } else {
    lines.push(`<b>Тип:</b> Общая заявка`);
    if (payload.interestedCategory)
      lines.push(`<b>Категория интереса:</b> ${escapeHtml(payload.interestedCategory)}`);
    if (payload.budget) lines.push(`<b>Бюджет:</b> ${escapeHtml(payload.budget)}`);
  }

  lines.push("");
  lines.push(`<b>Клиент:</b> ${escapeHtml(payload.clientName)}`);
  if (payload.company) lines.push(`<b>Компания:</b> ${escapeHtml(payload.company)}`);
  lines.push(`<b>Телефон:</b> ${escapeHtml(payload.phone)}`);
  if (payload.telegram) lines.push(`<b>Telegram/WhatsApp:</b> ${escapeHtml(payload.telegram)}`);
  if (payload.whatsapp) lines.push(`<b>WhatsApp:</b> ${escapeHtml(payload.whatsapp)}`);
  if (payload.email) lines.push(`<b>Email:</b> ${escapeHtml(payload.email)}`);
  if (payload.quantity) lines.push(`<b>Количество:</b> ${payload.quantity}`);
  if (payload.desiredPrice) lines.push(`<b>Желаемая цена:</b> ${escapeHtml(payload.desiredPrice)}`);
  if (payload.contactMethod) {
    lines.push(
      `<b>Способ связи:</b> ${CONTACT_METHOD_LABELS[payload.contactMethod] ?? payload.contactMethod}`
    );
  }
  if (payload.comment) lines.push(`<b>Комментарий:</b> ${escapeHtml(payload.comment)}`);

  const linkLines: string[] = [];
  if (payload.productUrl) linkLines.push(`<a href="${payload.productUrl}">Открыть товар</a>`);
  if (payload.adminUrl) linkLines.push(`<a href="${payload.adminUrl}">Открыть в CRM</a>`);

  if (linkLines.length > 0) {
    lines.push("");
    lines.push(linkLines.join("  ·  "));
  }

  const text = lines.join("\n");

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[telegram] Ошибка отправки уведомления:", body);
  }
}
