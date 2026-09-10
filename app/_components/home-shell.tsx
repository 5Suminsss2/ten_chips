"use client";

import { useEffect, useState } from "react";
import { Box, Home, Menu, Play, Search, Settings, UserRound } from "lucide-react";
import { dateLabel, dateLabelLong, todayISO, tracks } from "@/app/_lib/tracks";
import { resolveDayTracks, useAdmin } from "@/app/_lib/admin-context";
import { AdminBar } from "@/app/_components/admin-bar";
import { NavButton } from "@/app/_components/nav-button";
import { HomeView } from "@/app/_components/home-view";
import { ListenView } from "@/app/_components/listen-view";
import { CollectionView } from "@/app/_components/collection-view";
import { AdminView } from "@/app/_components/admin-view";

export function HomeShell() {
  const { isAdmin, getDay, ensureDay } = useAdmin();
  const [view, setView] = useState<"home" | "listen" | "collection" | "admin">("home");
  const today = todayISO();
  const [openDay, setOpenDay] = useState(today);
  const [adminDay, setAdminDay] = useState(today);
  const [trackIndex, setTrackIndex] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => { ensureDay(openDay); }, [openDay, ensureDay]);
  const dayTracks = resolveDayTracks(getDay(openDay)) ?? tracks;
  const total = dayTracks.length;
  const index = Math.min(trackIndex, total - 1);
  const next = () => { setTrackIndex(() => Math.min(index + 1, total - 1)); setLiked(false); };
  const prev = () => { setTrackIndex(() => Math.max(index - 1, 0)); setLiked(false); };
  const selectTrack = (i: number) => { setTrackIndex(i); setLiked(false); };

  const openListen = (date: string) => { setOpenDay(date); setTrackIndex(0); setLiked(false); setView("listen"); };
  const editDay = (date: string) => { setAdminDay(date); setView("admin"); };

  // 관리자가 아니면 admin 뷰는 렌더하지 않음
  const activeView = view === "admin" && !isAdmin ? "home" : view;

  return (
    <main className="min-h-screen bg-[#f4f2ec] text-[#17140f]">
      <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col px-4 py-5 md:px-8 md:py-8">
        <header className="mb-5 flex items-end justify-between border-b-4 border-double border-black pb-3">
          <button onClick={() => setView("home")} className="text-left" aria-label="홈으로"><h1 className="brand text-5xl leading-[.9] md:text-6xl">TEN TRACKS</h1><p className="mt-2 border-t border-black pt-1 text-[11px] font-semibold uppercase tracking-[0.24em]">A smaller world · a richer listen</p></button>
          <div className="flex items-center gap-2">
            <AdminBar />
            <button className="grid size-11 place-items-center border border-black bg-transparent transition hover:bg-black hover:text-[#f4f2ec]" aria-label="메뉴"><Menu size={21} /></button>
          </div>
        </header>
        <div className="grid flex-1 gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="hidden flex-col justify-between border-r border-black/15 pr-5 lg:flex">
            <div><p className="text-xs uppercase tracking-[0.24em] text-black/50">{dateLabelLong(today)}</p><p className="mt-5 max-w-[190px] text-2xl font-semibold leading-tight">오늘도, 음악이 조금 더 넓은 세계로.</p></div>
            <nav className="space-y-1">
              <NavButton active={activeView === "home"} onClick={() => setView("home")} icon={<Home size={18} />} label="HOME" />
              <NavButton active={activeView === "listen"} onClick={() => setView("listen")} icon={<Play size={18} />} label="LISTEN" />
              <NavButton active={activeView === "collection"} onClick={() => setView("collection")} icon={<Box size={18} />} label="COLLECTION" />
              {isAdmin && <NavButton active={activeView === "admin"} onClick={() => setView("admin")} icon={<Settings size={18} />} label="ADMIN" />}
            </nav>
          </aside>
          <section className="min-w-0">
            {activeView === "home" && <HomeView onOpen={openListen} onCollection={() => setView("collection")} onEditDay={editDay} />}
            {activeView === "listen" && <ListenView tracks={dayTracks} index={index} liked={liked} date={dateLabel(openDay)} onBack={() => setView("home")} onLike={() => setLiked(!liked)} onNext={next} onPrev={prev} onSelect={selectTrack} />}
            {activeView === "collection" && <CollectionView onOpenToday={openListen} onEditDay={editDay} />}
            {activeView === "admin" && <AdminView initialDate={adminDay} onClose={() => setView("home")} />}
          </section>
        </div>
        <nav className="fixed inset-x-4 bottom-4 z-20 flex justify-around border border-black/15 bg-[#faf8f2]/95 p-2 backdrop-blur lg:hidden">
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
