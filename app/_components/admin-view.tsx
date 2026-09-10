"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2, Search } from "lucide-react";
import { dateLabel, monthDates, monthLabel, monthOf, shiftMonth, TRACKS_PER_BOX, type Track } from "@/app/_lib/tracks";
import { useAdmin } from "@/app/_lib/admin-context";
import { hasYouTubeApiKey, parseYouTubeId, searchYouTube } from "@/app/_lib/youtube-search";

/* 편집 중에는 키워드를 문자열로 다루고, 저장 시 Track으로 변환한다. */
type Row = { title: string; artist: string; keywords: string; note: string; youtubeId: string };
const emptyRow = (): Row => ({ title: "", artist: "", keywords: "", note: "", youtubeId: "" });
const toRow = (t: Track): Row => ({ title: t.title, artist: t.artist, keywords: t.tags.join(", "), note: t.note, youtubeId: t.youtubeId ?? "" });
const parseTags = (s: string) => s.split(",").map((x) => x.replace(/\s+/g, " ").trim().toUpperCase()).filter(Boolean);
const toTrack = (r: Row): Track => ({
  title: r.title.trim(),
  artist: r.artist.trim(),
  tags: parseTags(r.keywords),
  note: r.note.trim(),
  youtubeId: parseYouTubeId(r.youtubeId) || undefined,
});
const isBlank = (r: Row) => !r.title.trim() && !r.artist.trim() && !r.note.trim() && !parseTags(r.keywords).length;

const inputCls = "w-full border border-black/20 bg-white px-3 py-2 text-sm outline-none focus:border-[#b5121b]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-[.16em] text-black/50">{label}</span>
      {children}
    </label>
  );
}

export function AdminView({ initialDate, onClose }: { initialDate: string; onClose: () => void }) {
  const { monthCounts, ensureMonth } = useAdmin();
  const [date, setDate] = useState(initialDate);
  const [ym, setYm] = useState(monthOf(initialDate));

  useEffect(() => { ensureMonth(ym); }, [ym, ensureMonth]);

  const changeMonth = (next: string) => {
    setYm(next);
    setDate(monthOf(initialDate) === next ? initialDate : `${next}-01`);
  };

  return (
    <article className="paper-panel p-6 md:p-9">
      <div className="flex items-center gap-3 border-b border-black/20 pb-5">
        <button onClick={onClose} className="icon-btn" aria-label="뒤로"><ChevronLeft size={18} /></button>
        <div>
          <p className="text-xs uppercase tracking-[.2em] text-black/50">Admin · 트랙리스트 등록 / 수정</p>
          <h2 className="brand mt-1 text-4xl md:text-5xl">TRACKLIST EDITOR</h2>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[.2em] text-black/50">날짜 선택</p>
        <div className="flex items-center gap-2">
          <button onClick={() => changeMonth(shiftMonth(ym, -1))} aria-label="지난 달" className="icon-btn"><ChevronLeft size={16} /></button>
          <span className="brand min-w-[9rem] text-center text-lg tracking-[.06em]">{monthLabel(ym)}</span>
          <button onClick={() => changeMonth(shiftMonth(ym, 1))} aria-label="다음 달" className="icon-btn"><ChevronRight size={16} /></button>
        </div>
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
        {monthDates(ym).map((d) => {
          const count = monthCounts[d] ?? 0;
          const activeDay = d === date;
          return (
            <button
              key={d}
              onClick={() => setDate(d)}
              className={`flex shrink-0 flex-col items-start border px-3 py-2 transition ${activeDay ? "border-[#b5121b] bg-[#b5121b] text-white" : "border-black/20 bg-[#faf8f2] hover:bg-black/5"}`}
            >
              <span className="brand text-lg leading-none">{dateLabel(d)}</span>
              <span className="mt-1 text-[10px] font-bold uppercase tracking-[.12em] opacity-80">{count ? `${count}곡 등록` : "미등록"}</span>
            </button>
          );
        })}
      </div>

      <DayEditor key={date} date={date} />
    </article>
  );
}

