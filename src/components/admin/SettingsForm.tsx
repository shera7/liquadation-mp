"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SettingsFormProps {
  settings: {
    siteName: string;
    contactPhone: string | null;
    contactEmail: string | null;
    contactTelegram: string | null;
    contactWhatsapp: string | null;
    telegramBotToken: string | null;
    telegramManagerChatId: string | null;    
    ndaBotToken: string | null;
    ndaBotUsername: string | null;
    ndaWebhookSecret: string | null;
  };
}

export default function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);
    const form = new FormData(e.currentTarget);

    const payload = {
      siteName: form.get("siteName") || "Актив.Каталог",
      contactPhone: form.get("contactPhone") || null,
      contactEmail: form.get("contactEmail") || null,
      contactTelegram: form.get("contactTelegram") || null,
      contactWhatsapp: form.get("contactWhatsapp") || null,
      telegramBotToken: form.get("telegramBotToken") || null,
      telegramManagerChatId: form.get("telegramManagerChatId") || null,
      ndaBotToken: form.get("ndaBotToken") || null,
      ndaBotUsername: form.get("ndaBotUsername") || null,
      ndaWebhookSecret: form.get("ndaWebhookSecret") || null,
    };

    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Не удалось сохранить настройки");
      return;
    }

    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white border border-line rounded-sm p-6 space-y-4">
        <h2 className="font-display font-700 text-graphite">Основное</h2>
        <Field label="Название сайта">
          <input name="siteName" defaultValue={settings.siteName} className="input" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Телефон">
            <input name="contactPhone" defaultValue={settings.contactPhone ?? ""} className="input" />
          </Field>
          <Field label="Email">
            <input name="contactEmail" defaultValue={settings.contactEmail ?? ""} className="input" />
          </Field>
          <Field label="Telegram (контакт)">
            <input name="contactTelegram" defaultValue={settings.contactTelegram ?? ""} className="input" />
          </Field>
          <Field label="WhatsApp">
            <input name="contactWhatsapp" defaultValue={settings.contactWhatsapp ?? ""} className="input" />
          </Field>
        </div>
      </div>

      <div className="bg-white border border-line rounded-sm p-6 space-y-4">
        <h2 className="font-display font-700 text-graphite">Telegram-уведомления о заявках</h2>
        <Field label="Токен бота">
          <input
            name="telegramBotToken"
            defaultValue={settings.telegramBotToken ?? ""}
            placeholder="123456:AA..."
            className="input"
          />
        </Field>
        <Field label="Chat ID менеджера">
          <input
            name="telegramManagerChatId"
            defaultValue={settings.telegramManagerChatId ?? ""}
            placeholder="123456789"
            className="input"
          />
        </Field>

        <details className="text-xs text-steel">
          <summary className="cursor-pointer text-amber-dark">Как получить эти значения?</summary>
          <ol className="list-decimal pl-4 mt-2 space-y-1">
            <li>В Telegram напишите @BotFather, команда /newbot — получите токен</li>
            <li>Менеджер пишет что угодно вашему новому боту</li>
            <li>Откройте в браузере: https://api.telegram.org/bot&lt;ТОКЕН&gt;/getUpdates</li>
            <li>Найдите в ответе "chat":{"{"}"id": ...{"}"} — это и есть Chat ID</li>
          </ol>
        </details>
      </div>

            <div className="bg-white border border-line rounded-sm p-6 space-y-4">
        <h2 className="font-display font-700 text-graphite">NDA-бот (отдельный бот для кода подтверждения)</h2>
        <Field label="Токен NDA-бота">
          <input name="ndaBotToken" defaultValue={settings.ndaBotToken ?? ""} placeholder="123456:BB..." className="input" />
        </Field>
        <Field label="Username NDA-бота (без @)">
          <input name="ndaBotUsername" defaultValue={settings.ndaBotUsername ?? ""} placeholder="my_nda_bot" className="input" />
        </Field>
        <Field label="Секрет вебхука (любая случайная строка)">
          <input name="ndaWebhookSecret" defaultValue={settings.ndaWebhookSecret ?? ""} placeholder="случайная-строка-32-символа" className="input" />
        </Field>
        <p className="text-xs text-steel">
          Это должен быть отдельный бот, не тот, что шлёт уведомления менеджеру. Создайте нового через @BotFather.
        </p>
      </div>
      
      {error && <div className="text-alert text-sm">{error}</div>}
      {saved && <div className="text-okgreen text-sm">Настройки сохранены</div>}

      <button
        type="submit"
        disabled={loading}
        className="bg-amber text-graphite font-semibold px-6 py-2.5 rounded-sm hover:bg-amber-dark disabled:opacity-60"
      >
        {loading ? "Сохранение..." : "Сохранить настройки"}
      </button>

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid #dddad1;
          border-radius: 2px;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
        }
        .input:focus {
          outline: none;
          box-shadow: 0 0 0 2px #e8a33d;
        }
      `}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-steel mb-1">{label}</span>
      {children}
    </label>
  );
}
