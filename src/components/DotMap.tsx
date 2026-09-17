// Силуэт Узбекистана, построенный из реальных координат границы (не
// нарисован вручную) — сеткой точек, отфильтрованных алгоритмом
// "точка внутри многоугольника". Серверный компонент: вся геометрия
// вычисляется один раз при рендере, пульсация точек — чистый CSS.

const BORDER: [number, number][] = [
  [66.518607, 37.362784], [66.54615, 37.974685], [65.215999, 38.402695],
  [64.170223, 38.892407], [63.518015, 39.363257], [62.37426, 40.053886],
  [61.882714, 41.084857], [61.547179, 41.26637], [60.465953, 41.220327],
  [60.083341, 41.425146], [59.976422, 42.223082], [58.629011, 42.751551],
  [57.78653, 42.170553], [56.932215, 41.826026], [57.096391, 41.32231],
  [55.968191, 41.308642], [55.928917, 44.995858], [58.503127, 45.586804],
  [58.689989, 45.500014], [60.239972, 44.784037], [61.05832, 44.405817],
  [62.0133, 43.504477], [63.185787, 43.650075], [64.900824, 43.728081],
  [66.098012, 42.99766], [66.023392, 41.994646], [66.510649, 41.987644],
  [66.714047, 41.168444], [67.985856, 41.135991], [68.259896, 40.662325],
  [68.632483, 40.668681], [69.070027, 41.384244], [70.388965, 42.081308],
  [70.962315, 42.266154], [71.259248, 42.167711], [70.420022, 41.519998],
  [71.157859, 41.143587], [71.870115, 41.3929], [73.055417, 40.866033],
  [71.774875, 40.145844], [71.014198, 40.244366], [70.601407, 40.218527],
  [70.45816, 40.496495], [70.666622, 40.960213], [69.329495, 40.727824],
  [69.011633, 40.086158], [68.536416, 39.533453], [67.701429, 39.580478],
  [67.44222, 39.140144], [68.176025, 38.901553], [68.392033, 38.157025],
  [67.83, 37.144994], [67.075782, 37.356144], [66.518607, 37.362784],
];

// Реальные координаты нескольких крупных городов — подсвечиваются пульсацией
const CITIES: { lon: number; lat: number; delay: string }[] = [
  { lon: 69.2401, lat: 41.2995, delay: "0s" },    // Ташкент
  { lon: 66.9749, lat: 39.627, delay: "0.6s" },   // Самарканд
  { lon: 64.4207, lat: 39.7747, delay: "1.2s" },  // Бухара
  { lon: 72.3442, lat: 40.7821, delay: "1.8s" },  // Андижан
  { lon: 59.6103, lat: 42.4531, delay: "0.3s" },  // Нукус
  { lon: 65.7891, lat: 38.8606, delay: "1.5s" },  // Карши
];

function pointInPolygon(lon: number, lat: number, poly: [number, number][]) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    const intersect =
      yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

const lons = BORDER.map((p) => p[0]);
const lats = BORDER.map((p) => p[1]);
const LON_MIN = Math.min(...lons);
const LON_MAX = Math.max(...lons);
const LAT_MIN = Math.min(...lats);
const LAT_MAX = Math.max(...lats);
const AVG_LAT = (LAT_MIN + LAT_MAX) / 2;

// Поправка: градус долготы физически короче градуса широты чем севернее —
// без неё силуэт растянуло бы по горизонтали
const LON_SPAN = (LON_MAX - LON_MIN) * Math.cos((AVG_LAT * Math.PI) / 180);
const LAT_SPAN = LAT_MAX - LAT_MIN;
const ASPECT = LON_SPAN / LAT_SPAN;

const COLS = 44;
const ROWS = Math.round(COLS / ASPECT);

function project(lon: number, lat: number) {
  const x = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * 100;
  const y = (1 - (lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * 100;
  return { x, y };
}

const DOTS: { x: number; y: number }[] = [];
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    const lon = LON_MIN + ((c + 0.5) / COLS) * (LON_MAX - LON_MIN);
    const lat = LAT_MAX - ((r + 0.5) / ROWS) * (LAT_MAX - LAT_MIN);
    if (pointInPolygon(lon, lat, BORDER)) {
      DOTS.push(project(lon, lat));
    }
  }
}

export default function DotMap({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`absolute pointer-events-none ${className}`} style={{ aspectRatio: `${ASPECT}` }}>
      {DOTS.map((d, i) => (
        <span
          key={i}
          className="absolute w-[5px] h-[5px] rounded-full bg-white/15"
          style={{ top: `${d.y}%`, left: `${d.x}%`, transform: "translate(-50%, -50%)" }}
        />
      ))}
      {CITIES.map((c, i) => {
        const p = project(c.lon, c.lat);
        return (
          <span
            key={i}
            className="absolute w-2.5 h-2.5 rounded-full bg-amber dot-pulse"
            style={{ top: `${p.y}%`, left: `${p.x}%`, transform: "translate(-50%, -50%)", animationDelay: c.delay }}
          />
        );
      })}
    </div>
  );
}
