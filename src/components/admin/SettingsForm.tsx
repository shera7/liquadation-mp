"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadProductImage } from "@/lib/uploadImage";

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
    faviconUrl: string | null;
    metaTitle: string | null;
    metaDescription: string | null;
    ogImageUrl: string | null;
    usdToUzsRate: number | null;
    usdToUzsRateDate: string | null;
    usdToUzsUpdatedAt: string | null;
    currencyRateSource: string;
    ndaMinPriceUsd: number | null;
  };
}

export default function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [faviconUrl, setFaviconUrl] = useState(settings.faviconUrl);
  const [ogImageUrl, setOgImageUrl] = useState(settings.ogImageUrl);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingOg, setUploadingOg] = useState(false);

  const [rateSource, setRateSource] = useState(settings.currencyRateSource);
  const [manualRate, setManualRate] = useState(settings.usdToUzsRate?.toString() ?? "");
  const [refreshingRate, setRefreshingRate] = useState(false);
  const [currentRate, setCurrentRate] = useState(settings.usdToUzsRate);

  async function handleRefreshRate() {
    setRefreshingRate(true);
    const res = await fetch("/api/admin/exchange-rate/refresh", { method: "POST" });
    const data = await res.json();
    setRefreshingRate(false);
    if (res.ok) {
      setCurrentRate(data.rate);
      router.refresh();
    }
  }

  async function handleFaviconUpload(file: File | null) {
    if (!file) return;
    setUploadingFavicon(true);
    try {
      const url = await uploadProductImage(file);
      setFaviconUrl(url);
    } catch (e: any) {
      setError(e.message || "Не удалось загрузить favicon");
    }
    setUploadingFavicon(false);
  }

  async function handleOgUpload(file: File | null) {
    if (!file) return;
    setUploadingOg(true);
    try {
      const url = await uploadProductImage(file);
      setOgImageUrl(url);
    } catch (e: any) {
      setError(e.message || "Не удалось загрузить изображение");
    }
    setUploadingOg(false);
  }

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
      metaTitle: form.get("metaTitle") || null,
      metaDescription: form.get("metaDescription") || null,
      faviconUrl,
      ogImageUrl,
      currencyRateSource: rateSource,
      ...(rateSource === "manual" ? { usdToUzsRate: Number(manualRate) || null } : {}),
      ndaMinPriceUsd: form.get("ndaMinPriceUsd") ? Number(form.get("ndaMinPriceUsd")) : null,
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
        <h2 className="font-display font-700 text-graphite">Курс валюты (USD → UZS)</h2>

        <div className="flex items-center justify-between bg-concrete rounded-sm p-4">
          <div>
            <div className="text-2xl font-display font-800 text-graphite">
              {currentRate ? `${new Intl.NumberFormat("ru-RU").format(currentRate)} сум` : "—"}
            </div>
            <div className="text-xs text-steel mt-1">
              {settings.usdToUzsRateDate ? `Курс ЦБ РУз на ${settings.usdToUzsRateDate}` : "Курс ещё не загружен"}
            </div>
          </div>
          <button
            type="button"
            onClick={handleRefreshRate}
            disabled={refreshingRate}
            className="text-xs bg-graphite text-white px-4 py-2 rounded-sm hover:bg-graphite2 disabled:opacity-60"
          >
            {refreshingRate ? "Обновление..." : "Обновить сейчас"}
          </button>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <label className="flex items-center gap-1.5">
            <input type="radio" checked={rateSource === "auto"} onChange={() => setRateSource("auto")} className="accent-amber" />
            Автоматически (ЦБ РУз)
          </label>
          <label className="flex items-center gap-1.5">
            <input type="radio" checked={rateSource === "manual"} onChange={() => setRateSource("manual")} className="accent-amber" />
            Задать вручную
          </label>
        </div>

        {rateSource === "manual" && (
          <Field label="Курс USD → UZS вручную">
            <input
              type="number"
              step="0.01"
              value={manualRate}
              onChange={(e) => setManualRate(e.target.value)}
              placeholder="12700"
              className="input"
            />
          </Field>
        )}

        <p className="text-xs text-steel">
          Курс автоматически обновляется раз в сутки с сайта Центробанка Узбекистана (cbu.uz) и используется для показа цены в обеих валютах на сайте.
        </p>
      </div>

      <div className="bg-white border border-line rounded-sm p-6 space-y-4">
        <h2 className="font-display font-700 text-graphite">SEO и брендинг</h2>

        <Field label="Meta title (заголовок в поисковиках и вкладке браузера)">
          <input
            name="metaTitle"
            defaultValue={settings.metaTitle ?? ""}
            placeholder={`${settings.siteName} — Имущество и оборудование по специальным ценам`}
            className="input"
          />
        </Field>
        <Field label="Meta description (описание для поисковиков)">
          <textarea
            name="metaDescription"
            defaultValue={settings.metaDescription ?? ""}
            rows={2}
            placeholder="Оборудование, материалы, запчасти и другие активы в наличии..."
            className="input"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="block text-xs font-medium text-steel mb-1">Favicon (иконка вкладки, квадратная, PNG)</span>
            <div className="flex items-center gap-3">
              {faviconUrl && (
                <img src={faviconUrl} alt="Favicon" className="w-8 h-8 border border-line rounded-sm object-cover" />
              )}
              <label className="text-xs border border-dashed border-line rounded-sm px-3 py-1.5 cursor-pointer hover:border-amber text-steel">
                {uploadingFavicon ? "Загрузка..." : faviconUrl ? "Заменить" : "Загрузить"}
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingFavicon}
                  onChange={(e) => handleFaviconUpload(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div>
            <span className="block text-xs font-medium text-steel mb-1">OG-изображение (превью при шаринге в соцсетях)</span>
            <div className="flex items-center gap-3">
              {ogImageUrl && (
                <img src={ogImageUrl} alt="OG" className="w-14 h-8 border border-line rounded-sm object-cover" />
              )}
              <label className="text-xs border border-dashed border-line rounded-sm px-3 py-1.5 cursor-pointer hover:border-amber text-steel">
                {uploadingOg ? "Загрузка..." : ogImageUrl ? "Заменить" : "Загрузить"}
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingOg}
                  onChange={(e) => handleOgUpload(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-line rounded-sm p-6 space-y-4">
        <h2 className="font-display font-700 text-graphite">Порог NDA</h2>
        <Field label="Минимальная цена товара для обязательного NDA (в USD)">
          <input
            name="ndaMinPriceUsd"
            type="number"
            step="0.01"
            defaultValue={settings.ndaMinPriceUsd ?? ""}
            placeholder="Оставьте пустым — NDA требуется для всех товаров"
            className="input"
          />
        </Field>
        <p className="text-xs text-steel">
          Заявки на товары дешевле указанной суммы не будут требовать подписания NDA. Цена товара в UZS конвертируется по текущему курсу.
        </p>
      </div>
      
      <div className="bg-white border border-line rounded-sm p-6 space-y-4">
        <h2 className="font-display font-700 text-graphite">Telegram-уведомления о заявках</h2>
        <Field label="Токен бота">
          <input name="telegramBotToken" defaultValue={settings.telegramBotToken ?? ""} placeholder="123456:AA..." className="input" />
        </Field>
        <Field label="Chat ID менеджера">
          <input name="telegramManagerChatId" defaultValue={settings.telegramManagerChatId ?? ""} placeholder="123456789" className="input" />
        </Field>
        <details className="text-xs text-steel">
          <summary className="cursor-pointer text-amber-dark">Как получить эти значения?</summary>
          <ol className="list-decimal pl-4 mt-2 space-y-1">
            <li>В Telegram напишите @BotFather, команда /newbot — получите токен</li>
            <li>Менеджер пишет что угодно вашему новому боту</li>
            <li>Откройте: https://api.telegram.org/bot&lt;ТОКЕН&gt;/getUpdates</li>
            <li>Найдите "chat":{"{"}"id": ...{"}"} — это Chat ID</li>
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
        <Field label="Секрет вебхука">
          <input name="ndaWebhookSecret" defaultValue={settings.ndaWebhookSecret ?? ""} className="input" />
        </Field>
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
