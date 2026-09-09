/**
 * 유튜브 Data API v3로 "공식 음원" 영상을 한 건 찾는다.
 *
 * 사용하려면 프로젝트 루트 `.env` 에 API 키를 넣어야 한다:
 *   VITE_YOUTUBE_API_KEY=발급받은_키
 * (Google Cloud Console → YouTube Data API v3 사용 설정 → API 키 발급)
 * 키가 없으면 검색은 비활성화되고, 관리자 화면에서 유튜브 링크/ID를 직접 붙여넣을 수 있다.
 */

const API_KEY = (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_YOUTUBE_API_KEY;

export type YtHit = { videoId: string; title: string; channel: string; thumbnail: string };

export function hasYouTubeApiKey(): boolean {
  return Boolean(API_KEY);
}

export async function searchYouTube(title: string, artist: string): Promise<YtHit> {
  if (!API_KEY) throw new Error("유튜브 API 키가 없습니다. .env 에 VITE_YOUTUBE_API_KEY 를 설정하세요.");

  const q = `${artist} ${title} official audio`.trim();
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("q", q);
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", "1");
  url.searchParams.set("key", API_KEY);

  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
    throw new Error(body?.error?.message || `유튜브 검색 실패 (${res.status})`);
  }
  const data = (await res.json()) as {
    items?: { id?: { videoId?: string }; snippet?: { title: string; channelTitle: string; thumbnails?: Record<string, { url: string }> } }[];
  };
  const item = data.items?.[0];
  if (!item?.id?.videoId || !item.snippet) throw new Error("검색 결과가 없습니다.");
  const s = item.snippet;
  return {
    videoId: item.id.videoId,
    title: s.title,
    channel: s.channelTitle,
    thumbnail: s.thumbnails?.medium?.url || s.thumbnails?.default?.url || "",
  };
}

/* watch?v=ID · youtu.be/ID · embed/ID · shorts/ID · 또는 11자리 ID 그대로 → ID만 추출 */
export function parseYouTubeId(input: string): string {
  const s = input.trim();
  if (!s) return "";
  const m =
    s.match(/(?:v=|\/embed\/|youtu\.be\/|\/shorts\/)([A-Za-z0-9_-]{11})/) ||
    s.match(/^([A-Za-z0-9_-]{11})$/);
  return m ? m[1] : "";
}
