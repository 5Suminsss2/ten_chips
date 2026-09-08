"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { dateLabel } from "@/app/_lib/tracks";
import { resolveTracklist, useAdmin } from "@/app/_lib/admin-context";
import { TracklistEditor } from "@/app/_components/tracklist-editor";

export function BoxTracklist({ day, onOpen }: { day: number; onOpen: () => void }) {
  const { isAdmin, custom } = useAdmin();
  const [editing, setEditing] = useState(false);
  const date = dateLabel(day);
  const list = resolveTracklist(day, custom);
  const isCustom = Boolean(custom[day]);
  return (
    <div className="mt-9">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[.2em] text-black/50">Tracklist in this box{isCustom && <span className="ml-2 text-[#c94729]">· 관리자 편성</span>}</p>
        {isAdmin && (
          <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 border border-black/20 bg-[#f3efe7] px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[.14em] transition hover:bg-[#ce4c2b] hover:text-white">
            <Pencil size={12} /> {date} 편집
          </button>
        )}
      </div>
      {editing && <TracklistEditor day={day} onClose={() => setEditing(false)} />}
      <div className="tt-scene mt-3 pt-12">
        <div className="tt-box text-[#f7efe2]">
          <div className="tt-box__lid" aria-hidden="true" />
          <div className="relative z-[2] flex items-center justify-between px-4 pt-3 pb-2 [text-shadow:0_1px_2px_rgba(0,0,0,.4)]"><span className="brand text-2xl">{date}</span><span className="flex items-center gap-2 text-right text-[10px] font-bold uppercase leading-tight tracking-[.16em]">Ten tracks<br />A wider you.<span className="text-lg">◎</span></span></div>
          <div className="tt-box__floor z-[2] flex gap-[3px] overflow-x-auto px-3 pt-3 pb-3">{list.map((name, i) => <button key={i} onClick={onOpen} className="tt-spine flex h-44 w-7 shrink-0 flex-1 flex-col items-center gap-2 py-2 text-black/80 transition-transform duration-200 hover:-translate-y-1.5" aria-label={`${i + 1}번 트랙 ${name}`}><span className="brand text-[13px]">{String(i + 1).padStart(2, "0")}</span><span className="[writing-mode:vertical-rl] rotate-180 whitespace-nowrap text-[11px] font-semibold tracking-wide">{name}</span></button>)}</div>
          <div className="relative z-[2] px-4 py-2 text-center text-[10px] font-bold uppercase tracking-[.32em] [text-shadow:0_1px_2px_rgba(0,0,0,.4)]">◎ {date} · Ten Tracks</div>
        </div>
      </div>
    </div>
  );
}
