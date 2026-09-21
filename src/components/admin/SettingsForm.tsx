"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { uploadSiteImage } from "@/lib/uploadSiteImage";

interface Recipient {
  id: string;
  chatId: string;
  label: string | null;
  active: boolean;
}

interface SettingsFormProps {
  settings: {
    siteName: string;
    contactPhone: string | null;
    contactEmail: string | null;
    contactTelegram: string | null;
    contactWhatsapp: string | null;
    contactAddress: string | null;
    telegramBotToken: string | null;
    telegramManagerChatId: string | null;
    ndaBotToken: string | null;
    ndaBotUsername: string | null;
    ndaWebhookSecret: string | null;
    ndaMinPriceUsd: number | null;
    faviconUrl: string | null;
    metaTitle: string | null;
    metaDescription: string | null;
    ogImageUrl: string | null;
    managerWebhookSecret: string | null;
    ga4MeasurementId: string | null;
    googleAdsConversionId: string | null;
    googleAdsConversionLabel: string | null;
    metaPixelId: string | null;
    metaConversionsApiToken: string | null;
    metaTestEventCode: string | null;
  };
}

const TABS = [
  { id: "general", label: "Основное" },
  { id: "seo", label: "SEO и брендинг" },
  { id: "currency", label: "Курс валюты" },
  { id: "telegram", label: "Telegram-уведомления" },
  { id: "nda", label: "NDA" },
  { id: "ads", label: "Реклама и аналитика" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("general");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [faviconUrl, setFaviconUrl] = useState(settings.faviconUrl);
  const [ogImageUrl, setOgImageUrl] = useState(settings.ogImageUrl);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingOg, setUploadingOg] = useState(false);

  const [rateSource, setRateSource] = useState("auto");
  const [manualRate, setManualRate] = useState("");
  const [refreshingRate, setRefreshingRate] = useState(false);
  const [currentRate, setCurrentRate] = useState<number | null>(null);
  const [rateDate, setRateDate] = useState<string | null>(null);

  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [recipientsLoading, setRecipientsLoading] = useState(true);
  const [newChatId, setNewChatId] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [addingRecipient, setAddingRecipient] = useState(false);

  useEffect(() => {
    fetch("/api/admin/telegram-recipients")
      .then((r) => r.json())
      .then((data) => {
        setRecipients(data);
        setRecipientsLoading(false);
      });
  }, []);

  async function handleAddRecipient(e: React.FormEvent) {
    e.preventDefault();
    if (!newChatId.trim()) return;
    setAddingRecipient(true);

    const res = await fetch("/api/admin/telegram-recipients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId: newChatId, label: newLabel }),
    });

    setAddingRecipient(false);

    if (res.ok) {
      const created = await res.json();
      setRecipients((prev) => [...prev, created]);
      setNewChatId("");
      setNewLabel("");
    }
  }

  async function handleToggleRecipient(id: string, active: boolean) {
    setRecipients((prev) => prev.map((r) => (r.id === id ? { ...r, active } : r)));
    await fetch(`/api/admin/telegram-recipients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
  }

  async function handleDeleteRecipient(id: string) {
    if (!confirm("Удалить получателя уведомлений?")) return;
    setRecipients((prev) => prev.filter((r) => r.id !== id));
    await fetch(`/api/admin/telegram-recipients/${id}`, { method: "DELETE" });
  }

  async function handleFaviconUpload(file: File | null) {
    if (!file) return;
    setUploadingFavicon(true);
    try {
      const url = await uploadSiteImage(file);
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
      const url = await uploadSiteImage(file);
      setOgImageUrl(url);
    } catch (e: any) {
      setError(e.message || "Не удалось загрузить изображение");
    }
    setUploadingOg(false);
  }

  async function handleRefreshRate() {
    setRefreshingRate(true);
    const res = await fetch("/api/admin/exchange-rate/refresh", { method: "POST" });
    const data = await res.json();
    setRefreshingRate(false);
    if (res.ok) {
      setCurrentRate(data.rate);
      setRateDate(data.date);
      router.refresh();
    }
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
      contactAddress: form.get("contactAddress") || null,
      telegramBotToken: form.get("telegramBotToken") || null,
      telegramManagerChatId: form.get("telegramManagerChatId") || null,
      ndaBotToken: form.get("ndaBotToken") || null,
      ndaBotUsername: form.get("ndaBotUsername") || null,
      ndaWebhookSecret: form.get("ndaWebhookSecret") || null,
      ndaMinPriceUsd: form.get("ndaMinPriceUsd") ? Number(form.get("ndaMinPriceUsd")) : null,
      metaTitle: form.get("metaTitle") || null,
      metaDescription: form.get("metaDescription") || null,
      faviconUrl,
      ogImageUrl,
      currencyRateSource: rateSource,
      ...(rateSource === "manual" ? { usdToUzsRate: Number(manualRate) || null } : {}),
      managerWebhookSecret: form.get("managerWebhookSecret") || null,
      ga4MeasurementId: form.get("ga4MeasurementId") || null,
      googleAdsConversionId: form.get("googleAdsConversionId") || null,
      googleAdsConversionLabel: form.get("googleAdsConversionLabel") || null,
      metaPixelId: form.get("metaPixelId") || null,
      ...(form.get("metaConversionsApiToken")
        ? { metaConversionsApiToken: form.get("metaConversionsApiToken") }
        : {}),
      metaTestEventCode: form.get("metaTestEventCode") || null,
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
      <div className="flex gap-1 border-b border-line ">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id
                ? "border-amber text-graphite"
                : "border-transparent text-steel hover:text-graphite"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={tab === "general" ? "block" : "hidden"}>
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
            <Field label="Адрес">
              <input name="contactAddress" defaultValue={settings.contactAddress ?? ""} className="input" placeholder="Ташкент, Узбекистан" />
            </Field>
          </div>
        </div>
      </div>

      <div className={tab === "seo" ? "block" : "hidden"}>
        <div className="bg-white border border-line rounded-sm p-6 space-y-4">
          <h2 className="font-display font-700 text-graphite">SEO и брендинг</h2>
          <Field label="Meta title">
            <input
              name="metaTitle"
              defaultValue={settings.metaTitle ?? ""}
              placeholder={`${settings.siteName} — Имущество и оборудование по специальным ценам`}
              className="input"
            />
          </Field>
          <Field label="Meta description">
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
              <span className="block text-xs font-medium text-steel mb-1">Favicon</span>
              <div className="flex items-center gap-3">
                {faviconUrl && <img src={faviconUrl} alt="Favicon" className="w-8 h-8 border border-line rounded-sm object-cover" />}
                <label className="text-xs border border-dashed border-line rounded-sm px-3 py-1.5 cursor-pointer hover:border-amber text-steel">
                  {uploadingFavicon ? "Загрузка..." : faviconUrl ? "Заменить" : "Загрузить"}
                  <input type="file" accept="image/*" disabled={uploadingFavicon} onChange={(e) => handleFaviconUpload(e.target.files?.[0] ?? null)} className="hidden" />
                </label>
              </div>
            </div>
            <div>
              <span className="block text-xs font-medium text-steel mb-1">OG-изображение</span>
              <div className="flex items-center gap-3">
                {ogImageUrl && <img src={ogImageUrl} alt="OG" className="w-14 h-8 border border-line rounded-sm object-cover" />}
                <label className="text-xs border border-dashed border-line rounded-sm px-3 py-1.5 cursor-pointer hover:border-amber text-steel">
                  {uploadingOg ? "Загрузка..." : ogImageUrl ? "Заменить" : "Загрузить"}
                  <input type="file" accept="image/*" disabled={uploadingOg} onChange={(e) => handleOgUpload(e.target.files?.[0] ?? null)} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={tab === "currency" ? "block" : "hidden"}>
        <div className="bg-white border border-line rounded-sm p-6 space-y-4">
          <h2 className="font-display font-700 text-graphite">Курс валюты (USD → UZS)</h2>
          <div className="flex items-center justify-between bg-concrete rounded-sm p-4">
            <div>
              <div className="text-2xl font-display font-800 text-graphite">
                {currentRate ? `${new Intl.NumberFormat("ru-RU").format(currentRate)} сум` : "—"}
              </div>
              <div className="text-xs text-steel mt-1">{rateDate ? `Курс ЦБ РУз на ${rateDate}` : "Нажмите «Обновить», чтобы загрузить курс"}</div>
            </div>
            <button type="button" onClick={handleRefreshRate} disabled={refreshingRate} className="text-xs bg-graphite text-white px-4 py-2 rounded-sm hover:bg-graphite2 disabled:opacity-60">
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
              <input type="number" step="0.01" value={manualRate} onChange={(e) => setManualRate(e.target.value)} placeholder="12700" className="input" />
            </Field>
          )}
        </div>
      </div>

      <div className={tab === "telegram" ? "block" : "hidden"}>
        <div className="bg-white border border-line rounded-sm p-6 space-y-4">
          <h2 className="font-display font-700 text-graphite">Telegram-уведомления о заявках</h2>
          <Field label="Токен бота">
            <input name="telegramBotToken" defaultValue={settings.telegramBotToken ?? ""} placeholder="123456:AA..." className="input" />
          </Field>
          <Field label="Секрет вебхука бота-уведомителя (для привязки Telegram сотрудников)">
            <input name="managerWebhookSecret" defaultValue={settings.managerWebhookSecret ?? ""} className="input" />
          </Field>

          <details className="text-xs text-steel">
            <summary className="cursor-pointer text-amber-dark">Как получить токен бота?</summary>
            <ol className="list-decimal pl-4 mt-2 space-y-1">
              <li>В Telegram напишите @BotFather, команда /newbot — получите токен</li>
            </ol>
          </details>

          <div className="border-t border-line pt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-graphite">Получатели уведомлений</span>
            </div>
            <p className="text-xs text-steel mb-3">
              Все включённые получатели получат уведомление о каждой новой заявке. Chat ID можно узнать так: менеджер пишет что угодно вашему боту, затем откройте
              в браузере https://api.telegram.org/bot&lt;ТОКЕН&gt;/getUpdates и найдите "chat":{"{"}"id": ...{"}"}.
            </p>

            {recipientsLoading ? (
              <div className="text-xs text-steel">Загрузка...</div>
            ) : (
              <>
                <div className="flex gap-2 flex-wrap mb-3">
                  <input
                    value={newChatId}
                    onChange={(e) => setNewChatId(e.target.value)}
                    placeholder="Chat ID, напр. 123456789"
                    className="flex-1 min-w-[140px] border border-line rounded-sm px-3 py-2 text-sm"
                  />
                  <input
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="Имя (необязательно)"
                    className="flex-1 min-w-[160px] border border-line rounded-sm px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddRecipient}
                    disabled={addingRecipient}
                    className="bg-graphite text-white font-semibold px-4 py-2 rounded-sm text-sm hover:bg-graphite2 disabled:opacity-60"
                  >
                    + Добавить
                  </button>
                </div>

                <div className="border border-line rounded-sm divide-y divide-line">
                  {recipients.map((r) => (
                    <div key={r.id} className="px-3 py-2 flex items-center justify-between text-sm">
                      <div>
                        <span className="font-mono text-graphite text-xs">{r.chatId}</span>
                        {r.label && <span className="text-xs text-steel ml-2">{r.label}</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 text-xs text-steel cursor-pointer">
                          <input type="checkbox" checked={r.active} onChange={(e) => handleToggleRecipient(r.id, e.target.checked)} className="accent-amber" />
                          Активен
                        </label>
                        <button type="button" onClick={() => handleDeleteRecipient(r.id)} className="text-xs text-alert hover:underline">
                          Удалить
                        </button>
                      </div>
                    </div>
                  ))}
                  {recipients.length === 0 && <div className="px-3 py-3 text-center text-steel text-xs">Получателей пока нет</div>}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={tab === "nda" ? "block" : "hidden"}>
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
        </div>
      </div>

      <div className={tab === "ads" ? "block" : "hidden"}>
        <div className="bg-white border border-line rounded-sm p-6 space-y-5">
          <div>
            <h2 className="font-display font-700 text-graphite">Реклама и аналитика</h2>
          </div>

          <details open className="bg-concrete rounded-sm p-4 text-sm text-graphite space-y-3">
            <summary className="cursor-pointer font-semibold text-amber-dark">
              Как это работает целиком — прочитайте перед настройкой
            </summary>

            <div>
              <div className="font-semibold mb-1">1. Что вообще здесь настраивается</div>
              <p className="text-steel">
                Четыре независимых, но связанных инструмента: <b>GA4</b> (общая аналитика сайта),
                <b> Google Ads</b> (реклама в поиске/сетях Google), <b>Meta Pixel</b> (реклама в
                Facebook/Instagram) и <b>Meta Conversions API</b> (серверный дубль пикселя). Можно
                настроить только Google, только Meta, или оба сразу — они не зависят друг от друга.
              </p>
            </div>

            <div>
              <div className="font-semibold mb-1">2. Что именно считается результатом (конверсией)</div>
              <p className="text-steel">
                В системе зашито одно событие-конверсия: <b>клиент отправил заявку</b> — не важно,
                по одному товару, на несколько товаров сразу, или общую заявку без товара. Как только
                заявка успешно создаётся — сайт автоматически шлёт сигнал во все подключённые
                инструменты сразу (Google Ads, GA4, Meta). Отдельно настраивать «какое действие
                считать конверсией» в самих Google Ads/Meta не нужно — просто выберите там уже
                готовое событие с названием «заявка»/generate_lead/Lead при создании кампании.
              </p>
            </div>

            <div>
              <div className="font-semibold mb-1">3. Просмотр карточки товара — отдельный, более ранний сигнал</div>
              <p className="text-steel">
                Каждый раз, когда посетитель открывает страницу конкретного товара, тоже отправляется
                сигнал (view_item в Google, ViewContent в Meta) — ещё не заявка, а просто «интерес».
                Это нужно для <b>ремаркетинга</b>: например, можно настроить в Meta/Google Ads кампанию
                «показать рекламу тем, кто смотрел карточки товаров, но не оставил заявку за 7 дней».
              </p>
            </div>

            <div>
              <div className="font-semibold mb-1">4. Зачем нужен именно Conversions API, а не только пиксель</div>
              <p className="text-steel">
                Браузерный пиксель Meta теряет часть событий из-за блокировщиков рекламы и настроек
                приватности в Safari/iOS — по разным оценкам, до трети сигналов может не доходить.
                Conversions API — тот же сигнал, но отправленный напрямую с сервера, в обход браузера.
                Оба события помечены одним и тем же ID (event_id/eventID) — Meta сама понимает, что
                это одно и то же событие, и не считает его дважды. Без токена Conversions API реклама
                в Meta всё равно будет работать, но менее точно оптимизироваться под заявки.
              </p>
            </div>

            <div>
              <div className="font-semibold mb-1">5. Метки UTM/gclid/fbclid — при чём тут CRM</div>
              <p className="text-steel">
                Когда человек переходит по рекламной ссылке (с параметрами вида ?utm_source=google
                или автоматическими ?gclid=.../?fbclid=...), сайт запоминает это на 30 дней. Если он
                оставит заявку — даже не в первый визит — в карточке заявки в админке будет видно,
                из какого канала он пришёл. Это отдельно от пикселей и работает всегда, даже без них.
              </p>
            </div>

            <div>
              <div className="font-semibold mb-1">6. Порядок настройки</div>
              <ol className="list-decimal pl-4 text-steel space-y-1">
                <li>Создайте счётчик GA4 и/или кампанию в Google Ads / Business Manager в Meta — на их стороне</li>
                <li>Скопируйте ID/токены оттуда (см. подсказки под каждым полем ниже) и вставьте сюда</li>
                <li>Сохраните настройки на этой странице</li>
                <li>Проверьте, что события доходят (см. пункт 7 ниже) — до запуска платного трафика</li>
                <li>В Google Ads/Meta при создании кампании выберите цель «конверсии» и укажите
                  событие «заявка» (Google) / «Lead» (Meta) в качестве оптимизируемого действия</li>
              </ol>
            </div>

            <div>
              <div className="font-semibold mb-1">7. Как проверить, что всё работает, до запуска рекламы</div>
              <ul className="list-disc pl-4 text-steel space-y-1">
                <li><b>GA4:</b> Google Analytics → Отчёты → Реальное время — откройте сайт в отдельной вкладке, походите по каталогу, должны появляться события</li>
                <li><b>Google Ads:</b> расширение браузера «Google Tag Assistant» — покажет, сработал ли тег конверсии на заявке</li>
                <li><b>Meta:</b> Events Manager → вкладка «Тестовые события» (нужен «Meta Test Event Code» — поле ниже) — отправьте тестовую заявку, событие Lead должно появиться и с пометкой «Браузер», и с пометкой «Сервер»</li>
              </ul>
            </div>
          </details>

          <div className="border-t border-line pt-4">
            <div className="text-sm font-semibold text-graphite mb-1">Google — GA4 и Google Ads</div>
            <p className="text-xs text-steel mb-3">
              ID измерения GA4: Google Analytics → Администратор → Потоки данных → выберите поток → вверху страницы.
              Начинается с «G-». Conversion ID и метка: Google Ads → Цели → Конверсии → откройте действие-конверсию
              «заявка» → раздел «Тег» → «Настроить вручную» — там будут оба значения (AW-XXXXXXXXX и текст после слэша).
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="GA4 Measurement ID">
                <input name="ga4MeasurementId" defaultValue={settings.ga4MeasurementId ?? ""} placeholder="G-XXXXXXXXXX" className="input" />
              </Field>
              <Field label="Google Ads Conversion ID">
                <input name="googleAdsConversionId" defaultValue={settings.googleAdsConversionId ?? ""} placeholder="AW-XXXXXXXXX" className="input" />
              </Field>
              <Field label="Google Ads Conversion Label">
                <input name="googleAdsConversionLabel" defaultValue={settings.googleAdsConversionLabel ?? ""} placeholder="AbC-D1efGhIjKLmnOp" className="input" />
              </Field>
            </div>
          </div>

          <div className="border-t border-line pt-4">
            <div className="text-sm font-semibold text-graphite mb-1">Meta (Facebook / Instagram)</div>
            <p className="text-xs text-steel mb-3">
              ID пикселя: Meta Business Suite → Events Manager → выберите источник данных → ID указан вверху страницы.
              Токен Conversions API: там же → «Настройки» → «Conversions API» → «Сгенерировать токен доступа»
              (это секрет, храните так же, как пароль — важен для доставки событий, которые блокирует браузер).
              Код тестового события — необязателен, нужен только чтобы проверить события во вкладке «Тестовые события»
              перед запуском рекламы.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Meta Pixel ID">
                <input name="metaPixelId" defaultValue={settings.metaPixelId ?? ""} placeholder="1234567890123456" className="input" />
              </Field>
              <Field label="Meta Test Event Code (необязательно)">
                <input name="metaTestEventCode" defaultValue={settings.metaTestEventCode ?? ""} placeholder="TEST12345" className="input" />
              </Field>
            </div>
            <div className="mt-3">
              <Field label="Meta Conversions API — токен доступа">
                <input
                  name="metaConversionsApiToken"
                  type="password"
                  placeholder={settings.metaConversionsApiToken ? "Токен сохранён — оставьте пустым, чтобы не менять" : "Вставьте токен из Events Manager"}
                  className="input"
                />
              </Field>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="text-alert text-sm">{error}</div>}
      {saved && <div className="text-okgreen text-sm">Настройки сохранены</div>}

      <button type="submit" disabled={loading} className="bg-amber text-graphite font-semibold px-6 py-2.5 rounded-sm hover:bg-amber-dark disabled:opacity-60">
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
