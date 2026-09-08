"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { tracklistFor } from "@/app/_lib/tracks";

/* ---------- 관리자 모드 (prototype: 클라이언트 전용, localStorage 저장) ---------- */
export const ADMIN_PASSCODE = "admin";
const LS_ADMIN = "tt-admin-mode";
const LS_LISTS = "tt-custom-tracklists";

export type CustomLists = Record<number, string[]>; // key: 0-indexed day, value: 10곡 제목

type AdminValue = {
  isAdmin: boolean;
  signIn: (code: string) => boolean;
  signOut: () => void;
  custom: CustomLists;
  saveList: (day: number, titles: string[]) => void;
  clearList: (day: number) => void;
};

const AdminContext = createContext<AdminValue | null>(null);

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within <AdminProvider>");
  return ctx;
};

export const resolveTracklist = (day: number, custom: CustomLists) => {
  const saved = custom[day];
  if (saved && saved.some((t) => t.trim())) return saved.map((t, i) => t.trim() || tracklistFor(day)[i]);
  return tracklistFor(day);
};

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [custom, setCustom] = useState<CustomLists>({});

  // SSR 후 마운트 시 localStorage에서 1회 복원 (하이드레이션 불일치 방지를 위해 effect에서 수행)
  useEffect(() => {
    let storedAdmin = false;
    let storedLists: CustomLists = {};
    try {
      storedAdmin = localStorage.getItem(LS_ADMIN) === "1";
      const raw = localStorage.getItem(LS_LISTS);
      if (raw) storedLists = JSON.parse(raw) as CustomLists;
    } catch {
      /* localStorage 사용 불가 — 기본값 유지 */
    }
    /* eslint-disable-next-line react-hooks/set-state-in-effect -- 외부 저장소(localStorage)에서 1회 초기 동기화 */
    setIsAdmin(storedAdmin);
    setCustom(storedLists);
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
  const persist = (next: CustomLists) => {
    setCustom(next);
    try { localStorage.setItem(LS_LISTS, JSON.stringify(next)); } catch {}
  };
  const saveList = (day: number, titles: string[]) => persist({ ...custom, [day]: titles });
  const clearList = (day: number) => {
    const next = { ...custom };
    delete next[day];
    persist(next);
  };

  return <AdminContext.Provider value={{ isAdmin, signIn, signOut, custom, saveList, clearList }}>{children}</AdminContext.Provider>;
}
