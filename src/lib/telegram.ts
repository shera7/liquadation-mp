// Отправка уведомлений менеджеру в Telegram при поступлении новой заявки.
//
// Как получить TELEGRAM_BOT_TOKEN:
// 1. Написать @BotFather в Telegram, команда /newbot
// 2. Скопировать токен в .env как TELEGRAM_BOT_TOKEN
//
// Как получить TELEGRAM_MANAGER_CHAT_ID:
// 1. Менеджер пишет что угодно созданному боту
// 2. Открыть https://api.telegram.org/bot<TOKEN>/getUpdates
// 3. Найти "chat":{"id": ...} — это и есть chat_id

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
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_MANAGER_CHAT_ID;

  if (!token || !chatId) {
    console.warn(
      "[telegram] TELEGRAM_BOT_TOKEN / TELEGRAM_MANAGER_CHAT_ID не заданы — уведомление не отправлено"
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
