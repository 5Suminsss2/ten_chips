"use client";

import { useState } from "react";
import { Check, Lock, LogOut } from "lucide-react";
import { useAdmin } from "@/app/_lib/admin-context";

export function AdminBar() {
  const { isAdmin, signIn, signOut } = useAdmin();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  if (isAdmin) {
    return (
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 border border-[#f5402a] bg-[#f5402a] px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[.14em] text-white"><Check size={13} /> 관리자</span>
        <button onClick={signOut} className="grid size-11 place-items-center border border-black/15 bg-[#f3f4ef] transition hover:bg-black/5" aria-label="관리자 모드 종료"><LogOut size={18} /></button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button onClick={() => { setOpen((v) => !v); setError(false); }} className="grid size-11 place-items-center border border-black/15 bg-[#f3f4ef] transition hover:bg-black/5" aria-label="관리자 로그인" aria-expanded={open}><Lock size={18} /></button>
      {open && (
        <form
          onSubmit={(e) => { e.preventDefault(); if (signIn(code)) { setOpen(false); setCode(""); } else { setError(true); } }}
          className="absolute right-0 top-[calc(100%+8px)] z-30 w-60 border border-black/20 bg-[#f3f4ef] p-3 shadow-xl"
        >
          <p className="text-[11px] font-bold uppercase tracking-[.16em] text-black/55">Admin passcode</p>
          <input
            autoFocus type="password" value={code}
            onChange={(e) => { setCode(e.target.value); setError(false); }}
            className="mt-2 w-full border border-black/20 bg-white px-2.5 py-2 text-sm outline-none focus:border-[#f5402a]"
            placeholder="암호 입력"
          />
          {error && <p className="mt-1.5 text-[11px] font-semibold text-[#f5402a]">암호가 올바르지 않습니다.</p>}
          <button type="submit" className="mt-2 w-full bg-[#1b3a32] py-2 text-xs font-bold uppercase tracking-[.16em] text-white transition hover:bg-[#f5402a]">로그인</button>
        </form>
      )}
    </div>
  );
}
