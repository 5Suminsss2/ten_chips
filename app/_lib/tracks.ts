export type Track = { title: string; artist: string; tags: string[]; note: string; image?: string };

export const tracks: Track[] = [
  { title: "La Llorona (World Mix)", artist: "Lila Downs", tags: ["WORLD", "FOLK", "MEXICO"], note: "익숙하지 않은 언어가 건네는 낯선 감정. 듣고 나면, 당신의 플레이리스트가 조금 더 넓어질 거예요." },
  { title: "Sunset in Accra", artist: "Ebo Taylor", tags: ["AFROBEAT", "GHANA"], note: "기타 한 줄에서 시작되는 느긋한 리듬. 오늘의 두 번째 낯선 세계예요." },
  { title: "Paper Moon", artist: "Mondo Grosso", tags: ["CITY POP", "JAPAN"], note: "반짝이는 도시의 밤과 조금 오래된 미래가 함께 흐르는 곡이에요." },
  { title: "The Quiet Market", artist: "Nala Sinephro", tags: ["JAZZ", "AMBIENT"], note: "서두르지 않는 소리 사이에서 오늘 놓쳤던 여백을 발견해 보세요." },
];

export const archive = ["leaf", "mountain", "moon", "house", "tree", "cat", "globe", "bird", "flower", "wave"];

export const boxTracklist = ["La Llorona", "Sunset in Accra", "Paper Moon", "The Quiet Market", "Midnight Market", "Third Culture", "Neon Prayer", "Salt Flats", "Kintsugi", "The Same Sky"];

export const TRACKS_PER_BOX = 10;

export const tracklistFor = (day: number) => boxTracklist.map((_, i) => boxTracklist[(i + day) % boxTracklist.length]);

export const dateLabel = (day: number) => `${String(day + 1).padStart(2, "0")} SEP`;
