"use client";

import { useSelection } from "@/lib/selection";

interface AddToSelectionButtonProps {
  productId: string;
  slug: string;
  title: string;
  image: string | null;
  variant?: "icon" | "full";
}

export default function AddToSelectionButton({ productId, slug, title, image, variant = "icon" }: AddToSelectionButtonProps) {
  const { isSelected, toggle } = useSelection();
  const selected = isSelected(productId);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggle({ productId, slug, title, image });
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
      aria-label={selected ? "Убрать из списка заявки" : "Добавить в список заявки"}
      title={selected ? "Убрать из списка заявки" : "Добавить в список заявки"}
      className={`absolute top-2 right-2 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
        selected ? "bg-okgreen text-white" : "bg-white/90 text-graphite hover:bg-white"
      }`}
    >
      {selected ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" />
        </svg>
      )}
    </button>
  );
}
