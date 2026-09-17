// Декоративная сетка точек с несколькими "живыми" (пульсирующими) —
// эффект карты покрытия/присутствия. Позиции зафиксированы (не случайны),
// чтобы серверный и клиентский рендер совпадали без ошибок гидратации.
const ACTIVE_DOTS = [
  { top: "16%", left: "10%", delay: "0s" },
  { top: "30%", left: "26%", delay: "0.6s" },
  { top: "54%", left: "16%", delay: "1.1s" },
  { top: "42%", left: "52%", delay: "1.7s" },
  { top: "68%", left: "38%", delay: "0.3s" },
  { top: "22%", left: "68%", delay: "2s" },
  { top: "60%", left: "74%", delay: "1.4s" },
  { top: "78%", left: "58%", delay: "0.9s" },
];

export default function DotMap() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.08) 1.5px, transparent 1.5px)",
        backgroundSize: "22px 22px",
      }}
    >
      {ACTIVE_DOTS.map((d, i) => (
        <span
          key={i}
          className="absolute w-2 h-2 rounded-full bg-amber dot-pulse"
          style={{ top: d.top, left: d.left, animationDelay: d.delay }}
        />
      ))}
    </div>
  );
}
