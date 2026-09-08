"use client";

import { useEffect, useState } from "react";
import NdaGate from "./NdaGate";

interface RequestFormProps {
  productId: string;
  productTitle: string;
  mode?: "request" | "price" | "question";
}

const MODE_LABELS: Record<string, string> = {
  request: "Оставить заявку",
  price: "Запросить цену",
  question: "Задать вопрос",
};

interface StoredNda {
  acceptanceId: string;
  telegramId: string;
  telegramUsername?: string | null;
  ndaVersion: string;
}

interface PaymentTerm {
  id: string;
  label: string;
}

export default function RequestForm({ productId, productTitle, mode = "request" }: RequestFormProps) {
  const [stage, setStage] = useState<"closed" | "nda" | "form">("closed");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [ndaData, setNdaData] = useState<StoredNda | null>(null);
  const [formLoadedAt] = useState(() => Date.now());
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([]);

  useEffect(() => {
    if (stage !== "form") return;
    fetch(`/api/payment-terms?productId=${productId}`)
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setPaymentTerms(data))
      .catch(() => {});
  }, [stage, productId]);

  async function handleOpen() {
    // NDA нужен только для основной заявки по товару, не для "запросить цену"/"вопрос"
    if (mode !== "request") {
      setStage("form");
      return;
    }

    const stored = localStorage.getItem("nda_acceptance");
    if (stored) {
      try {
        const parsed: StoredNda = JSON.parse(stored);
        const res = await fetch(
          `/api/nda/status?acceptanceId=${parsed.acceptanceId}&telegramId=${parsed.telegramId}`
        );
        const data = await res.json();
        if (data.valid) {
          setNdaData(parsed);
          setStage("form");
          return;
        }
      } catch {}
    }

    // Проверим, настроен ли NDA вообще — если нет, сразу открываем форму
    const ndaCheck = await fetch(`/api/nda/requirement?productId=${productId}`).then((r) => r.json());
    if (!ndaCheck.required) {
      setStage("form");
      return;
    }

    setStage("nda");
  }
  function handleNdaSigned(acceptanceId: string, telegramId: string, telegramUsername?: string | null) {
    setNdaData({ acceptanceId, telegramId, telegramUsername, ndaVersion: "" });
    setStage("form");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "PRODUCT",
          productId,
          name: form.get("name"),
          company: form.get("company"),
          companyInn: form.get("companyInn"),
          phone: form.get("phone"),
          telegram: form.get("telegram"),
          email: form.get("email"),
          quantity: form.get("quantity") ? Number(form.get("quantity")) : undefined,
          desiredPrice: form.get("desiredPrice"),
          desiredPriceCurrency: form.get("desiredPrice") ? form.get("desiredPriceCurrency") : undefined,
          paymentTermId: form.get("paymentTermId") || undefined,
          contactMethod: form.get("contactMethod"),
          comment: form.get("comment"),
          website: form.get("website"),
          formLoadedAt,
          ndaAcceptanceId: ndaData?.acceptanceId,
          ndaTelegramId: ndaData?.telegramId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.code === "NDA_REQUIRED" || data.code === "NDA_UPDATE_REQUIRED") {
          localStorage.removeItem("nda_acceptance");
          setStage("nda");
          setStatus("idle");
          return;
        }
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (stage === "closed") {
    return (
      <button
        onClick={handleOpen}
        className={
          mode === "request"
            ? "w-full bg-amber text-graphite font-semibold py-3 rounded-sm hover:bg-amber-dark transition-colors"
            : "w-full border border-graphite text-graphite font-semibold py-3 rounded-sm hover:bg-graphite hover:text-white transition-colors"
        }
      >
        {MODE_LABELS[mode]}
      </button>
    );
  }

  if (stage === "nda") {
    return (
      <NdaGate onSigned={handleNdaSigned} onCancel={() => setStage("closed")} />
    );
  }

  if (status === "success") {
    return (
      <div className="border border-okgreen/30 bg-okgreen/10 text-okgreen text-sm rounded-sm p-4">
        Заявка отправлена. Менеджер свяжется с вами в ближайшее время.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-line rounded-sm p-4 space-y-3 bg-white">
      <div className="text-sm font-semibold text-graphite">
        {MODE_LABELS[mode]}: {productTitle}
      </div>

      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px] w-px h-px opacity-0"
        aria-hidden="true"
      />

      {ndaData && (
        <div className="text-[11px] text-okgreen bg-okgreen/10 rounded-sm px-2 py-1">
          ✓ NDA подтверждён через Telegram{ndaData.telegramUsername ? ` (@${ndaData.telegramUsername})` : ""}
        </div>
      )}

      <input name="name" required placeholder="Имя *" className="input" />
      <input name="company" required placeholder="Компания *" className="input" />
      <input name="companyInn" required placeholder="ИНН / ПИНФЛ *" className="input" />
      <div className="grid grid-cols-2 gap-2">
        <input name="phone" required placeholder="Телефон *" className="input" />
        <input
          name="telegram"
          placeholder="Telegram / WhatsApp"
          defaultValue={ndaData?.telegramUsername ? `@${ndaData.telegramUsername}` : ""}
          className="input"
        />
      </div>
      <input name="email" type="email" placeholder="Email" className="input" />
      <input name="quantity" type="number" min={1} placeholder="Количество" className="input" />
      <div className="grid grid-cols-2 gap-2">
        <label className="block text-xs text-steel mb-1">Желаемая цена (необязательно)</label>
        <div className="flex gap-2">
          <input name="desiredPrice" placeholder="Например, 1200" className="input flex-1 min-w-0" />
          <select name="desiredPriceCurrency" defaultValue="USD" className="input w-24 shrink-0">
            <option value="USD">USD</option>
            <option value="UZS">UZS</option>
          </select>
        </div>
      </div>

      {paymentTerms.length > 0 && (
        <select name="paymentTermId" className="input">
          <option value="">Условия оплаты (по желанию)</option>
          {paymentTerms.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      )}

      <select name="contactMethod" className="input">
        <option value="">Способ связи</option>
        <option value="phone">Звонок</option>
        <option value="telegram">Telegram</option>
        <option value="whatsapp">WhatsApp</option>
        <option value="email">Email</option>
      </select>
      <textarea name="comment" placeholder="Комментарий" rows={3} className="input" />

      {status === "error" && (
        <div className="text-alert text-xs">Не удалось отправить. Попробуйте ещё раз.</div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={status === "loading"}
          className="flex-1 bg-amber text-graphite font-semibold py-2.5 rounded-sm hover:bg-amber-dark transition-colors disabled:opacity-60"
        >
          {status === "loading" ? "Отправка..." : "Отправить заявку"}
        </button>
        <button type="button" onClick={() => setStage("closed")} className="px-4 text-sm text-steel hover:text-graphite">
          Отмена
        </button>
      </div>

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
