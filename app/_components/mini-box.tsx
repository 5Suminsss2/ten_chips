"use client";

import { dateLabel, todayIndex } from "@/app/_lib/tracks";
import { useAdmin } from "@/app/_lib/admin-context";

const glyphs: Record<string, string> = { leaf: "❧", mountain: "△", moon: "◐", house: "⌂", tree: "♠", cat: "♣", globe: "◎", bird: "⌁", flower: "✤", wave: "≋" };

export function MiniBox({ index, symbol, active, large = false }: { index: number; symbol: string; active: boolean; large?: boolean }) {
  const { monthCounts } = useAdmin();
  const today = todayIndex();
  return (
    <div className={`specimen-box aspect-[.72] p-3 transition hover:-translate-y-1 ${active ? "active-box" : ""} ${large ? "min-h-48" : ""}`}>
      {(monthCounts[index] ?? 0) > 0 && <span className="absolute right-1.5 top-1.5 size-2 bg-[#b5121b] ring-2 ring-white/70" title="관리자가 등록한 트랙리스트" />}
      <p className="brand text-2xl">{String(index + 1).padStart(2, "0")}</p>
      <p className="text-[10px] font-bold">{dateLabel(index)}</p>
      <div className="grid flex-1 place-items-center text-4xl">{glyphs[symbol]}</div>
      <p className="text-[9px] uppercase tracking-wider">{index === today ? "Today's box" : index > today ? "Upcoming" : "Completed"}</p>
    </div>
  );
}
