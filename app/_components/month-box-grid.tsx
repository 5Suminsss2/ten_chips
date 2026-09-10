"use client";

import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { monthDates, monthLabel, shiftMonth, symbolFor } from "@/app/_lib/tracks";
import { useAdmin } from "@/app/_lib/admin-context";
import { MiniBox } from "@/app/_components/mini-box";

const SWIPE_THRESHOLD = 40;

/* 한 달치 상자를 달력처럼 보여준다. 헤더의 이전/다음 달 버튼 또는 좌우 스와이프로 월 이동. */
export function MonthBoxGrid({
  ym,
  onYmChange,
  selectedDate,
  onSelect,
  onOpen,
  large = false,
  className = "",
}: {
  ym: string; // 'YYYY-MM'
  onYmChange: (ym: string) => void;
  selectedDate: string; // 'YYYY-MM-DD'
  onSelect: (date: string) => void;
  onOpen: (date: string) => void;
  large?: boolean;
  className?: string;
}) {
  const { ensureMonth } = useAdmin();
  const touch = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => { ensureMonth(ym); }, [ym, ensureMonth]);

  const dates = monthDates(ym);

  const onTouchStart = (e: React.TouchEvent) => {
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current) return;
    const dx = e.changedTouches[0].clientX - touch.current.x;
    const dy = e.changedTouches[0].clientY - touch.current.y;
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      onYmChange(shiftMonth(ym, dx < 0 ? 1 : -1));
    }
    touch.current = null;
  };

  const gridCls = large
    ? "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5"
    : "grid grid-cols-4 gap-3 sm:grid-cols-5 xl:grid-cols-4";

  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-black/15 pb-3">
        <button
          onClick={() => onYmChange(shiftMonth(ym, -1))}
          aria-label="지난 달"
          className="flex items-center gap-1 border border-black px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.14em] transition hover:bg-black hover:text-[#f4f2ec]"
        >
          <ChevronLeft size={13} /> Prev
        </button>
        <span className="brand text-xl tracking-[.08em]">{monthLabel(ym)}</span>
        <button
          onClick={() => onYmChange(shiftMonth(ym, 1))}
          aria-label="다음 달"
          className="flex items-center gap-1 border border-black px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.14em] transition hover:bg-black hover:text-[#f4f2ec]"
        >
          Next <ChevronRight size={13} />
        </button>
      </div>

      <div className={gridCls} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {dates.map((date) => (
          <button
            key={date}
            onClick={() => (date === selectedDate ? onOpen(date) : onSelect(date))}
            className="text-left"
          >
            <MiniBox date={date} symbol={symbolFor(date)} active={date === selectedDate} large={large} />
          </button>
        ))}
      </div>
    </div>
  );
}
