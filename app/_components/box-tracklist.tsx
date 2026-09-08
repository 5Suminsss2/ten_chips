"use client";

import { Pencil } from "lucide-react";
import { dateLabel } from "@/app/_lib/tracks";
import { tracklistTitles, useAdmin } from "@/app/_lib/admin-context";

export function BoxTracklist({ day, onOpen, onEditDay }: { day: number; onOpen: (day: number) => void; onEditDay: (day: number) => void }) {
  const { isAdmin, days } = useAdmin();
  const date = dateLabel(day);
  const list = tracklistTitles(day, days);
  const isCustom = Boolean(days[day]?.length);
  return (
    <div className="mt-9">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[.2em] text-black/50">Tracklist in this box{isCustom && <span className="ml-2 text-[#f5402a]">· 관리자 편성</span>}</p>
        {isAdmin && (
          <button onClick={() => onEditDay(day)} className="flex items-center gap-1.5 border border-black/20 bg-[#f3f4ef] px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[.14em] transition hover:bg-[#f5402a] hover:text-white">
            <Pencil size={12} /> {date} 편집
          </button>
        )}
      </div>
      <div className="tt-scene mt-3 pt-12">
        <div className="tt-box text-[#f1f1e6]">
          <div className="tt-box__lid" aria-hidden="true" />
          <div className="relative z-[2] flex items-center justify-between px-4 pt-3 pb-2 [text-shadow:0_1px_2px_rgba(0,0,0,.4)]"><span className="brand text-2xl">{date}</span><span className="flex items-center gap-2 text-right text-[10px] font-bold uppercase leading-tight tracking-[.16em]">Ten tracks<br />A wider you.<span className="text-lg">◎</span></span></div>
          <div className="tt-box__floor z-[2] flex gap-[3px] overflow-x-auto px-3 pt-3 pb-3">{list.map((name, i) => <button key={i} onClick={() => onOpen(day)} className="tt-spine flex h-44 w-7 shrink-0 flex-1 flex-col items-center gap-2 py-2 text-black/80 transition-transform duration-200 hover:-translate-y-1.5" aria-label={`${i + 1}번 트랙 ${name}`}><span className="brand text-[13px]">{String(i + 1).padStart(2, "0")}</span><span className="[writing-mode:vertical-rl] rotate-180 whitespace-nowrap text-[11px] font-semibold tracking-wide">{name}</span></button>)}</div>
          <div className="relative z-[2] px-4 py-2 text-center text-[10px] font-bold uppercase tracking-[.32em] [text-shadow:0_1px_2px_rgba(0,0,0,.4)]">◎ {date} · Ten Tracks</div>
        </div>
      </div>
    </div>
  );
}
