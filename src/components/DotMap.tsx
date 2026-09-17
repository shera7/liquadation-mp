// Сетка точек, выложенная в форме силуэта карты (упрощённо, не географически
// точно) — как на референсе: не сплошной прямоугольник, а фигура с "рукавом"
// (условная Ферганская долина на востоке). Несколько точек — "города" —
// подсвечены и пульсируют фирменным amber.

// 1 — точка есть (часть силуэта), 0 — пусто
const MASK = [
  "000011111111100000000000",
  "000111111111111000000000",
  "001111111111111110000000",
  "011111111111111111100000",
  "111111111111111111111000",
  "111111111111111111111110",
  "111111111111111111111100",
  "011111111111111111100000",
  "001111111111111111000000",
  "000111111111111110000000",
  "000011111111111000000000",
  "000001111111100000000000",
];

const ROWS = MASK.length;
const COLS = MASK[0].length;

// Координаты [row, col] — условные "города": Нукус, Бухара, Самарканд,
// Ташкент, Фергана (кончик восточного рукава)
const CITIES = [
  { row: 5, col: 2, delay: "0s" },
  { row: 6, col: 9, delay: "0.7s" },
  { row: 4, col: 13, delay: "1.3s" },
  { row: 3, col: 17, delay: "0.4s" },
  { row: 5, col: 23, delay: "1.9s" },
];

export default function DotMap() {
  const dots: { top: string; left: string }[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (MASK[r][c] === "1") {
        dots.push({
          top: `${((r + 0.5) / ROWS) * 100}%`,
          left: `${((c + 0.5) / COLS) * 100}%`,
        });
      }
    }
  }

  return (
    <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
      {dots.map((d, i) => (
        <span
          key={i}
          className="absolute w-[5px] h-[5px] rounded-full bg-white/10"
          style={{ top: d.top, left: d.left, transform: "translate(-50%, -50%)" }}
        />
      ))}
      {CITIES.map((c, i) => (
        <span
          key={i}
          className="absolute w-2.5 h-2.5 rounded-full bg-amber dot-pulse"
          style={{
            top: `${((c.row + 0.5) / ROWS) * 100}%`,
            left: `${((c.col + 0.5) / COLS) * 100}%`,
            transform: "translate(-50%, -50%)",
            animationDelay: c.delay,
          }}
        />
      ))}
    </div>
  );
}
