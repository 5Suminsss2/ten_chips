"use client";

import { useRef, useState } from "react";
import { ChevronLeft, Heart, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import type { Track } from "@/app/_lib/tracks";
import { TrackCard } from "@/app/_components/track-card";

export function ListenView({ tracks, index, playing, liked, date = "07 SEP", onBack, onToggle, onLike, onNext, onPrev, onSelect }: { tracks: Track[]; index: number; playing: boolean; liked: boolean; date?: string; onBack: () => void; onToggle: () => void; onLike: () => void; onNext: () => void; onPrev: () => void; onSelect: (i: number) => void }) {
  const total = tracks.length;
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef<number | null>(null);
  const width = useRef(1);

  const onDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
    width.current = e.currentTarget.getBoundingClientRect().width || 1;
    setDragging(true);
  };
  const onMove = (e: React.PointerEvent) => {
    if (startX.current === null) return;
    let d = (e.clientX - startX.current) / width.current;
    if ((index === 0 && d > 0) || (index === total - 1 && d < 0)) d *= 0.35;
    setDrag(d);
  };
  const onUp = () => {
    if (startX.current === null) return;
    if (drag < -0.18 && index < total - 1) onNext();
    else if (drag > 0.18 && index > 0) onPrev();
    startX.current = null;
    setDragging(false);
    setDrag(0);
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") onPrev();
    if (e.key === "ArrowRight") onNext();
  };

  return <article className="paper-panel mx-auto max-w-4xl p-5 md:p-9"><div className="flex items-center justify-between"><button onClick={onBack} className="icon-btn" aria-label="뒤로"><ChevronLeft /></button><p className="brand text-2xl">TEN TRACKS</p><p className="text-sm font-bold">{date}</p></div>
    <p className="mt-5 text-center text-sm font-bold tracking-[.28em]">{String(index + 1).padStart(2, "0")} <span className="text-black/40">/ {String(total).padStart(2, "0")}</span></p>
    <div className="relative mx-auto mt-4 h-[520px] max-w-md touch-pan-y select-none overflow-hidden outline-none sm:h-[540px]" tabIndex={0} onKeyDown={onKey} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
      {tracks.map((t, i) => {
        const offset = i - index;
        const hidden = Math.abs(offset) > 1;
        const isCenter = offset === 0;
        const shift = offset * 80 + drag * 92;
        return <div key={i} onClick={() => !isCenter && !hidden && onSelect(i)} role={!isCenter && !hidden ? "button" : undefined} aria-hidden={hidden} className={`absolute left-1/2 top-0 h-full w-[80%] origin-bottom transition-transform ease-out ${dragging ? "duration-0" : "duration-300"} ${!isCenter && !hidden ? "cursor-pointer" : ""}`} style={{ transform: `translateX(calc(-50% + ${shift}%)) translateY(${isCenter ? 0 : 18}px) scale(${isCenter ? 1 : 0.9}) rotate(${isCenter ? 0 : offset * 3.5}deg)`, opacity: hidden ? 0 : isCenter ? 1 : 0.5, pointerEvents: hidden ? "none" : "auto", zIndex: isCenter ? 2 : 1 }}>
          <TrackCard track={t} index={i} dimmed={!isCenter} date={date} />
        </div>;
      })}
    </div>
    <div className="mx-auto mt-6 max-w-md"><div className="h-1 bg-black/15"><div className="h-full w-[42%] bg-black" /></div><div className="mt-2 flex justify-between text-xs"><span>0:42</span><span>-3:18</span></div><div className="mt-5 flex items-center justify-center gap-5"><button onClick={onPrev} disabled={index === 0} className="icon-btn disabled:opacity-30" aria-label="이전 곡"><SkipBack /></button><button onClick={onToggle} className="grid size-16 place-items-center rounded-full bg-black text-white" aria-label={playing ? "일시정지" : "재생"}>{playing ? <Pause /> : <Play />}</button><button onClick={onNext} disabled={index === total - 1} className="icon-btn disabled:opacity-30" aria-label="다음 곡"><SkipForward /></button><button onClick={onLike} className={`icon-btn ${liked ? "bg-[#ce4c2b] text-white" : ""}`} aria-label="의외로 좋아요"><Heart fill={liked ? "currentColor" : "none"} /></button></div><p className="mt-6 text-center text-xs uppercase tracking-[.2em]">Some songs find you.</p></div>
  </article>;
}
