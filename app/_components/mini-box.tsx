"use client";

import { useAdmin } from "@/app/_lib/admin-context";

const glyphs: Record<string, string> = { leaf: "❧", mountain: "△", moon: "◐", house: "⌂", tree: "♠", cat: "♣", globe: "◎", bird: "⌁", flower: "✤", wave: "≋" };

export function MiniBox({ index, symbol, active, large = false }: { index: number; symbol: string; active: boolean; large?: boolean }) {
  const { custom } = useAdmin();
  return (
    <div className={`specimen-box aspect-[.72] p-3 transition hover:-translate-y-1 ${active ? "active-box" : ""} ${large ? "min-h-48" : ""}`}>
      {custom[index] && <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-[#c94729] ring-2 ring-white/70" title="관리자가 편성한 트랙리스트" />}
      <p className="brand text-2xl">{String(index + 1).padStart(2, "0")}</p>
      <p className="text-[10px] font-bold">{String(index + 1).padStart(2, "0")} SEP</p>
      <div className="grid flex-1 place-items-center text-4xl">{glyphs[symbol]}</div>
      <p className="text-[9px] uppercase tracking-wider">{active ? "Today's box" : index > 6 ? "Collected" : "Completed"}</p>
    </div>
  );
}
