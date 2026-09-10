/**
 * 유튜브 "공식 음원" 영상 한 건을 찾는다.
 *
 * 4단계부터 검색은 서버가 대신한다 — API 키는 `server/.env` 의 `YOUTUBE_API_KEY` 에만 있고
 * 클라이언트 번들에는 들어가지 않는다. 이 엔드포인트는 관리자 세션 쿠키가 있어야 호출된다.
 */

export type YtHit = { videoId: string; title: string; channel: string; thumbnail: string };

let enabledPromise: Promise<boolean> | null = null;

/** 서버에 유튜브 API 키가 설정돼 자동 검색을 켤 수 있는지. 한 번만 조회하고 캐시한다. */
export function youtubeSearchEnabled(): Promise<boolean> {
  if (!enabledPromise) {
    enabledPromise = fetch("/api/youtube/status", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : { enabled: false }))
      .then((d: { enabled?: boolean }) => Boolean(d.enabled))
      .catch(() => false);
  }
  return enabledPromise;
}

export async function searchYouTube(title: string, artist: string): Promise<YtHit> {
  const qs = new URLSearchParams({ title });
  if (artist.trim()) qs.set("artist", artist);

  const res = await fetch(`/api/youtube/search?${qs}`, { credentials: "same-origin" });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(body?.detail || `유튜브 검색 실패 (${res.status})`);
  }
  const d = (await res.json()) as Partial<YtHit>;
  if (!d.videoId) throw new Error("검색 결과가 없습니다.");
  return { videoId: d.videoId, title: d.title ?? "", channel: d.channel ?? "", thumbnail: d.thumbnail ?? "" };
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
