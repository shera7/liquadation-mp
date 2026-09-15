"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSelection } from "@/lib/selection";
import NdaGate from "@/components/NdaGate";

interface StoredNda {
  acceptanceId: string;
  telegramId: string;
  telegramUsername?: string | null;
}

export default function RequestCartPage() {
  const { items, setQuantity, remove, clear } = useSelection();
  const [stage, setStage] = useState<"review" | "nda" | "form" | "success">("review");
  const [ndaRequired, setNdaRequired] = useState(false);
  const [ndaData, setNdaData] = useState<StoredNda | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) return;
    Promise.all(
      items.map((i) =>
        fetch(`/api/nda/requirement?productId=${i.productId}`)
          .then((r) => r.json())
          .then((d) => d.required)
          .catch(() => false)
      )
    ).then((results) => setNdaRequired(results.some(Boolean)));
  }, [items]);

  async function handleProceed() {
    if (!ndaRequired) {
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
    setStage("nda");
  }

  function handleNdaSigned(acceptanceId: string, telegramId: string, telegramUsername?: string | null) {
    setNdaData({ acceptanceId, telegramId, telegramUsername });
    setStage("form");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg(null);
    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/requests/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          name: form.get("name"),
          company: form.get("company"),
          companyInn: form.get("companyInn"),
          phone: form.get("phone"),
          telegram: form.get("telegram"),
          email: form.get("email"),
          contactMethod: form.get("contactMethod"),
          comment: form.get("comment"),
          ndaAcceptanceId: ndaData?.acceptanceId,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error?.fieldErrors ? Object.values(data.error.fieldErrors).flat().join(", ") : "Не удалось отправить заявку");
        setStatus("idle");
        return;
      }

      clear();
      setStage("success");
    } catch {
      setErrorMsg("Не удалось отправить заявку. Попробуйте ещё раз.");
      setStatus("idle");
    }
  }

  if (stage === "success") {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="text-2xl font-display font-800 text-graphite mb-3">Заявка отправлена</div>
        <p className="text-steel mb-6">
          Менеджер свяжется с вами по всем выбранным позициям в ближайшее время.
        </p>
        <Link href="/catalog" className="text-amber-dark font-medium hover:underline">
          Вернуться в каталог
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="text-lg text-graphite mb-3">Список заявки пуст</div>
        <p className="text-steel mb-6">Добавьте товары из каталога, нажав «+» на карточке товара.</p>
        <Link href="/catalog" className="text-amber-dark font-medium hover:underline">
          Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display font-800 text-2xl text-graphite mb-6">Заявка на {items.length} товаров</h1>

      <div className="space-y-3 mb-8">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-4 bg-white border border-line rounded-sm p-3">
            <div className="relative w-16 h-16 shrink-0 rounded-sm overflow-hidden bg-concrete">
              {item.image && <Image src={item.image} alt={item.title} fill className="object-cover" />}
            </div>
            <Link href={`/product/${item.slug}`} className="flex-1 text-sm text-graphite hover:text-amber-dark">
              {item.title}
            </Link>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setQuantity(item.productId, item.quantity - 1)}
                className="w-7 h-7 border border-line rounded-sm text-steel hover:border-amber"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-mono-tabular">{item.quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(item.productId, item.quantity + 1)}
                className="w-7 h-7 border border-line rounded-sm text-steel hover:border-amber"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={() => remove(item.productId)}
              className="text-xs text-alert hover:underline"
            >
              Убрать
            </button>
          </div>
        ))}
      </div>

      {stage === "review" && (
        <button
          onClick={handleProceed}
          className="w-full bg-amber text-graphite font-semibold py-3 rounded-sm hover:bg-amber-dark transition-colors"
        >
          Продолжить оформление
        </button>
      )}

      {stage === "nda" && <NdaGate onSigned={handleNdaSigned} onCancel={() => setStage("review")} />}

      {stage === "form" && (
        <form onSubmit={handleSubmit} className="border border-line rounded-sm p-4 space-y-3 bg-white">
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
          <select name="contactMethod" className="input">
            <option value="">Способ связи</option>
            <option value="phone">Звонок</option>
            <option value="telegram">Telegram</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Email</option>
          </select>
          <textarea name="comment" placeholder="Комментарий" rows={3} className="input" />

          {errorMsg && <div className="text-alert text-xs">{errorMsg}</div>}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-amber text-graphite font-semibold py-2.5 rounded-sm hover:bg-amber-dark transition-colors disabled:opacity-60"
          >
            {status === "loading" ? "Отправка..." : `Отправить заявку на ${items.length} товаров`}
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
      )}
    </div>
  );
}
