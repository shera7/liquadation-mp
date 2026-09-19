let keyframesInjected = false;

function ensureKeyframes() {
  if (keyframesInjected) return;
  const style = document.createElement("style");
  style.textContent = `
    @keyframes flyToCartArc {
      0%   { transform: translate(0, 0) scale(1); opacity: 1; }
      100% { transform: translate(var(--dx), var(--dy)) scale(0.15); opacity: 0.3; }
    }
  `;
  document.head.appendChild(style);
  keyframesInjected = true;
}

/**
 * Клон миниатюры товара летит по дуге от кнопки "В заявку" до иконки
 * заявки в хедере — узнаваемый паттерн крупных e-commerce (реальная
 * картинка товара, не абстрактная точка). ~450мс — в рекомендованном
 * диапазоне 200-500мс для микровзаимодействий.
 */
export function flyToCart(fromEl: HTMLElement, imageUrl: string | null): Promise<void> {
  return new Promise((resolve) => {
    const target = document.getElementById("cart-target");
    if (!target) {
      resolve();
      return;
    }
    ensureKeyframes();

    const fromRect = fromEl.getBoundingClientRect();
    const toRect = target.getBoundingClientRect();
    const size = 44;
    const dx = toRect.left + toRect.width / 2 - (fromRect.left + fromRect.width / 2) - size / 2;
    const dy = toRect.top + toRect.height / 2 - (fromRect.top + fromRect.height / 2) - size / 2 - 30;

    const ghost = document.createElement("div");
    ghost.style.position = "fixed";
    ghost.style.left = `${fromRect.left + fromRect.width / 2 - size / 2}px`;
    ghost.style.top = `${fromRect.top + fromRect.height / 2 - size / 2}px`;
    ghost.style.width = `${size}px`;
    ghost.style.height = `${size}px`;
    ghost.style.borderRadius = "6px";
    ghost.style.overflow = "hidden";
    ghost.style.zIndex = "9999";
    ghost.style.pointerEvents = "none";
    ghost.style.boxShadow = "0 6px 18px rgba(0,0,0,0.35)";
    ghost.style.border = "2px solid #E8A33D";
    ghost.style.setProperty("--dx", `${dx}px`);
    ghost.style.setProperty("--dy", `${dy}px`);
    ghost.style.animation = "flyToCartArc 450ms cubic-bezier(0.4, 0, 0.2, 1) forwards";

    if (imageUrl) {
      ghost.style.backgroundImage = `url(${imageUrl})`;
      ghost.style.backgroundSize = "cover";
      ghost.style.backgroundPosition = "center";
      ghost.style.background = `#1C1F22 url(${imageUrl}) center/cover`;
    } else {
      ghost.style.background = "#E8A33D";
    }

    document.body.appendChild(ghost);

    setTimeout(() => {
      ghost.remove();
      target.classList.add("cart-bump");
      setTimeout(() => target.classList.remove("cart-bump"), 250);
      resolve();
    }, 450);
  });
}
