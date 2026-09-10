"use client";

import { useState } from "react";
import { currentMonth, dateLabel, todayISO } from "@/app/_lib/tracks";
import { MonthBoxGrid } from "@/app/_components/month-box-grid";
import { BoxTracklist } from "@/app/_components/box-tracklist";

export function HomeView({ onOpen, onCollection, onEditDay }: { onOpen: (date: string) => void; onCollection: () => void; onEditDay: (date: string) => void }) {
  const today = todayISO();
  const [ym, setYm] = useState(currentMonth());
  const [selectedDate, setSelectedDate] = useState(today);
  const changeMonth = (next: string) => {
    setYm(next);
    setSelectedDate(next === currentMonth() ? today : `${next}-01`);
  };
  const todayLabel = dateLabel(today);
  return <div className="grid h-full gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(390px,.95fr)]">
    <article className="paper-panel flex min-h-[610px] flex-col items-center justify-between p-6 text-center md:p-10 xl:self-start">
      <div className="w-full border-b border-black/20 pb-4"><p className="brand text-xl tracking-[0.12em]">TODAY&apos;S BOX</p><p className="mt-2 text-xs uppercase tracking-[0.26em] text-black/55">Ten unfamiliar songs, selected daily</p></div>
      <div className="py-8"><p className="brand text-7xl text-[#b5121b] md:text-8xl">{todayLabel}</p>
        <div className="music-box mx-auto mt-7 max-w-md p-7 text-left md:p-9"><div className="flex justify-between gap-10"><p className="brand text-3xl leading-[.85]">TEN<br />TRACKS</p><p className="text-[11px] font-semibold uppercase leading-relaxed tracking-[.16em]">Music specimens<br />for a bigger<br />tomorrow</p></div><div className="mt-20 flex items-end justify-between border-t border-black/30 pt-4"><div><p className="brand text-3xl">{todayLabel}</p><p className="mt-1 text-[10px] uppercase tracking-[.2em]">Ten songs. A wider you.</p></div><span className="text-3xl">◎</span></div></div>
        <button onClick={() => onOpen(selectedDate)} className="mt-16 min-h-12 bg-black px-9 text-sm font-bold text-white transition hover:-translate-y-1 hover:bg-[#b5121b]">오늘의 상자를 열기 →</button>
      </div>
      <button onClick={onCollection} className="w-full border-t border-black/20 pt-4 text-left text-xs font-bold uppercase tracking-[.2em]">01 · Daily music specimen collection →</button>
    </article>
    <aside className="paper-panel p-6 md:p-8"><div className="flex items-baseline justify-between"><h2 className="brand text-3xl">THIS MONTH</h2><button onClick={onCollection} className="text-xs font-bold underline">VIEW ALL</button></div><MonthBoxGrid className="mt-6" ym={ym} onYmChange={changeMonth} selectedDate={selectedDate} onSelect={setSelectedDate} onOpen={onOpen} /><BoxTracklist date={selectedDate} onOpen={onOpen} onEditDay={onEditDay} /><div className="mt-7 border-t border-black/20 pt-5"><p className="text-xs uppercase tracking-[.2em] text-black/50">Collection note</p><p className="mt-2 text-lg font-semibold">작은 상자들이 모여, 더 큰 세계가 됩니다.</p></div></aside>
  </div>
}
