"use client";

import { useEffect } from "react";
import { Pencil } from "lucide-react";
import { dateLabel } from "@/app/_lib/tracks";
import { tracklistEntries, useAdmin } from "@/app/_lib/admin-context";

export function BoxTracklist({ date, onOpen, onEditDay }: { date: string; onOpen: (date: string) => void; onEditDay: (date: string) => void }) {
  const { isAdmin, monthCounts, getDay, ensureDay } = useAdmin();
  useEffect(() => { ensureDay(date); }, [date, ensureDay]);
  const label = dateLabel(date);
  const list = tracklistEntries(getDay(date), date);
  const isCustom = (monthCounts[date] ?? 0) > 0;
  return (
    <div className="mt-9">
      <div className="flex items-center justify-between border-b border-black pb-1">
        <p className="text-xs uppercase tracking-[.2em]">Tracklist in this box{isCustom && <span className="ml-2 font-bold text-[#b5121b]">· 관리자 편성</span>}</p>
        {isAdmin && (
          <button onClick={() => onEditDay(date)} className="flex items-center gap-1.5 border border-black px-2.5 py-1 text-[11px] font-bold uppercase tracking-[.14em] transition hover:bg-black hover:text-[#f4f2ec]">
            <Pencil size={12} /> {label} 편집
          </button>
        )}
      </div>
      <div className="mt-3 border border-black bg-[#faf8f2]">
        <div className="flex items-baseline justify-between border-b border-black px-3 py-2">
          <span className="brand text-2xl leading-none">{label}</span>
          <span className="text-[10px] font-bold uppercase tracking-[.18em]">Ten tracks · A wider you ◎</span>
        </div>
        <ol>
          {list.map((t, i) => (
            <li key={i} className="border-b border-black/15 last:border-b-0">
              <button
                onClick={() => onOpen(date)}
                className="group flex w-full items-baseline gap-3 px-3 py-2 text-left transition hover:bg-black hover:text-[#f4f2ec]"
                aria-label={`${i + 1}번 트랙 ${t.title} — ${t.artist}`}
              >
                <span className="brand w-6 shrink-0 text-lg tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span className="shrink-0 font-medium">{t.title}</span>
                <span className="mx-1 flex-1 self-center border-b border-dotted border-current opacity-30 group-hover:opacity-50" />
                <span className="max-w-[45%] shrink-0 truncate text-[10px] font-bold uppercase tracking-[.1em] opacity-45 group-hover:opacity-100">{t.artist}</span>
              </button>
            </li>
          ))}
        </ol>
        <div className="border-t border-black px-3 py-1.5 text-center text-[10px] font-bold uppercase tracking-[.3em]">◎ {label} · Ten Tracks</div>
      </div>
    </div>
  );
}
