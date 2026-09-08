"use client";

import { useState } from "react";
import { Box, Home, Menu, Play, Search, Settings, UserRound } from "lucide-react";
import { dateLabel, tracks } from "@/app/_lib/tracks";
import { resolveDayTracks, useAdmin } from "@/app/_lib/admin-context";
import { AdminBar } from "@/app/_components/admin-bar";
import { NavButton } from "@/app/_components/nav-button";
import { HomeView } from "@/app/_components/home-view";
import { ListenView } from "@/app/_components/listen-view";
import { CollectionView } from "@/app/_components/collection-view";
import { AdminView } from "@/app/_components/admin-view";

export function HomeShell() {
  const { isAdmin, days } = useAdmin();
  const [view, setView] = useState<"home" | "listen" | "collection" | "admin">("home");
  const [openDay, setOpenDay] = useState(6);
  const [adminDay, setAdminDay] = useState(6);
  const [trackIndex, setTrackIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);

  const dayTracks = resolveDayTracks(openDay, days) ?? tracks;
  const total = dayTracks.length;
  const index = Math.min(trackIndex, total - 1);
  const next = () => { setTrackIndex(() => Math.min(index + 1, total - 1)); setLiked(false); };
  const prev = () => { setTrackIndex(() => Math.max(index - 1, 0)); setLiked(false); };
  const selectTrack = (i: number) => { setTrackIndex(i); setLiked(false); };

  const openListen = (day: number) => { setOpenDay(day); setTrackIndex(0); setLiked(false); setPlaying(false); setView("listen"); };
  const editDay = (day: number) => { setAdminDay(day); setView("admin"); };

  // 관리자가 아니면 admin 뷰는 렌더하지 않음
  const activeView = view === "admin" && !isAdmin ? "home" : view;

  return (
    <main className="min-h-screen bg-[#e6e7e2] text-[#161713]">
      <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col px-4 py-5 md:px-8 md:py-8">
        <header className="mb-5 flex items-end justify-between border-b border-black/20 pb-4">
          <button onClick={() => setView("home")} className="text-left" aria-label="홈으로"><h1 className="brand text-4xl leading-none md:text-5xl">TEN TRACKS</h1><p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.24em]">A smaller world · a richer listen</p></button>
          <div className="flex items-center gap-2">
            <AdminBar />
            <button className="grid size-11 place-items-center border border-black/15 bg-[#f3f4ef] transition hover:bg-[#f5402a] hover:text-white" aria-label="메뉴"><Menu size={21} /></button>
          </div>
        </header>
        <div className="grid flex-1 gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="hidden flex-col justify-between border-r border-black/15 pr-5 lg:flex">
            <div><p className="text-xs uppercase tracking-[0.24em] text-black/50">07 September</p><p className="mt-5 max-w-[190px] text-2xl font-semibold leading-tight">오늘도, 음악이 조금 더 넓은 세계로.</p></div>
            <nav className="space-y-1">
              <NavButton active={activeView === "home"} onClick={() => setView("home")} icon={<Home size={18} />} label="HOME" />
              <NavButton active={activeView === "listen"} onClick={() => setView("listen")} icon={<Play size={18} />} label="LISTEN" />
              <NavButton active={activeView === "collection"} onClick={() => setView("collection")} icon={<Box size={18} />} label="COLLECTION" />
              {isAdmin && <NavButton active={activeView === "admin"} onClick={() => setView("admin")} icon={<Settings size={18} />} label="ADMIN" />}
            </nav>
          </aside>
          <section className="min-w-0">
            {activeView === "home" && <HomeView onOpen={openListen} onCollection={() => setView("collection")} onEditDay={editDay} />}
            {activeView === "listen" && <ListenView tracks={dayTracks} index={index} playing={playing} liked={liked} date={dateLabel(openDay)} onBack={() => setView("home")} onToggle={() => setPlaying(!playing)} onLike={() => setLiked(!liked)} onNext={next} onPrev={prev} onSelect={selectTrack} />}
            {activeView === "collection" && <CollectionView onOpenToday={openListen} onEditDay={editDay} />}
            {activeView === "admin" && <AdminView initialDay={adminDay} onClose={() => setView("home")} />}
          </section>
        </div>
        <nav className="fixed inset-x-4 bottom-4 z-20 flex justify-around border border-black/15 bg-[#f3f4ef]/95 p-2 shadow-xl backdrop-blur lg:hidden">
          <NavButton active={activeView === "home"} onClick={() => setView("home")} icon={<Home size={18} />} label="HOME" />
          <NavButton active={activeView === "listen"} onClick={() => setView("listen")} icon={<Search size={18} />} label="LISTEN" />
          <NavButton active={activeView === "collection"} onClick={() => setView("collection")} icon={<Box size={18} />} label="COLLECTION" />
          {isAdmin
            ? <NavButton active={activeView === "admin"} onClick={() => setView("admin")} icon={<Settings size={18} />} label="ADMIN" />
            : <NavButton active={false} onClick={() => {}} icon={<UserRound size={18} />} label="ME" />}
        </nav>
      </div>
    </main>
  );
}
