/**
 * Небольшая летящая точка от кнопки "В заявку" до иконки заявки в хедере —
 * чистая визуальная обратная связь, не завязана на React-состояние.
 */
export function flyToCart(fromEl: HTMLElement) {
  const target = document.getElementById("cart-target");
  if (!target) return;

  const fromRect = fromEl.getBoundingClientRect();
  const toRect = target.getBoundingClientRect();

  const dot = document.createElement("div");
  dot.style.position = "fixed";
  dot.style.left = `${fromRect.left + fromRect.width / 2 - 6}px`;
  dot.style.top = `${fromRect.top + fromRect.height / 2 - 6}px`;
  dot.style.width = "12px";
  dot.style.height = "12px";
  dot.style.borderRadius = "9999px";
  dot.style.background = "#E8A33D";
  dot.style.zIndex = "9999";
  dot.style.pointerEvents = "none";
  dot.style.transition = "transform 650ms cubic-bezier(0.3, 0, 0.4, 1), opacity 650ms ease-in";
  document.body.appendChild(dot);

  const dx = toRect.left + toRect.width / 2 - (fromRect.left + fromRect.width / 2);
  const dy = toRect.top + toRect.height / 2 - (fromRect.top + fromRect.height / 2);

  requestAnimationFrame(() => {
    dot.style.transform = `translate(${dx}px, ${dy}px) scale(0.3)`;
    dot.style.opacity = "0.15";
  });

  setTimeout(() => {
    dot.remove();
    target.classList.add("cart-bump");
    setTimeout(() => target.classList.remove("cart-bump"), 300);
  }, 650);
}
