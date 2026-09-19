let keyframesInjected = false;

function ensureKeyframes() {
  if (keyframesInjected) return;
  const style = document.createElement("style");
  style.textContent = `
    @keyframes flyToCartArc {
      0%   { transform: translate(0, 0) scale(1); opacity: 1; }
      100% { transform: translate(var(--dx), var(--dy)) scale(var(--scale)); opacity: 0.25; }
    }
  `;
  document.head.appendChild(style);
  keyframesInjected = true;
}

/**
 * Клон фото товара, взятый в РЕАЛЬНОМ размере с карточки (fromRect),
 * летит и одновременно плавно уменьшается до размера иконки заявки в
 * хедере. Настоящий <img>, а не CSS background — без мерцаний/чёрного
 * фона на время загрузки.
 */
export function flyToCart(photoEl: HTMLImageElement | null, fallbackEl: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    const target = document.getElementById("cart-target");
    if (!target) {
      resolve();
      return;
    }
    ensureKeyframes();

    const sourceEl = photoEl ?? fallbackEl;
    const fromRect = sourceEl.getBoundingClientRect();
    const toRect = target.getBoundingClientRect();
    const startW = fromRect.width;
    const startH = fromRect.height;

    const fromCenterX = fromRect.left + startW / 2;
    const fromCenterY = fromRect.top + startH / 2;
    const toCenterX = toRect.left + toRect.width / 2;
    const toCenterY = toRect.top + toRect.height / 2;

    const dx = toCenterX - fromCenterX;
    const dy = toCenterY - fromCenterY;
    // Уменьшаем пропорционально, пока большая сторона не станет ~28px
    const scale = 28 / Math.max(startW, startH);

    const ghost = document.createElement("div");
    ghost.style.position = "fixed";
    ghost.style.left = `${fromRect.left}px`;
    ghost.style.top = `${fromRect.top}px`;
    ghost.style.width = `${startW}px`;
    ghost.style.height = `${startH}px`;
    ghost.style.borderRadius = "6px";
    ghost.style.overflow = "hidden";
    ghost.style.zIndex = "9999";
    ghost.style.pointerEvents = "none";
    ghost.style.boxShadow = "0 8px 24px rgba(0,0,0,0.35)";
    ghost.style.border = "2px solid #E8A33D";
    ghost.style.setProperty("--dx", `${dx}px`);
    ghost.style.setProperty("--dy", `${dy}px`);
    ghost.style.setProperty("--scale", `${scale}`);
    ghost.style.animation = "flyToCartArc 450ms cubic-bezier(0.4, 0, 0.2, 1) forwards";

    if (photoEl) {
      // Клонируем уже загруженный <img> из карточки (тот, что оптимизирован
      // и закэширован через next/image) — новый сетевой запрос не нужен.
      const clone = photoEl.cloneNode() as HTMLImageElement;
      clone.style.width = "100%";
      clone.style.height = "100%";
      clone.style.objectFit = "cover";
      clone.style.display = "block";
      ghost.appendChild(clone);
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
