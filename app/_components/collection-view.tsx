"use client";

import { useState } from "react";
import { archive } from "@/app/_lib/tracks";
import { MiniBox } from "@/app/_components/mini-box";
import { BoxTracklist } from "@/app/_components/box-tracklist";

export function CollectionView({ onOpenToday }: { onOpenToday: () => void }) {
  const [selectedDay, setSelectedDay] = useState(6);
  return <article className="paper-panel p-6 md:p-9">
    <div className="flex items-end justify-between border-b border-black/20 pb-5"><div><p className="text-xs uppercase tracking-[.2em] text-black/50">Music specimen archive</p><h2 className="brand mt-2 text-5xl">COLLECTION</h2></div><p className="hidden text-right text-xs uppercase tracking-[.16em] sm:block">10 tracks<br />10 days<br />a brighter you</p></div>
    <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">{archive.map((symbol, i) => <button key={symbol} onClick={() => (i === selectedDay ? onOpenToday() : setSelectedDay(i))} className="text-left"><MiniBox index={i} symbol={symbol} active={i === selectedDay} large /></button>)}</div>
    <BoxTracklist day={selectedDay} onOpen={onOpenToday} />
    <div className="mt-9 border-t border-black/20 pt-6"><p className="max-w-md text-2xl font-semibold">작은 상자들이 모여,<br />더 큰 세계가 됩니다.</p></div>
  </article>;
}
