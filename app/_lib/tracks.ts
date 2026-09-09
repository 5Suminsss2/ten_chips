export type Track = { title: string; artist: string; tags: string[]; note: string; image?: string };

export const tracks: Track[] = [
  { title: "La Llorona (World Mix)", artist: "Lila Downs", tags: ["WORLD", "FOLK", "MEXICO"], note: "익숙하지 않은 언어가 건네는 낯선 감정. 듣고 나면, 당신의 플레이리스트가 조금 더 넓어질 거예요." },
  { title: "Sunset in Accra", artist: "Ebo Taylor", tags: ["AFROBEAT", "GHANA"], note: "기타 한 줄에서 시작되는 느긋한 리듬. 오늘의 두 번째 낯선 세계예요." },
  { title: "Paper Moon", artist: "Mondo Grosso", tags: ["CITY POP", "JAPAN"], note: "반짝이는 도시의 밤과 조금 오래된 미래가 함께 흐르는 곡이에요." },
  { title: "The Quiet Market", artist: "Nala Sinephro", tags: ["JAZZ", "AMBIENT"], note: "서두르지 않는 소리 사이에서 오늘 놓쳤던 여백을 발견해 보세요." },
];

/* 상자 심볼 기본 풀 — 한 달 길이만큼 순환해서 사용한다 */
const SYMBOL_POOL = ["leaf", "mountain", "moon", "house", "tree", "cat", "globe", "bird", "flower", "wave"];

export const boxTracklist = ["La Llorona", "Sunset in Accra", "Paper Moon", "The Quiet Market", "Midnight Market", "Third Culture", "Neon Prayer", "Salt Flats", "Kintsugi", "The Same Sky"];

export const TRACKS_PER_BOX = 10;

const MONTHS_SHORT = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/* 주어진 달의 일수 (28~31) */
export const daysInMonth = (now: Date = new Date()) => new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

/* 이번 달 상자 개수 = 이번 달 일수 */
export const BOX_COUNT = daysInMonth();

/* 상자 인덱스별 심볼 — 기본 풀을 순환해서 한 달 길이만큼 채운다 */
export const boxSymbols = Array.from({ length: BOX_COUNT }, (_, i) => SYMBOL_POOL[i % SYMBOL_POOL.length]);

/* 오늘 날짜(1일 → 0)를 상자 인덱스로 변환 */
export const todayIndex = (now: Date = new Date()) => Math.min(Math.max(now.getDate() - 1, 0), BOX_COUNT - 1);

export const tracklistFor = (day: number) => boxTracklist.map((_, i) => boxTracklist[(i + day) % boxTracklist.length]);

/* "07 SEP" 형태. 월은 실제 현재 월을 따른다. */
export const dateLabel = (day: number, now: Date = new Date()) => `${String(day + 1).padStart(2, "0")} ${MONTHS_SHORT[now.getMonth()]}`;

/* "07 September" 형태. */
export const dateLabelLong = (day: number, now: Date = new Date()) => `${String(day + 1).padStart(2, "0")} ${MONTHS_LONG[now.getMonth()]}`;
