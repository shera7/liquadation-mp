"use client";

import { useSelection } from "@/lib/selection";
import { flyToCart } from "@/lib/flyToCart";

interface AddToSelectionButtonProps {
  productId: string;
  slug: string;
  title: string;
  image: string | null;
  maxQuantity: number;
  variant?: "icon" | "full" | "card";
}

export default function AddToSelectionButton({ productId, slug, title, image, maxQuantity, variant = "icon" }: AddToSelectionButtonProps) {
  const { isSelected, toggle } = useSelection();
  const selected = isSelected(productId);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!selected) flyToCart(e.currentTarget as HTMLElement);
    toggle({ productId, slug, title, image, maxQuantity });
  }
    if (variant === "card") {
    return (
      <button
        onClick={handleClick}
        className={`w-full flex items-center justify-center gap-1.5 text-sm font-semibold py-2.5 rounded-sm transition-colors ${
          selected
            ? "bg-okgreen/10 text-okgreen border border-okgreen"
            : "bg-amber text-graphite hover:bg-amber-dark"
        }`}
      >
        {selected ? (
          <>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            В заявке
          </>
        ) : (
          <>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            В заявку
          </>
        )}
      </button>
    );
  }
  if (variant === "full") {
    return (
      <button
        onClick={handleClick}
        className={`w-full border font-semibold py-3 rounded-sm transition-colors ${
          selected
            ? "border-okgreen bg-okgreen/10 text-okgreen"
            : "border-graphite text-graphite hover:bg-graphite hover:text-white"
        }`}
      >
        {selected ? "✓ В списке заявки" : "+ Добавить в заявку"}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`absolute top-2 right-2 z-10 flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-sm shadow-sm transition-colors ${
        selected ? "bg-okgreen text-white" : "bg-white text-graphite border border-line hover:border-amber"
      }`}
    >
      {selected ? (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          В заявке
        </>
      ) : (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          В заявку
        </>
      )}
    </button>
  );
}
