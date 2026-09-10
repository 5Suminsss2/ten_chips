"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { currentMonth, monthRange, tracklistFor, type Track } from "@/app/_lib/tracks";

/* ---------- 서버 응답/요청 형태 ---------- */
type ApiTrack = { position: number; title: string; artist: string; note: string; youtubeId: string | null; tags: string[] };
type ApiBox = { date: string; note: string; tracks: ApiTrack[] };
type BoxSummary = { date: string; trackCount: number };

const toTrack = (t: ApiTrack): Track => ({
  title: t.title,
  artist: t.artist,
  tags: t.tags,
  note: t.note,
  youtubeId: t.youtubeId ?? undefined,
});
const toApiTrack = (t: Track) => ({
  title: t.title,
  artist: t.artist,
  note: t.note ?? "",
  youtubeId: t.youtubeId ?? null,
  tags: t.tags ?? [],
});

type SaveResult = { ok: boolean; msg: string };

type AdminValue = {
  isAdmin: boolean;
  authReady: boolean; // 초기 세션 확인이 끝났는지
  signIn: (password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  monthCounts: Record<string, number>; // 'YYYY-MM-DD' → 곡 수 (지표 표시용)
  ensureMonth: (ym: string) => void; // 'YYYY-MM' 지표를 아직 안 받았으면 fetch
  getDay: (date: string) => Track[] | null | undefined; // undefined=미로드, null=서버에 없음
  ensureDay: (date: string) => void; // 미로드면 fetch 트리거
  saveDay: (date: string, list: Track[]) => Promise<SaveResult>;
  clearDay: (date: string) => Promise<void>;
};

const AdminContext = createContext<AdminValue | null>(null);

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within <AdminProvider>");
  return ctx;
};

/* 재생 화면용 — 등록본이 있으면 그것, 없으면 null */
export const resolveDayTracks = (dayTracks: Track[] | null | undefined): Track[] | null =>
  dayTracks && dayTracks.length ? dayTracks : null;

/* 상자 스파인에 표시할 목록(제목·아티스트) — 등록본 없으면 자동 생성 목록 */
export const tracklistEntries = (
  dayTracks: Track[] | null | undefined,
  date: string,
): { title: string; artist: string }[] => {
  if (dayTracks && dayTracks.length) {
    return dayTracks.map((t) => ({ title: t.title.trim() || "(제목 미정)", artist: t.artist.trim() || "미상" }));
  }
  return tracklistFor(date);
};

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [monthCounts, setMonthCounts] = useState<Record<string, number>>({});
  const [dayCache, setDayCache] = useState<Record<string, Track[] | null>>({});

  const loadedRef = useRef<Set<string>>(new Set());
  const inflightRef = useRef<Set<string>>(new Set());
  const monthsRef = useRef<Set<string>>(new Set());

  const cacheDay = useCallback((date: string, tracks: Track[] | null) => {
    loadedRef.current.add(date);
    setDayCache((c) => ({ ...c, [date]: tracks }));
  }, []);

  const ensureMonth = useCallback((ym: string) => {
    if (monthsRef.current.has(ym)) return;
    monthsRef.current.add(ym);
    const [from, to] = monthRange(ym);
    fetch(`/api/boxes?from=${from}&to=${to}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((rows: BoxSummary[]) => {
        setMonthCounts((m) => {
          const next = { ...m };
          for (const row of rows) next[row.date] = row.trackCount;
          return next;
        });
      })
      .catch(() => {
        monthsRef.current.delete(ym); // 실패하면 다시 시도할 수 있게
      });
  }, []);

  /* 마운트: 로그인 상태 + 이번 달 지표 로드 */
  useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => setIsAdmin(r.ok))
      .catch(() => setIsAdmin(false))
      .finally(() => setAuthReady(true));

    ensureMonth(currentMonth());
  }, [ensureMonth]);

  const ensureDay = useCallback(
    (date: string) => {
      if (loadedRef.current.has(date) || inflightRef.current.has(date)) return;
      inflightRef.current.add(date);
      fetch(`/api/boxes/${date}`)
        .then((r) => (r.ok ? r.json() : r.status === 404 ? Promise.resolve(null) : Promise.reject(r)))
        .then((box: ApiBox | null) => cacheDay(date, box ? box.tracks.map(toTrack) : null))
        .catch(() => cacheDay(date, null))
        .finally(() => inflightRef.current.delete(date));
    },
    [cacheDay],
  );

  const getDay = useCallback((date: string) => dayCache[date], [dayCache]);

  const signIn = useCallback(async (password: string) => {
    try {
      const r = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      setIsAdmin(r.ok);
      return r.ok;
    } catch {
      return false;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/admin/session", { method: "DELETE" });
    } catch {
      /* 무시 */
    }
    setIsAdmin(false);
  }, []);

  const saveDay = useCallback(
    async (date: string, list: Track[]): Promise<SaveResult> => {
      try {
        const r = await fetch(`/api/admin/boxes/${date}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note: "", tracks: list.map(toApiTrack) }),
        });
        if (r.status === 401) {
          setIsAdmin(false);
          return { ok: false, msg: "관리자 로그인이 필요합니다. 다시 로그인해 주세요." };
        }
        if (!r.ok) {
          const d = (await r.json().catch(() => null)) as { detail?: string } | null;
          return { ok: false, msg: d?.detail || "저장에 실패했습니다." };
        }
        const box = (await r.json()) as ApiBox;
        const tracks = box.tracks.map(toTrack);
        cacheDay(date, tracks);
        setMonthCounts((m) => ({ ...m, [date]: tracks.length }));
        return { ok: true, msg: `트랙리스트를 저장했어요. (${tracks.length}곡)` };
      } catch {
        return { ok: false, msg: "서버에 연결하지 못했습니다." };
      }
    },
    [cacheDay],
  );

  const clearDay = useCallback(
    async (date: string) => {
      try {
        await fetch(`/api/admin/boxes/${date}`, { method: "DELETE" });
      } catch {
        /* 무시 */
      }
      cacheDay(date, null);
      setMonthCounts((m) => {
        const next = { ...m };
        delete next[date];
        return next;
      });
    },
    [cacheDay],
  );

  return (
    <AdminContext.Provider
      value={{ isAdmin, authReady, signIn, signOut, monthCounts, ensureMonth, getDay, ensureDay, saveDay, clearDay }}
    >
      {children}
    </AdminContext.Provider>
  );
}
