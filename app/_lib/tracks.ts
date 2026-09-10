export type Track = {
  title: string;
  artist: string;
  tags: string[];
  note: string;
  /* 유튜브 영상 ID (watch?v= 뒤의 값). 비어 있으면 재생 비활성 */
  youtubeId?: string;
};

/* youtubeId는 임시 예시 값 — 실제 곡 영상 ID로 교체하세요. */
export const tracks: Track[] = [
  { title: "La Llorona (World Mix)", artist: "Lila Downs", tags: ["WORLD", "FOLK", "MEXICO"], note: "익숙하지 않은 언어가 건네는 낯선 감정. 듣고 나면, 당신의 플레이리스트가 조금 더 넓어질 거예요.", youtubeId: "dQw4w9WgXcQ" },
  { title: "Sunset in Accra", artist: "Ebo Taylor", tags: ["AFROBEAT", "GHANA"], note: "기타 한 줄에서 시작되는 느긋한 리듬. 오늘의 두 번째 낯선 세계예요.", youtubeId: "kJQP7kiw5Fk" },
  { title: "Paper Moon", artist: "Mondo Grosso", tags: ["CITY POP", "JAPAN"], note: "반짝이는 도시의 밤과 조금 오래된 미래가 함께 흐르는 곡이에요.", youtubeId: "9bZkp7q19f0" },
  { title: "The Quiet Market", artist: "Nala Sinephro", tags: ["JAZZ", "AMBIENT"], note: "서두르지 않는 소리 사이에서 오늘 놓쳤던 여백을 발견해 보세요.", youtubeId: "" },
];

/* 상자 심볼 기본 풀 — 한 달 길이만큼 순환해서 사용한다 */
const SYMBOL_POOL = ["leaf", "mountain", "moon", "house", "tree", "cat", "globe", "bird", "flower", "wave"];

export const boxTracklist: { title: string; artist: string }[] = [
  { title: "La Llorona", artist: "Lila Downs" },
  { title: "Sunset in Accra", artist: "Ebo Taylor" },
  { title: "Paper Moon", artist: "Mondo Grosso" },
  { title: "The Quiet Market", artist: "Nala Sinephro" },
  { title: "Midnight Market", artist: "Khruangbin" },
  { title: "Third Culture", artist: "Sault" },
  { title: "Neon Prayer", artist: "Men I Trust" },
  { title: "Salt Flats", artist: "Floating Points" },
  { title: "Kintsugi", artist: "Hania Rani" },
  { title: "The Same Sky", artist: "Nils Frahm" },
];

export const TRACKS_PER_BOX = 10;

const MONTHS_SHORT = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const p2 = (n: number) => String(n).padStart(2, "0");

/* ------------------------------------------------------------------ *
 *  날짜 모델 — 내부 식별자는 'YYYY-MM-DD'(날짜), 월은 'YYYY-MM'.
 *  전부 로컬 시간 기준. 서버 API 키와 그대로 맞는다.
 * ------------------------------------------------------------------ */

/* 로컬 기준 오늘 'YYYY-MM-DD' */
export const todayISO = (now: Date = new Date()) =>
  `${now.getFullYear()}-${p2(now.getMonth() + 1)}-${p2(now.getDate())}`;

/* 이번 달 'YYYY-MM' */
export const currentMonth = (now: Date = new Date()) => `${now.getFullYear()}-${p2(now.getMonth() + 1)}`;

/* 'YYYY-MM-DD' → 'YYYY-MM' */
export const monthOf = (iso: string) => iso.slice(0, 7);

/* 'YYYY-MM-DD' → 일(1..31) */
export const dayOfMonth = (iso: string) => Number(iso.slice(8, 10));

/* 'YYYY-MM' 의 일수 (28~31) */
export const daysInMonth = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m, 0).getDate();
};

/* 'YYYY-MM' → 그 달의 모든 날짜 ['YYYY-MM-01', … ] */
export const monthDates = (ym: string) =>
  Array.from({ length: daysInMonth(ym) }, (_, i) => `${ym}-${p2(i + 1)}`);

/* 'YYYY-MM' 을 delta 개월 이동한 'YYYY-MM' */
export const shiftMonth = (ym: string, delta: number) => {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}`;
};

/* 'YYYY-MM' [첫날, 말일] 키 — 월 그리드 조회용 */
export const monthRange = (ym: string): [string, string] => {
  const dates = monthDates(ym);
  return [dates[0], dates[dates.length - 1]];
};

/* 날짜별 심볼 — 일(1일 → 0)을 기준으로 기본 풀을 순환한다 */
export const symbolFor = (iso: string) => SYMBOL_POOL[(dayOfMonth(iso) - 1) % SYMBOL_POOL.length];

/* 자동 생성 트랙리스트 — 일자를 회전 오프셋으로 삼는다 */
export const tracklistFor = (iso: string) => {
  const off = dayOfMonth(iso) - 1;
  return boxTracklist.map((_, i) => boxTracklist[(i + off) % boxTracklist.length]);
};

/* "07 SEP" 형태 */
export const dateLabel = (iso: string) => `${iso.slice(8, 10)} ${MONTHS_SHORT[Number(iso.slice(5, 7)) - 1]}`;

/* "07 September" 형태 */
export const dateLabelLong = (iso: string) => `${iso.slice(8, 10)} ${MONTHS_LONG[Number(iso.slice(5, 7)) - 1]}`;

/* "SEPTEMBER 2026" — 월 이동 UI 헤더용 */
export const monthLabel = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return `${MONTHS_LONG[m - 1]} ${y}`;
};

/* iso 가 오늘 기준 과거 / 오늘 / 미래 중 무엇인지 */
export const dayStatus = (iso: string, now: Date = new Date()): "past" | "today" | "future" => {
  const t = todayISO(now);
  return iso === t ? "today" : iso < t ? "past" : "future";
};

/* 초 → "M:SS" (음수·NaN은 0으로) */
export const formatTime = (sec: number) => {
  const s = Number.isFinite(sec) && sec > 0 ? sec : 0;
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};
