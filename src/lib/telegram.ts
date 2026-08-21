import { getSiteSettings } from "./settings";

interface RequestNotificationPayload {
  requestId: string;
  productTitle?: string;
  price?: string;
  clientName: string;
  company?: string | null;
  phone: string;
  quantity?: number | null;
  comment?: string | null;
  productUrl?: string;
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

  const lines = [
    `<b>Новая заявка #${payload.requestId.slice(-6)}</b>`,
    "",
    payload.productTitle ? `Товар: ${payload.productTitle}` : "Тип: Общая заявка",
    payload.price ? `Цена: ${payload.price}` : undefined,
    `Клиент: ${payload.clientName}`,
    payload.company ? `Компания: ${payload.company}` : undefined,
    `Телефон: ${payload.phone}`,
    payload.quantity ? `Количество: ${payload.quantity}` : undefined,
    payload.comment ? `Комментарий: ${payload.comment}` : undefined,
  ].filter(Boolean);

  if (payload.productUrl) {
    lines.push("", `<a href="${payload.productUrl}">Открыть заявку</a>`);
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
