"use client";

import { useEffect, useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import { TRACKS_PER_BOX, dateLabel } from "@/app/_lib/tracks";
import { resolveTracklist, useAdmin } from "@/app/_lib/admin-context";

export function TracklistEditor({ day, onClose }: { day: number; onClose: () => void }) {
  const { custom, saveList, clearList } = useAdmin();
  const hasCustom = Boolean(custom[day]);
  const [draft, setDraft] = useState<string[]>(() => {
    const base = resolveTracklist(day, custom);
    return Array.from({ length: TRACKS_PER_BOX }, (_, i) => (custom[day]?.[i] ?? base[i] ?? ""));
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose} role="presentation">
      <div className="paper-panel max-h-[90vh] w-full max-w-lg overflow-y-auto p-6 md:p-8" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={`${dateLabel(day)} 트랙리스트 편집`}>
        <div className="flex items-start justify-between border-b border-black/20 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[.2em] text-black/50">Edit tracklist</p>
            <p className="brand mt-1 text-4xl text-[#c94729]">{dateLabel(day)}</p>
          </div>
          <button onClick={onClose} className="icon-btn" aria-label="닫기"><X size={18} /></button>
        </div>
        <div className="mt-5 space-y-2">
          {draft.map((value, i) => (
            <label key={i} className="flex items-center gap-3">
              <span className="brand w-7 shrink-0 text-lg text-black/45">{String(i + 1).padStart(2, "0")}</span>
              <input
                value={value}
                onChange={(e) => setDraft((d) => d.map((v, j) => (j === i ? e.target.value : v)))}
                className="w-full border border-black/20 bg-white px-3 py-2 text-sm outline-none focus:border-[#c94729]"
                placeholder={`${i + 1}번 곡 제목`}
              />
            </label>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-black/20 pt-4">
          <button
            onClick={() => { saveList(day, draft.map((t) => t.trim())); onClose(); }}
            className="flex items-center gap-2 bg-[#171614] px-5 py-2.5 text-xs font-bold uppercase tracking-[.16em] text-white transition hover:bg-[#ce4c2b]"
          ><Check size={14} /> 저장</button>
          {hasCustom && (
            <button
              onClick={() => { clearList(day); onClose(); }}
              className="flex items-center gap-2 border border-black/20 px-4 py-2.5 text-xs font-bold uppercase tracking-[.16em] transition hover:bg-black/5"
            ><RotateCcw size={14} /> 기본값으로</button>
          )}
          <button onClick={onClose} className="ml-auto px-4 py-2.5 text-xs font-bold uppercase tracking-[.16em] text-black/55 transition hover:text-black">취소</button>
        </div>
      </div>
    </div>
  );
}
