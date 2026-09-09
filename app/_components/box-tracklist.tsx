"use client";

import { Pencil } from "lucide-react";
import { dateLabel, trackDuration } from "@/app/_lib/tracks";
import { tracklistTitles, useAdmin } from "@/app/_lib/admin-context";

export function BoxTracklist({ day, onOpen, onEditDay }: { day: number; onOpen: (day: number) => void; onEditDay: (day: number) => void }) {
  const { isAdmin, days } = useAdmin();
  const date = dateLabel(day);
  const list = tracklistTitles(day, days);
  const isCustom = Boolean(days[day]?.length);
  return (
    <div className="mt-9">
      <div className="flex items-center justify-between border-b border-black pb-1">
        <p className="text-xs uppercase tracking-[.2em]">Tracklist in this box{isCustom && <span className="ml-2 font-bold text-[#b5121b]">· 관리자 편성</span>}</p>
        {isAdmin && (
          <button onClick={() => onEditDay(day)} className="flex items-center gap-1.5 border border-black px-2.5 py-1 text-[11px] font-bold uppercase tracking-[.14em] transition hover:bg-black hover:text-[#f4f2ec]">
            <Pencil size={12} /> {date} 편집
          </button>
        )}
      </div>
      <div className="mt-3 border border-black bg-[#faf8f2]">
        <div className="flex items-baseline justify-between border-b border-black px-3 py-2">
          <span className="brand text-2xl leading-none">{date}</span>
          <span className="text-[10px] font-bold uppercase tracking-[.18em]">Ten tracks · A wider you ◎</span>
        </div>
        <ol>
          {list.map((name, i) => (
            <li key={i} className="border-b border-black/15 last:border-b-0">
              <button
                onClick={() => onOpen(day)}
                className="group flex w-full items-baseline gap-3 px-3 py-2 text-left transition hover:bg-black hover:text-[#f4f2ec]"
                aria-label={`${i + 1}번 트랙 ${name}`}
              >
                <span className="brand w-6 shrink-0 text-lg tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-medium">{name}</span>
                <span className="mx-1 flex-1 self-center border-b border-dotted border-current opacity-30 group-hover:opacity-50" />
                <span className="shrink-0 text-[10px] font-bold tabular-nums tracking-[.16em] opacity-45 group-hover:opacity-100">{trackDuration(name)}</span>
              </button>
            </li>
          ))}
        </ol>
        <div className="border-t border-black px-3 py-1.5 text-center text-[10px] font-bold uppercase tracking-[.3em]">◎ {date} · Ten Tracks</div>
      </div>
    </div>
  );
}
