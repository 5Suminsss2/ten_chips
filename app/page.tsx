"use client";

import { useRef, useState } from "react";
import { Box, ChevronLeft, Heart, Home, Menu, Pause, Play, Search, SkipBack, SkipForward, UserRound } from "lucide-react";

type Track = { title: string; artist: string; tags: string[]; note: string };
const tracks: Track[] = [
  { title: "La Llorona (World Mix)", artist: "Lila Downs", tags: ["WORLD", "FOLK", "MEXICO"], note: "익숙하지 않은 언어가 건네는 낯선 감정. 듣고 나면, 당신의 플레이리스트가 조금 더 넓어질 거예요." },
  { title: "Sunset in Accra", artist: "Ebo Taylor", tags: ["AFROBEAT", "GHANA"], note: "기타 한 줄에서 시작되는 느긋한 리듬. 오늘의 두 번째 낯선 세계예요." },
  { title: "Paper Moon", artist: "Mondo Grosso", tags: ["CITY POP", "JAPAN"], note: "반짝이는 도시의 밤과 조금 오래된 미래가 함께 흐르는 곡이에요." },
  { title: "The Quiet Market", artist: "Nala Sinephro", tags: ["JAZZ", "AMBIENT"], note: "서두르지 않는 소리 사이에서 오늘 놓쳤던 여백을 발견해 보세요." },
];
const archive = ["leaf", "mountain", "moon", "house", "tree", "cat", "globe", "bird", "flower", "wave"];
const boxTracklist = ["La Llorona", "Sunset in Accra", "Paper Moon", "The Quiet Market", "Midnight Market", "Third Culture", "Neon Prayer", "Salt Flats", "Kintsugi", "The Same Sky"];
const tracklistFor = (day: number) => boxTracklist.map((_, i) => boxTracklist[(i + day) % boxTracklist.length]);

export default function HomePage() {
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
          <button className="grid size-11 place-items-center border border-black/15 bg-[#f3efe7] transition hover:bg-[#ce4c2b] hover:text-white" aria-label="메뉴"><Menu size={21} /></button>
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

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) { return <button onClick={onClick} className={`flex min-w-16 items-center gap-3 px-3 py-3 text-xs font-bold tracking-wider transition ${active ? "bg-[#ce4c2b] text-white" : "hover:bg-black/5"}`}>{icon}<span className="hidden sm:inline lg:inline">{label}</span></button> }

function HomeView({ onOpen, onCollection }: { onOpen: () => void; onCollection: () => void }) {
  const [selectedDay, setSelectedDay] = useState(6);
  return <div className="grid h-full gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(390px,.95fr)]">
    <article className="paper-panel flex min-h-[610px] flex-col items-center justify-between p-6 text-center md:p-10">
      <div className="w-full border-b border-black/20 pb-4"><p className="brand text-xl tracking-[0.12em]">TODAY&apos;S BOX</p><p className="mt-2 text-xs uppercase tracking-[0.26em] text-black/55">Ten unfamiliar songs, selected daily</p></div>
      <div className="py-8"><p className="brand text-7xl text-[#c94729] md:text-8xl">07 SEP</p>
        <div className="music-box mx-auto mt-7 max-w-md p-7 text-left md:p-9"><div className="flex justify-between gap-10"><p className="brand text-3xl leading-[.85]">TEN<br />TRACKS</p><p className="text-[11px] font-semibold uppercase leading-relaxed tracking-[.16em]">Music specimens<br />for a bigger<br />tomorrow</p></div><div className="mt-20 flex items-end justify-between border-t border-black/30 pt-4"><div><p className="brand text-3xl">07 SEP</p><p className="mt-1 text-[10px] uppercase tracking-[.2em]">Ten songs. A wider you.</p></div><span className="text-3xl">◎</span></div></div>
        <button onClick={onOpen} className="mt-16 min-h-12 rounded-full bg-[#171614] px-9 text-sm font-bold text-white transition hover:-translate-y-1 hover:bg-[#ce4c2b]">오늘의 상자를 열기 →</button>
      </div>
      <button onClick={onCollection} className="w-full border-t border-black/20 pt-4 text-left text-xs font-bold uppercase tracking-[.2em]">01 · Daily music specimen collection →</button>
    </article>
    <aside className="paper-panel p-6 md:p-8"><div className="flex items-baseline justify-between"><h2 className="brand text-3xl">THIS MONTH</h2><button onClick={onCollection} className="text-xs font-bold underline">VIEW ALL</button></div><div className="mt-6 grid grid-cols-4 gap-3 sm:grid-cols-5 xl:grid-cols-4">{archive.map((symbol, i) => <button key={symbol} onClick={() => (i === selectedDay ? onOpen() : setSelectedDay(i))} className="text-left"><MiniBox index={i} symbol={symbol} active={i === selectedDay} /></button>)}</div><BoxTracklist day={selectedDay} onOpen={onOpen} /><div className="mt-7 border-t border-black/20 pt-5"><p className="text-xs uppercase tracking-[.2em] text-black/50">Collection note</p><p className="mt-2 text-lg font-semibold">작은 상자들이 모여, 더 큰 세계가 됩니다.</p></div></aside>
  </div>
}

