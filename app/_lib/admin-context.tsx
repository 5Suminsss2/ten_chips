"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { tracklistFor, type Track } from "@/app/_lib/tracks";

/* ---------- 관리자 모드 (prototype: 클라이언트 전용, localStorage 저장) ---------- */
export const ADMIN_PASSCODE = "admin";
const LS_ADMIN = "tt-admin-mode";
const LS_DAYS = "tt-custom-days";

// key: 0-indexed day, value: 해당 날짜에 관리자가 등록한 트랙(사진/제목/아티스트/키워드/설명)
export type CustomDays = Record<number, Track[]>;

type AdminValue = {
  isAdmin: boolean;
  signIn: (code: string) => boolean;
  signOut: () => void;
  days: CustomDays;
  saveDay: (day: number, list: Track[]) => boolean;
  clearDay: (day: number) => void;
};

const AdminContext = createContext<AdminValue | null>(null);

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within <AdminProvider>");
  return ctx;
};

// 재생 화면(ListenView)에 쓸 트랙 목록 — 등록본이 있으면 그것을, 없으면 null
export const resolveDayTracks = (day: number, days: CustomDays): Track[] | null =>
  days[day]?.length ? days[day] : null;

// 상자 스파인에 표시할 제목 목록 — 등록본이 있으면 그 제목들, 없으면 자동 생성 리스트
export const tracklistTitles = (day: number, days: CustomDays): string[] => {
  const custom = days[day];
  if (custom?.length) return custom.map((t) => t.title.trim() || "(제목 미정)");
  return tracklistFor(day);
};

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [days, setDays] = useState<CustomDays>({});

  // SSR 후 마운트 시 localStorage에서 1회 복원 (하이드레이션 불일치 방지를 위해 effect에서 수행)
  useEffect(() => {
    let storedAdmin = false;
    let storedDays: CustomDays = {};
    try {
      storedAdmin = localStorage.getItem(LS_ADMIN) === "1";
      const raw = localStorage.getItem(LS_DAYS);
      if (raw) storedDays = JSON.parse(raw) as CustomDays;
    } catch {
      /* localStorage 사용 불가 — 기본값 유지 */
    }
    /* eslint-disable-next-line react-hooks/set-state-in-effect -- 외부 저장소(localStorage)에서 1회 초기 동기화 */
    setIsAdmin(storedAdmin);
    setDays(storedDays);
  }, []);

  const signIn = (code: string) => {
    if (code.trim() !== ADMIN_PASSCODE) return false;
    setIsAdmin(true);
    try { localStorage.setItem(LS_ADMIN, "1"); } catch {}
    return true;
  };
  const signOut = () => {
    setIsAdmin(false);
    try { localStorage.removeItem(LS_ADMIN); } catch {}
  };

  // 저장 성공 여부를 반환 — localStorage 용량 초과 시 false (메모리 상태는 그대로 반영)
  const saveDay = (day: number, list: Track[]) => {
    const next = { ...days, [day]: list };
    setDays(next);
    try {
      localStorage.setItem(LS_DAYS, JSON.stringify(next));
      return true;
    } catch {
      return false;
    }
  };
  const clearDay = (day: number) => {
    const next = { ...days };
    delete next[day];
    setDays(next);
    try { localStorage.setItem(LS_DAYS, JSON.stringify(next)); } catch {}
  };

  return <AdminContext.Provider value={{ isAdmin, signIn, signOut, days, saveDay, clearDay }}>{children}</AdminContext.Provider>;
}
