"use client";

import { useState } from "react";
import { Box, Home, Menu, Play, Search, UserRound } from "lucide-react";
import { tracks } from "@/app/_lib/tracks";
import { AdminBar } from "@/app/_components/admin-bar";
import { NavButton } from "@/app/_components/nav-button";
import { HomeView } from "@/app/_components/home-view";
import { ListenView } from "@/app/_components/listen-view";
import { CollectionView } from "@/app/_components/collection-view";

export function HomeShell() {
  const [view, setView] = useState<"home" | "listen" | "collection">("home");
  const [trackIndex, setTrackIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const next = () => { setTrackIndex((i) => Math.min(i + 1, tracks.length - 1)); setLiked(false); };
  const prev = () => { setTrackIndex((i) => Math.max(i - 1, 0)); setLiked(false); };
  const selectTrack = (i: number) => { setTrackIndex(i); setLiked(false); };
  return (
    <main className="min-h-screen bg-[#e8e4dc] text-[#171614]">
      <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col px-4 py-5 md:px-8 md:py-8">
        <header className="mb-5 flex items-end justify-between border-b border-black/20 pb-4">
          <button onClick={() => setView("home")} className="text-left" aria-label="홈으로"><h1 className="brand text-4xl leading-none md:text-5xl">TEN TRACKS</h1><p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.24em]">A smaller world · a richer listen</p></button>
          <div className="flex items-center gap-2">
            <AdminBar />
            <button className="grid size-11 place-items-center border border-black/15 bg-[#f3efe7] transition hover:bg-[#ce4c2b] hover:text-white" aria-label="메뉴"><Menu size={21} /></button>
          </div>
        </header>
        <div className="grid flex-1 gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="hidden flex-col justify-between border-r border-black/15 pr-5 lg:flex">
            <div><p className="text-xs uppercase tracking-[0.24em] text-black/50">07 September</p><p className="mt-5 max-w-[190px] text-2xl font-semibold leading-tight">오늘도, 음악이 조금 더 넓은 세계로.</p></div>
            <nav className="space-y-1"><NavButton active={view === "home"} onClick={() => setView("home")} icon={<Home size={18} />} label="HOME" /><NavButton active={view === "listen"} onClick={() => setView("listen")} icon={<Play size={18} />} label="LISTEN" /><NavButton active={view === "collection"} onClick={() => setView("collection")} icon={<Box size={18} />} label="COLLECTION" /></nav>
          </aside>
          <section className="min-w-0">
            {view === "home" && <HomeView onOpen={() => setView("listen")} onCollection={() => setView("collection")} />}
            {view === "listen" && <ListenView tracks={tracks} index={trackIndex} playing={playing} liked={liked} onBack={() => setView("home")} onToggle={() => setPlaying(!playing)} onLike={() => setLiked(!liked)} onNext={next} onPrev={prev} onSelect={selectTrack} />}
            {view === "collection" && <CollectionView onOpenToday={() => setView("listen")} />}
          </section>
        </div>
        <nav className="fixed inset-x-4 bottom-4 z-20 flex justify-around border border-black/15 bg-[#f3efe7]/95 p-2 shadow-xl backdrop-blur lg:hidden"><NavButton active={view === "home"} onClick={() => setView("home")} icon={<Home size={18} />} label="HOME" /><NavButton active={view === "listen"} onClick={() => setView("listen")} icon={<Search size={18} />} label="LISTEN" /><NavButton active={view === "collection"} onClick={() => setView("collection")} icon={<Box size={18} />} label="COLLECTION" /><NavButton active={false} onClick={() => {}} icon={<UserRound size={18} />} label="ME" /></nav>
      </div>
    </main>
  );
}
