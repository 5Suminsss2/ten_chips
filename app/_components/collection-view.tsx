"use client";

import { useState } from "react";
import { currentMonth, todayISO } from "@/app/_lib/tracks";
import { MonthBoxGrid } from "@/app/_components/month-box-grid";
import { BoxTracklist } from "@/app/_components/box-tracklist";

export function CollectionView({ onOpenToday, onEditDay }: { onOpenToday: (date: string) => void; onEditDay: (date: string) => void }) {
  const today = todayISO();
  const [ym, setYm] = useState(currentMonth());
  const [selectedDate, setSelectedDate] = useState(today);
  const changeMonth = (next: string) => {
    setYm(next);
    setSelectedDate(next === currentMonth() ? today : `${next}-01`);
  };
  return <article className="paper-panel p-6 md:p-9">
    <div className="flex items-end justify-between border-b border-black/20 pb-5"><div><p className="text-xs uppercase tracking-[.2em] text-black/50">Music specimen archive</p><h2 className="brand mt-2 text-5xl">COLLECTION</h2></div><p className="hidden text-right text-xs uppercase tracking-[.16em] sm:block">10 tracks<br />every day<br />a brighter you</p></div>
    <MonthBoxGrid large className="mt-7" ym={ym} onYmChange={changeMonth} selectedDate={selectedDate} onSelect={setSelectedDate} onOpen={onOpenToday} />
    <BoxTracklist date={selectedDate} onOpen={onOpenToday} onEditDay={onEditDay} />
    <div className="mt-9 border-t border-black/20 pt-6"><p className="max-w-md text-2xl font-semibold">작은 상자들이 모여,<br />더 큰 세계가 됩니다.</p></div>
  </article>;
}
