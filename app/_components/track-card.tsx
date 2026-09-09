import { dateLabel, todayIndex, type Track } from "@/app/_lib/tracks";

// 곡 카드: 사진 + 제목 / 아티스트 + 키워드(tags) + 설명(note)
export function TrackCard({ track, index, dimmed, date = dateLabel(todayIndex()) }: { track: Track; index: number; dimmed?: boolean; date?: string }) {
  return (
    <div className={`flex h-full flex-col overflow-hidden border border-black/15 bg-[#faf8f2] p-5 text-left md:p-6 ${dimmed ? "blur-[1px]" : ""}`}>
      <div className="flex items-start justify-between"><span className="brand text-5xl text-[#b5121b] md:text-6xl">{String(index + 1).padStart(2, "0")}</span><div className="text-right"><p className="font-bold">낯선 장르 {index + 1}</p><p className="text-sm text-black/60">의외의 발견</p></div></div>
      <img src={track.image || "/album-palm.png"} alt={track.title ? `${track.title} 앨범 아트` : "앨범 아트"} className="mt-3 h-40 w-full border border-black/15 object-cover grayscale md:h-44" />
      <h2 className="mt-4 text-xl font-bold md:text-2xl">{track.title}</h2><p className="text-black/55">{track.artist}</p>
      <div className="mt-2 flex flex-wrap gap-2">{track.tags.map(tag => <span key={tag} className="border border-black/40 px-2 py-1 text-[11px] font-bold">{tag}</span>)}</div>
      <p className="mt-3 border-t border-black/15 pt-3 text-sm leading-relaxed">{track.note}</p>
      <div className="mt-auto flex items-end justify-between border-t border-black/20 pt-3 text-[10px] font-bold uppercase tracking-[.16em]"><span>Music specimen<br />No. {String(index + 1).padStart(2, "0")}</span><span className="text-right">Ten tracks<br />{date}</span></div>
    </div>
  );
}
