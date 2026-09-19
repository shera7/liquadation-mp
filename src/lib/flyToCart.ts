let keyframesInjected = false;

function ensureKeyframes() {
  if (keyframesInjected) return;
  const style = document.createElement("style");
  style.textContent = `
    @keyframes flyToCartArc {
      0%   { transform: translate(0, 0) scale(1); opacity: 1; }
      55%  { transform: translate(calc(var(--dx) * 0.6), calc(var(--dy) * 0.35 - 36px)) scale(0.85); opacity: 1; }
      100% { transform: translate(var(--dx), var(--dy)) scale(0.2); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
  keyframesInjected = true;
}

/**
 * Летящая точка от кнопки "В заявку" до иконки заявки в хедере, по дуге
 * (не по прямой) — чистая визуальная обратная связь.
 * Возвращает промис, который разрешается ровно в момент "приземления" —
 * по нему синхронизируется смена состояния кнопки в хедере.
 */
export function flyToCart(fromEl: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    const target = document.getElementById("cart-target");
    if (!target) {
      resolve();
      return;
    }
    ensureKeyframes();

    const fromRect = fromEl.getBoundingClientRect();
    const toRect = target.getBoundingClientRect();
    const dx = toRect.left + toRect.width / 2 - (fromRect.left + fromRect.width / 2);
    const dy = toRect.top + toRect.height / 2 - (fromRect.top + fromRect.height / 2);

    const dot = document.createElement("div");
    dot.style.position = "fixed";
    dot.style.left = `${fromRect.left + fromRect.width / 2 - 6}px`;
    dot.style.top = `${fromRect.top + fromRect.height / 2 - 6}px`;
    dot.style.width = "12px";
    dot.style.height = "12px";
    dot.style.borderRadius = "9999px";
    dot.style.background = "#E8A33D";
    dot.style.boxShadow = "0 0 8px rgba(232,163,61,0.6)";
    dot.style.zIndex = "9999";
    dot.style.pointerEvents = "none";
    dot.style.setProperty("--dx", `${dx}px`);
    dot.style.setProperty("--dy", `${dy}px`);
    dot.style.animation = "flyToCartArc 700ms cubic-bezier(0.22, 1, 0.36, 1) forwards";
    document.body.appendChild(dot);

    setTimeout(() => {
      dot.remove();
      target.classList.add("cart-bump");
      setTimeout(() => target.classList.remove("cart-bump"), 300);
      resolve();
    }, 700);
  });
}