function ListenView({ tracks, index, playing, liked, onBack, onToggle, onLike, onNext, onPrev, onSelect }: { tracks: Track[]; index: number; playing: boolean; liked: boolean; onBack: () => void; onToggle: () => void; onLike: () => void; onNext: () => void; onPrev: () => void; onSelect: (i: number) => void }) {
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

  return <article className="paper-panel mx-auto max-w-4xl p-5 md:p-9"><div className="flex items-center justify-between"><button onClick={onBack} className="icon-btn" aria-label="뒤로"><ChevronLeft /></button><p className="brand text-2xl">TEN TRACKS</p><p className="text-sm font-bold">07 SEP</p></div>
    <p className="mt-5 text-center text-sm font-bold tracking-[.28em]">{String(index + 1).padStart(2, "0")} <span className="text-black/40">/ {String(total).padStart(2, "0")}</span></p>
    <div className="relative mx-auto mt-4 h-[520px] max-w-md touch-pan-y select-none overflow-hidden outline-none sm:h-[540px]" tabIndex={0} onKeyDown={onKey} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
      {tracks.map((t, i) => {
        const offset = i - index;
        const hidden = Math.abs(offset) > 1;
        const isCenter = offset === 0;
        const shift = offset * 80 + drag * 92;
        return <div key={t.title} onClick={() => !isCenter && !hidden && onSelect(i)} role={!isCenter && !hidden ? "button" : undefined} aria-hidden={hidden} className={`absolute left-1/2 top-0 h-full w-[80%] origin-bottom transition-transform ease-out ${dragging ? "duration-0" : "duration-300"} ${!isCenter && !hidden ? "cursor-pointer" : ""}`} style={{ transform: `translateX(calc(-50% + ${shift}%)) translateY(${isCenter ? 0 : 18}px) scale(${isCenter ? 1 : 0.9}) rotate(${isCenter ? 0 : offset * 3.5}deg)`, opacity: hidden ? 0 : isCenter ? 1 : 0.5, pointerEvents: hidden ? "none" : "auto", zIndex: isCenter ? 2 : 1 }}>
          <TrackCard track={t} index={i} dimmed={!isCenter} />
        </div>;
      })}
    </div>
    <div className="mx-auto mt-6 max-w-md"><div className="h-1 bg-black/15"><div className="h-full w-[42%] bg-black" /></div><div className="mt-2 flex justify-between text-xs"><span>0:42</span><span>-3:18</span></div><div className="mt-5 flex items-center justify-center gap-5"><button onClick={onPrev} disabled={index === 0} className="icon-btn disabled:opacity-30" aria-label="이전 곡"><SkipBack /></button><button onClick={onToggle} className="grid size-16 place-items-center rounded-full bg-black text-white" aria-label={playing ? "일시정지" : "재생"}>{playing ? <Pause /> : <Play />}</button><button onClick={onNext} disabled={index === total - 1} className="icon-btn disabled:opacity-30" aria-label="다음 곡"><SkipForward /></button><button onClick={onLike} className={`icon-btn ${liked ? "bg-[#ce4c2b] text-white" : ""}`} aria-label="의외로 좋아요"><Heart fill={liked ? "currentColor" : "none"} /></button></div><p className="mt-6 text-center text-xs uppercase tracking-[.2em]">Some songs find you.</p></div>
  </article>;
}

function TrackCard({ track, index, dimmed }: { track: Track; index: number; dimmed?: boolean }) {
  return <div className={`flex h-full flex-col overflow-hidden border border-black/15 bg-[#f3efe7] p-5 text-left shadow-[0_18px_44px_rgba(28,22,16,.18)] md:p-6 ${dimmed ? "blur-[1px]" : ""}`}>
    <div className="flex items-start justify-between"><span className="brand text-5xl text-[#c94729] md:text-6xl">{String(index + 1).padStart(2, "0")}</span><div className="text-right"><p className="font-bold">낯선 장르 {index + 1}</p><p className="text-sm text-black/60">의외의 발견</p></div></div>
    <img src="/album-palm.png" alt="야자수가 보이는 흑백 앨범 아트" className="mt-3 h-40 w-full border border-black/15 object-cover grayscale md:h-44" />
    <h2 className="mt-4 text-xl font-bold md:text-2xl">{track.title}</h2><p className="text-black/55">{track.artist}</p>
    <div className="mt-2 flex flex-wrap gap-2">{track.tags.map(tag => <span key={tag} className="border border-black/40 px-2 py-1 text-[11px] font-bold">{tag}</span>)}</div>
    <p className="mt-3 border-t border-black/15 pt-3 text-sm leading-relaxed">{track.note}</p>
    <div className="mt-auto flex items-end justify-between border-t border-black/20 pt-3 text-[10px] font-bold uppercase tracking-[.16em]"><span>Music specimen<br />No. {String(index + 1).padStart(2, "0")}</span><span className="text-right">Ten tracks<br />07 SEP</span></div>
  </div>;
}

