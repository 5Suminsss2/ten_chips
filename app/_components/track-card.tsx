import { dateLabel, todayIndex, type Track } from "@/app/_lib/tracks";

// 곡 카드: 앨범아트 자리(사진 또는 유튜브 플레이어) + 제목 / 아티스트 + 키워드(tags) + 설명(note)
export function TrackCard({
  track,
  index,
  dimmed,
  date = dateLabel(todayIndex()),
  isCenter = false,
  hasVideo = false,
  playerSlot,
}: {
  track: Track;
  index: number;
  dimmed?: boolean;
  date?: string;
  /* 캐러셀 중앙(재생 중인) 카드인지 */
  isCenter?: boolean;
  /* 이 곡에 연결된 유튜브 영상이 있는지 */
  hasVideo?: boolean;
  /* 중앙 카드일 때 유튜브 플레이어가 붙을 자리 */
  playerSlot?: (node: HTMLDivElement | null) => void;
}) {
  return (
    <div className={`flex h-full flex-col overflow-hidden border border-black/15 bg-[#faf8f2] p-5 text-left md:p-6 ${dimmed ? "blur-[1px]" : ""}`}>
      <div className="flex items-start justify-between"><span className="brand text-5xl text-[#b5121b] md:text-6xl">{String(index + 1).padStart(2, "0")}</span><div className="text-right"><p className="font-bold">낯선 장르 {index + 1}</p><p className="text-sm text-black/60">의외의 발견</p></div></div>
      {isCenter && hasVideo ? (
        <div ref={playerSlot} className="mt-3 h-40 w-full overflow-hidden border border-black/15 bg-black md:h-44" />
      ) : isCenter ? (
        <div className="mt-3 grid h-40 w-full place-items-center border border-black/15 bg-black px-4 text-center text-[10px] font-bold uppercase leading-relaxed tracking-[.14em] text-white/60 md:h-44">유튜브 영상 미연결</div>
      ) : (
        <img src="/album-palm.png" alt={track.title ? `${track.title} 앨범 아트` : "앨범 아트"} className="mt-3 h-40 w-full border border-black/15 object-cover grayscale md:h-44" />
      )}
      <h2 className="mt-4 text-xl font-bold md:text-2xl">{track.title}</h2><p className="text-black/55">{track.artist}</p>
      <div className="mt-2 flex flex-wrap gap-2">{track.tags.map(tag => <span key={tag} className="border border-black/40 px-2 py-1 text-[11px] font-bold">{tag}</span>)}</div>
      <p className="mt-3 border-t border-black/15 pt-3 text-sm leading-relaxed">{track.note}</p>
      <div className="mt-auto flex items-end justify-between border-t border-black/20 pt-3 text-[10px] font-bold uppercase tracking-[.16em]"><span>Music specimen<br />No. {String(index + 1).padStart(2, "0")}</span><span className="text-right">Ten tracks<br />{date}</span></div>
    </div>
  );
}
