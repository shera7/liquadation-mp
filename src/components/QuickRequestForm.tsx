"use client";

import { useState } from "react";

export default function QuickRequestForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "GENERAL",
          name: form.get("name"),
          company: form.get("company"),
          phone: form.get("phone"),
          telegram: form.get("telegram"),
          interestedCategory: form.get("interestedCategory"),
          budget: form.get("budget"),
          comment: form.get("comment"),
        }),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("success");
      (e.target as HTMLFormElement).reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="border border-okgreen/30 bg-okgreen/10 text-okgreen text-sm rounded-sm p-6 text-center">
        Спасибо! Заявка передана менеджеру — он свяжется с вами и подберёт варианты.
      </div>
    );
  }

  return (
    <form
      id="quick-request"
      onSubmit={handleSubmit}
      className="bg-white border border-line rounded-sm p-6 space-y-3 scroll-mt-24"
    >
      <div className="grid sm:grid-cols-2 gap-3">
        <input name="name" required placeholder="Имя *" className="input" />
        <input name="company" placeholder="Компания" className="input" />
        <input name="phone" required placeholder="Телефон *" className="input" />
        <input name="telegram" placeholder="Telegram" className="input" />
        <input
          name="interestedCategory"
          placeholder="Интересующая категория (например, станки)"
          className="input"
        />
        <input name="budget" placeholder="Бюджет" className="input" />
      </div>
      <textarea
        name="comment"
        placeholder="Опишите, что ищете: «Нужны производственные линии / металл / запчасти»"
        rows={3}
        className="input"
      />
      {status === "error" && (
        <div className="text-alert text-xs">Не удалось отправить. Попробуйте ещё раз.</div>
      )}
      <button
        type="submit"
        disabled={status === "loading"}
        className="bg-amber text-graphite font-semibold px-6 py-2.5 rounded-sm hover:bg-amber-dark transition-colors disabled:opacity-60"
      >
        {status === "loading" ? "Отправка..." : "Отправить заявку"}
      </button>

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid #dddad1;
          border-radius: 2px;
          padding: 0.6rem 0.75rem;
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