function CollectionView({ onOpenToday }: { onOpenToday: () => void }) {
  const [selectedDay, setSelectedDay] = useState(6);
  return <article className="paper-panel p-6 md:p-9">
    <div className="flex items-end justify-between border-b border-black/20 pb-5"><div><p className="text-xs uppercase tracking-[.2em] text-black/50">Music specimen archive</p><h2 className="brand mt-2 text-5xl">COLLECTION</h2></div><p className="hidden text-right text-xs uppercase tracking-[.16em] sm:block">10 tracks<br />10 days<br />a brighter you</p></div>
    <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">{archive.map((symbol, i) => <button key={symbol} onClick={() => (i === selectedDay ? onOpenToday() : setSelectedDay(i))} className="text-left"><MiniBox index={i} symbol={symbol} active={i === selectedDay} large /></button>)}</div>
    <BoxTracklist day={selectedDay} onOpen={onOpenToday} />
    <div className="mt-9 border-t border-black/20 pt-6"><p className="max-w-md text-2xl font-semibold">작은 상자들이 모여,<br />더 큰 세계가 됩니다.</p></div>
  </article>;
}

function BoxTracklist({ day, onOpen }: { day: number; onOpen: () => void }) {
  const date = `${String(day + 1).padStart(2, "0")} SEP`;
  const list = tracklistFor(day);
  return <div className="mt-9">
    <p className="text-xs uppercase tracking-[.2em] text-black/50">Tracklist in this box</p>
    <div className="tt-scene mt-3 pt-12">
    <div className="tt-box text-[#f7efe2]">
      <div className="tt-box__lid" aria-hidden="true" />
      <div className="relative z-[2] flex items-center justify-between px-4 pt-3 pb-2 [text-shadow:0_1px_2px_rgba(0,0,0,.4)]"><span className="brand text-2xl">{date}</span><span className="flex items-center gap-2 text-right text-[10px] font-bold uppercase leading-tight tracking-[.16em]">Ten tracks<br />A wider you.<span className="text-lg">◎</span></span></div>
      <div className="tt-box__floor z-[2] flex gap-[3px] overflow-x-auto px-3 pt-3 pb-3">{list.map((name, i) => <button key={i} onClick={onOpen} className="tt-spine flex h-44 w-7 shrink-0 flex-1 flex-col items-center gap-2 py-2 text-black/80 transition-transform duration-200 hover:-translate-y-1.5" aria-label={`${i + 1}번 트랙 ${name}`}><span className="brand text-[13px]">{String(i + 1).padStart(2, "0")}</span><span className="[writing-mode:vertical-rl] rotate-180 whitespace-nowrap text-[11px] font-semibold tracking-wide">{name}</span></button>)}</div>
      <div className="relative z-[2] px-4 py-2 text-center text-[10px] font-bold uppercase tracking-[.32em] [text-shadow:0_1px_2px_rgba(0,0,0,.4)]">◎ {date} · Ten Tracks</div>
    </div>
    </div>
  </div>;
}

function MiniBox({ index, symbol, active, large = false }: { index: number; symbol: string; active: boolean; large?: boolean }) { const glyphs: Record<string, string> = { leaf: "❧", mountain: "△", moon: "◐", house: "⌂", tree: "♠", cat: "♣", globe: "◎", bird: "⌁", flower: "✤", wave: "≋" }; return <div className={`specimen-box aspect-[.72] p-3 transition hover:-translate-y-1 ${active ? "active-box" : ""} ${large ? "min-h-48" : ""}`}><p className="brand text-2xl">{String(index + 1).padStart(2, "0")}</p><p className="text-[10px] font-bold">{String(index + 1).padStart(2, "0")} SEP</p><div className="grid flex-1 place-items-center text-4xl">{glyphs[symbol]}</div><p className="text-[9px] uppercase tracking-wider">{active ? "Today's box" : index > 6 ? "Collected" : "Completed"}</p></div> }
