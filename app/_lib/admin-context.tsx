"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { dateKey, dayIndexFromKey, monthRange, tracklistFor, type Track } from "@/app/_lib/tracks";

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
  monthCounts: Record<number, number>; // 상자 인덱스 → 곡 수 (지표 표시용)
  getDay: (day: number) => Track[] | null | undefined; // undefined=미로드, null=서버에 없음
  ensureDay: (day: number) => void; // 미로드면 fetch 트리거
  saveDay: (day: number, list: Track[]) => Promise<SaveResult>;
  clearDay: (day: number) => Promise<void>;
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
  day: number,
): { title: string; artist: string }[] => {
  if (dayTracks && dayTracks.length) {
    return dayTracks.map((t) => ({ title: t.title.trim() || "(제목 미정)", artist: t.artist.trim() || "미상" }));
  }
  return tracklistFor(day);
};

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [monthCounts, setMonthCounts] = useState<Record<number, number>>({});
  const [dayCache, setDayCache] = useState<Record<number, Track[] | null>>({});

  const loadedRef = useRef<Set<number>>(new Set());
  const inflightRef = useRef<Set<number>>(new Set());

  const cacheDay = useCallback((day: number, tracks: Track[] | null) => {
    loadedRef.current.add(day);
    setDayCache((c) => ({ ...c, [day]: tracks }));
  }, []);

  /* 마운트: 로그인 상태 + 이번 달 지표 로드 */
  useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => setIsAdmin(r.ok))
      .catch(() => setIsAdmin(false))
      .finally(() => setAuthReady(true));

    const [from, to] = monthRange();
    fetch(`/api/boxes?from=${from}&to=${to}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((rows: BoxSummary[]) => {
        const m: Record<number, number> = {};
        for (const row of rows) m[dayIndexFromKey(row.date)] = row.trackCount;
        setMonthCounts(m);
      })
      .catch(() => {});
  }, []);

  const ensureDay = useCallback(
    (day: number) => {
      if (loadedRef.current.has(day) || inflightRef.current.has(day)) return;
      inflightRef.current.add(day);
      fetch(`/api/boxes/${dateKey(day)}`)
        .then((r) => (r.ok ? r.json() : r.status === 404 ? Promise.resolve(null) : Promise.reject(r)))
        .then((box: ApiBox | null) => cacheDay(day, box ? box.tracks.map(toTrack) : null))
        .catch(() => cacheDay(day, null))
        .finally(() => inflightRef.current.delete(day));
    },
    [cacheDay],
  );

  const getDay = useCallback((day: number) => dayCache[day], [dayCache]);

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
    async (day: number, list: Track[]): Promise<SaveResult> => {
      try {
        const r = await fetch(`/api/admin/boxes/${dateKey(day)}`, {
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
        cacheDay(day, tracks);
        setMonthCounts((m) => ({ ...m, [day]: tracks.length }));
        return { ok: true, msg: `트랙리스트를 저장했어요. (${tracks.length}곡)` };
      } catch {
        return { ok: false, msg: "서버에 연결하지 못했습니다." };
      }
    },
    [cacheDay],
  );

  const clearDay = useCallback(
    async (day: number) => {
      try {
        await fetch(`/api/admin/boxes/${dateKey(day)}`, { method: "DELETE" });
      } catch {
        /* 무시 */
      }
      cacheDay(day, null);
      setMonthCounts((m) => {
        const next = { ...m };
        delete next[day];
        return next;
      });
    },
    [cacheDay],
  );

  return (
    <AdminContext.Provider
      value={{ isAdmin, authReady, signIn, signOut, monthCounts, getDay, ensureDay, saveDay, clearDay }}
    >
      {children}
    </AdminContext.Provider>
  );
}
