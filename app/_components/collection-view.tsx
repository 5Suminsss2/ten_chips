"use client";

import { useState } from "react";
import { todayIndex } from "@/app/_lib/tracks";
import { MonthBoxGrid } from "@/app/_components/month-box-grid";
import { BoxTracklist } from "@/app/_components/box-tracklist";

export function CollectionView({ onOpenToday, onEditDay }: { onOpenToday: (day: number) => void; onEditDay: (day: number) => void }) {
  const [selectedDay, setSelectedDay] = useState(todayIndex());
  return <article className="paper-panel p-6 md:p-9">
    <div className="flex items-end justify-between border-b border-black/20 pb-5"><div><p className="text-xs uppercase tracking-[.2em] text-black/50">Music specimen archive</p><h2 className="brand mt-2 text-5xl">COLLECTION</h2></div><p className="hidden text-right text-xs uppercase tracking-[.16em] sm:block">10 tracks<br />every day<br />a brighter you</p></div>
    <MonthBoxGrid large className="mt-7" selectedDay={selectedDay} onSelect={setSelectedDay} onOpen={onOpenToday} />
    <BoxTracklist day={selectedDay} onOpen={onOpenToday} onEditDay={onEditDay} />
    <div className="mt-9 border-t border-black/20 pt-6"><p className="max-w-md text-2xl font-semibold">작은 상자들이 모여,<br />더 큰 세계가 됩니다.</p></div>
  </article>;
}
