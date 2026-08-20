"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader, { UploadedImage } from "./ImageUploader";

interface NewProductFormProps {
  categories: { id: string; name: string }[];
}

export default function NewProductForm({ categories }: NewProductFormProps) {
  const router = useRouter();
  const [priceOnRequest, setPriceOnRequest] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);

    const payload = {
      title: form.get("title"),
      categoryId: form.get("categoryId"),
      inventoryNumber: form.get("inventoryNumber"),
      description: form.get("description") || undefined,
      price: priceOnRequest ? null : Number(form.get("price")) || undefined,
      priceOnRequest,
      currency: form.get("currency"),
      quantity: Number(form.get("quantity")) || 1,
      unit: form.get("unit") || "шт",
      location: form.get("location") || undefined,
      condition: form.get("condition"),
      manufacturer: form.get("manufacturer") || undefined,
      model: form.get("model") || undefined,
      year: form.get("year") ? Number(form.get("year")) : undefined,
      power: form.get("power") || undefined,
      images,
    };

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error?.toString?.() ?? "Не удалось сохранить товар");
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-line rounded-sm p-6 space-y-4">
      <Field label="Название *">
        <input name="title" required className="input" />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Инвентарный номер / артикул *">
          <input name="inventoryNumber" required className="input" />
        </Field>
        <Field label="Категория *">
          <select name="categoryId" required className="input">
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Описание">
        <textarea name="description" rows={4} className="input" />
      </Field>

      <div className="grid grid-cols-3 gap-4">
        <Field label="Цена">
          <input name="price" type="number" step="0.01" disabled={priceOnRequest} className="input" />
        </Field>
        <Field label="Валюта">
          <select name="currency" className="input">
            <option value="USD">USD</option>
            <option value="UZS">UZS</option>
          </select>
        </Field>
        <label className="flex items-center gap-2 text-sm text-steel mt-6">
          <input
            type="checkbox"
            checked={priceOnRequest}
            onChange={(e) => setPriceOnRequest(e.target.checked)}
            className="accent-amber"
          />
          Цена по запросу
        </label>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Field label="Количество">
          <input name="quantity" type="number" min={0} defaultValue={1} className="input" />
        </Field>
        <Field label="Ед. измерения">
          <input name="unit" defaultValue="шт" className="input" />
        </Field>
        <Field label="Состояние">
          <select name="condition" className="input">
            <option value="USED">Б/У</option>
            <option value="NEW">Новое</option>
            <option value="NEEDS_REPAIR">Требует ремонта</option>
          </select>
        </Field>
      </div>

      <Field label="Местонахождение">
        <input name="location" className="input" />
      </Field>

      <div className="grid grid-cols-4 gap-4">
        <Field label="Производитель">
          <input name="manufacturer" className="input" />
        </Field>
        <Field label="Модель">
          <input name="model" className="input" />
        </Field>
        <Field label="Год выпуска">
          <input name="year" type="number" className="input" />
        </Field>
        <Field label="Мощность">
          <input name="power" className="input" />
        </Field>
      </div>

      <ImageUploader images={images} onChange={setImages} />

      {error && <div className="text-alert text-sm">{error}</div>}

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-amber text-graphite font-semibold px-6 py-2.5 rounded-sm hover:bg-amber-dark disabled:opacity-60"
        >
          {loading ? "Сохранение..." : "Сохранить товар"}
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-steel mb-1">{label}</span>
      {children}
    </label>
  );
}
