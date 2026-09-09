"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { boxSymbols } from "@/app/_lib/tracks";
import { MiniBox } from "@/app/_components/mini-box";

const PAGE_SIZE = 12;
const PAGE_COUNT = Math.ceil(boxSymbols.length / PAGE_SIZE);
const SWIPE_THRESHOLD = 40;

/* 한 달치 상자를 10개씩 페이지로 나눠 보여준다. 좌우 버튼/점 클릭 또는 스와이프로 이동. */
export function MonthBoxGrid({
  selectedDay,
  onSelect,
  onOpen,
  large = false,
  className = "",
}: {
  selectedDay: number;
  onSelect: (day: number) => void;
  onOpen: (day: number) => void;
  large?: boolean;
  className?: string;
}) {
  const [page, setPage] = useState(() => Math.floor(selectedDay / PAGE_SIZE));
  const touch = useRef<{ x: number; y: number } | null>(null);

  const go = (next: number) => setPage(Math.min(Math.max(next, 0), PAGE_COUNT - 1));

  const start = page * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, boxSymbols.length);
  const items = boxSymbols.slice(start, end);

  const onTouchStart = (e: React.TouchEvent) => {
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current) return;
    const dx = e.changedTouches[0].clientX - touch.current.x;
    const dy = e.changedTouches[0].clientY - touch.current.y;
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      go(page + (dx < 0 ? 1 : -1));
    }
    touch.current = null;
  };

  const gridCls = large
    ? "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5"
    : "grid grid-cols-4 gap-3 sm:grid-cols-5 xl:grid-cols-4";

  return (
    <div className={className}>
      <div className={gridCls} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {items.map((symbol, k) => {
          const i = start + k;
          return (
            <button key={i} onClick={() => (i === selectedDay ? onOpen(i) : onSelect(i))} className="text-left">
              <MiniBox index={i} symbol={symbol} active={i === selectedDay} large={large} />
            </button>
          );
        })}
      </div>

      {PAGE_COUNT > 1 && (
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-black/15 pt-3">
          <button
            onClick={() => go(page - 1)}
            disabled={page === 0}
            aria-label="이전 날짜"
            className="flex items-center gap-1 border border-black px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.14em] transition hover:bg-black hover:text-[#f4f2ec] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-current"
          >
            <ChevronLeft size={13} /> Prev
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: PAGE_COUNT }, (_, p) => (
              <button
                key={p}
                onClick={() => go(p)}
                aria-label={`${p * PAGE_SIZE + 1}일부터 보기`}
                aria-current={p === page}
                className={`size-2 rounded-full transition ${p === page ? "bg-[#b5121b]" : "bg-black/25 hover:bg-black/50"}`}
              />
            ))}
            <span className="ml-1 text-[11px] font-bold tabular-nums tracking-[.1em]">
              {String(start + 1).padStart(2, "0")}–{String(end).padStart(2, "0")}
            </span>
          </div>

          <button
            onClick={() => go(page + 1)}
            disabled={page === PAGE_COUNT - 1}
            aria-label="다음 날짜"
            className="flex items-center gap-1 border border-black px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.14em] transition hover:bg-black hover:text-[#f4f2ec] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-current"
          >
            Next <ChevronRight size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