function DayEditor({ date }: { date: string }) {
  const { getDay, ensureDay, saveDay, clearDay } = useAdmin();
  const cached = getDay(date); // Track[] | null | undefined
  const [rows, setRows] = useState<Row[]>([emptyRow()]);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [searching, setSearching] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const hasSaved = (cached?.length ?? 0) > 0;

  useEffect(() => { ensureDay(date); }, [date, ensureDay]);

  // 서버에서 이 날짜 데이터가 도착하면 폼을 한 번 채운다.
  useEffect(() => {
    if (ready || cached === undefined) return;
    /* eslint-disable-next-line react-hooks/set-state-in-effect -- 서버 로드 후 1회 초기화 */
    setRows(cached && cached.length ? cached.map(toRow) : [emptyRow()]);
    setReady(true);
  }, [cached, ready]);

  const update = (idx: number, patch: Partial<Row>) => {
    setRows((r) => r.map((row, i) => (i === idx ? { ...row, ...patch } : row)));
    setStatus(null);
  };
  const addRow = () => setRows((r) => (r.length >= TRACKS_PER_BOX ? r : [...r, emptyRow()]));
  const removeRow = (idx: number) => setRows((r) => (r.length === 1 ? [emptyRow()] : r.filter((_, i) => i !== idx)));

  /* 제목+아티스트로 공식 음원 영상을 검색해 youtubeId를 채운다 */
  const runSearch = async (idx: number) => {
    const row = rows[idx];
    if (!row || !row.title.trim() || searching !== null) return;
    setSearching(idx);
    setStatus(null);
    try {
      const hit = await searchYouTube(row.title, row.artist);
      setRows((r) => r.map((x, k) => (k === idx ? { ...x, youtubeId: hit.videoId } : x)));
    } catch (e) {
      setStatus({ ok: false, msg: e instanceof Error ? e.message : "유튜브 검색에 실패했습니다." });
    } finally {
      setSearching((s) => (s === idx ? null : s));
    }
  };

  /* 곡을 입력하면(제목·아티스트가 채워지면) 영상이 없을 때 자동으로 한 번 검색 */
  const maybeAutoSearch = (idx: number) => {
    if (!hasYouTubeApiKey() || searching !== null) return;
    const row = rows[idx];
    if (row && row.title.trim() && row.artist.trim() && !parseYouTubeId(row.youtubeId)) runSearch(idx);
  };

  const save = async () => {
    if (saving) return;
    const cleaned = rows.filter((r) => !isBlank(r)).map(toTrack);
    if (!cleaned.length) {
      setStatus({ ok: false, msg: "최소 한 곡 이상 입력해 주세요." });
      return;
    }
    if (cleaned.some((t) => !t.title)) {
      setStatus({ ok: false, msg: "제목이 없는 곡이 있습니다. 제목은 필수입니다." });
      return;
    }
    setSaving(true);
    const res = await saveDay(date, cleaned);
    setSaving(false);
    setStatus({ ok: res.ok, msg: res.ok ? `${dateLabel(date)} ${res.msg}` : res.msg });
  };

  const reset = async () => {
    if (saving) return;
    setSaving(true);
    await clearDay(date);
    setSaving(false);
    setRows([emptyRow()]);
    setStatus({ ok: true, msg: `${dateLabel(date)}의 등록 내용을 비웠어요.` });
  };

  if (!ready) {
    return <p className="mt-8 text-sm text-black/50">불러오는 중…</p>;
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-bold">{dateLabel(date)} · {rows.length}/{TRACKS_PER_BOX}곡</p>
        <div className="flex gap-2">
          {hasSaved && (
            <button onClick={reset} disabled={saving} className="border border-black/20 px-3 py-2 text-xs font-bold uppercase tracking-[.14em] transition hover:bg-black/5 disabled:opacity-50">
              이 날짜 비우기
            </button>
          )}
          <button onClick={save} disabled={saving} className="bg-black px-5 py-2 text-xs font-bold uppercase tracking-[.14em] text-white transition hover:bg-[#b5121b] disabled:opacity-50">
            {saving ? "저장 중…" : "저장"}
          </button>
        </div>
      </div>

      {!hasYouTubeApiKey() && (
        <p className="mt-3 border border-black/20 px-3 py-2 text-xs text-black/55">
          유튜브 자동 검색이 꺼져 있어요. <code>.env</code>에 <code>VITE_YOUTUBE_API_KEY</code>를 설정하면 곡 입력 시 공식 음원 영상을 자동으로 찾아줍니다. 지금은 아래 칸에 유튜브 링크/ID를 직접 붙여넣으세요.
        </p>
      )}

      {status && (
        <p className={`mt-3 border px-3 py-2 text-sm font-semibold ${status.ok ? "border-[#2f7d4f] text-[#2f7d4f]" : "border-[#b5121b] text-[#b5121b]"}`}>
          {status.msg}
        </p>
      )}

      <div className="mt-4 space-y-4">
        {rows.map((row, i) => {
          const tags = parseTags(row.keywords);
          const vid = parseYouTubeId(row.youtubeId);
          return (
            <div key={i} className="border border-black/15 bg-[#faf8f2] p-4 md:p-5">
              <div className="flex items-center justify-between">
                <span className="brand text-3xl text-[#b5121b]">{String(i + 1).padStart(2, "0")}</span>
                <button onClick={() => removeRow(i)} className="flex items-center gap-1 text-xs font-bold text-black/50 transition hover:text-[#b5121b]">
                  <Trash2 size={13} /> 삭제
                </button>
              </div>

              <div className="mt-3 grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
                <div className="space-y-2">
                  <div className="grid aspect-video w-full place-items-center overflow-hidden border border-black/15 bg-black text-white/50">
                    {vid
                      ? <img src={`https://img.youtube.com/vi/${vid}/mqdefault.jpg`} alt="" className="h-full w-full object-cover" />
                      : <span className="text-[11px] font-bold uppercase tracking-[.14em]">영상 없음</span>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => runSearch(i)}
                      disabled={!row.title.trim() || searching !== null}
                      className="flex items-center gap-1.5 border border-black/20 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[.12em] transition hover:bg-black/5 disabled:opacity-40"
                    >
                      <Search size={13} /> {searching === i ? "찾는 중…" : vid ? "다시 찾기" : "유튜브에서 찾기"}
                    </button>
                    {vid && (
                      <button type="button" onClick={() => update(i, { youtubeId: "" })} className="border border-black/20 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[.12em] transition hover:bg-black/5">
                        제거
                      </button>
                    )}
                  </div>
                  <input
                    value={row.youtubeId}
                    onChange={(e) => update(i, { youtubeId: e.target.value })}
                    onBlur={(e) => { const id = parseYouTubeId(e.target.value); if (id && id !== e.target.value) update(i, { youtubeId: id }); }}
                    placeholder="또는 유튜브 링크 / ID"
                    className="w-full border border-black/20 bg-white px-2 py-1.5 text-xs outline-none focus:border-[#b5121b]"
                  />
                </div>

                <div className="space-y-3">
                  <Field label="제목"><input value={row.title} onChange={(e) => update(i, { title: e.target.value })} onBlur={() => maybeAutoSearch(i)} className={inputCls} placeholder="곡 제목" /></Field>
                  <Field label="아티스트"><input value={row.artist} onChange={(e) => update(i, { artist: e.target.value })} onBlur={() => maybeAutoSearch(i)} className={inputCls} placeholder="아티스트명" /></Field>
                  <Field label="키워드"><input value={row.keywords} onChange={(e) => update(i, { keywords: e.target.value })} className={inputCls} placeholder="쉼표로 구분 · 예: CITY POP, JAPAN" /></Field>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((tag) => <span key={tag} className="border border-black/40 px-2 py-0.5 text-[10px] font-bold">{tag}</span>)}
                    </div>
                  )}
                  <Field label="설명"><textarea value={row.note} onChange={(e) => update(i, { note: e.target.value })} rows={3} className={`${inputCls} resize-y`} placeholder="이 곡을 소개하는 짧은 글" /></Field>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={addRow}
        disabled={rows.length >= TRACKS_PER_BOX}
        className="mt-4 flex w-full items-center justify-center gap-2 border border-dashed border-black/30 py-3 text-xs font-bold uppercase tracking-[.16em] transition hover:bg-black/5 disabled:opacity-40"
      >
        <Plus size={14} /> 곡 추가
      </button>
    </div>
  );
}
