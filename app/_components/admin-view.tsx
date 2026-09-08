"use client";

import { useState } from "react";
import { ChevronLeft, ImagePlus, Plus, Trash2 } from "lucide-react";
import { archive, dateLabel, TRACKS_PER_BOX, type Track } from "@/app/_lib/tracks";
import { useAdmin } from "@/app/_lib/admin-context";
import { fileToDataUrl } from "@/app/_lib/image";

/* 편집 중에는 키워드를 문자열로 다루고, 저장 시 Track으로 변환한다. */
type Row = { title: string; artist: string; keywords: string; note: string; image: string };
const emptyRow = (): Row => ({ title: "", artist: "", keywords: "", note: "", image: "" });
const toRow = (t: Track): Row => ({ title: t.title, artist: t.artist, keywords: t.tags.join(", "), note: t.note, image: t.image ?? "" });
const parseTags = (s: string) => s.split(",").map((x) => x.replace(/\s+/g, " ").trim().toUpperCase()).filter(Boolean);
const toTrack = (r: Row): Track => ({
  title: r.title.trim(),
  artist: r.artist.trim(),
  tags: parseTags(r.keywords),
  note: r.note.trim(),
  image: r.image.trim() || undefined,
});
const isBlank = (r: Row) => !r.title.trim() && !r.artist.trim() && !r.note.trim() && !r.image.trim() && !parseTags(r.keywords).length;

const inputCls = "w-full border border-black/20 bg-white px-3 py-2 text-sm outline-none focus:border-[#c94729]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-[.16em] text-black/50">{label}</span>
      {children}
    </label>
  );
}

export function AdminView({ initialDay, onClose }: { initialDay: number; onClose: () => void }) {
  const { days } = useAdmin();
  const [day, setDay] = useState(initialDay);

  return (
    <article className="paper-panel p-6 md:p-9">
      <div className="flex items-center gap-3 border-b border-black/20 pb-5">
        <button onClick={onClose} className="icon-btn" aria-label="뒤로"><ChevronLeft size={18} /></button>
        <div>
          <p className="text-xs uppercase tracking-[.2em] text-black/50">Admin · 트랙리스트 등록 / 수정</p>
          <h2 className="brand mt-1 text-4xl md:text-5xl">TRACKLIST EDITOR</h2>
        </div>
      </div>

      <p className="mt-5 text-xs uppercase tracking-[.2em] text-black/50">날짜 선택</p>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
        {archive.map((_, i) => {
          const count = days[i]?.length ?? 0;
          const activeDay = i === day;
          return (
            <button
              key={i}
              onClick={() => setDay(i)}
              className={`flex shrink-0 flex-col items-start border px-3 py-2 transition ${activeDay ? "border-[#c94729] bg-[#c94729] text-white" : "border-black/20 bg-[#f3efe7] hover:bg-black/5"}`}
            >
              <span className="brand text-lg leading-none">{dateLabel(i)}</span>
              <span className="mt-1 text-[10px] font-bold uppercase tracking-[.12em] opacity-80">{count ? `${count}곡 등록` : "미등록"}</span>
            </button>
          );
        })}
      </div>

      <DayEditor key={day} day={day} />
    </article>
  );
}

function DayEditor({ day }: { day: number }) {
  const { days, saveDay, clearDay } = useAdmin();
  const [rows, setRows] = useState<Row[]>(() => (days[day]?.length ? days[day].map(toRow) : [emptyRow()]));
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const hasSaved = Boolean(days[day]?.length);

  const update = (idx: number, patch: Partial<Row>) => {
    setRows((r) => r.map((row, i) => (i === idx ? { ...row, ...patch } : row)));
    setStatus(null);
  };
  const addRow = () => setRows((r) => (r.length >= TRACKS_PER_BOX ? r : [...r, emptyRow()]));
  const removeRow = (idx: number) => setRows((r) => (r.length === 1 ? [emptyRow()] : r.filter((_, i) => i !== idx)));

  const pickImage = async (idx: number, file: File | undefined) => {
    if (!file) return;
    try {
      update(idx, { image: await fileToDataUrl(file) });
    } catch (e) {
      setStatus({ ok: false, msg: e instanceof Error ? e.message : "이미지 처리 중 오류가 발생했습니다." });
    }
  };

  const save = () => {
    const cleaned = rows.filter((r) => !isBlank(r)).map(toTrack);
    if (!cleaned.length) {
      setStatus({ ok: false, msg: "최소 한 곡 이상 입력해 주세요." });
      return;
    }
    const missingTitle = cleaned.some((t) => !t.title);
    if (missingTitle) {
      setStatus({ ok: false, msg: "제목이 없는 곡이 있습니다. 제목은 필수입니다." });
      return;
    }
    const ok = saveDay(day, cleaned);
    setStatus({
      ok,
      msg: ok
        ? `${dateLabel(day)} 트랙리스트를 저장했어요. (${cleaned.length}곡)`
        : "메모리에는 반영했지만 브라우저 저장에 실패했습니다(용량 초과). 이미지 개수를 줄여보세요.",
    });
  };

  const reset = () => {
    clearDay(day);
    setRows([emptyRow()]);
    setStatus({ ok: true, msg: `${dateLabel(day)}의 등록 내용을 비웠어요.` });
  };

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-bold">{dateLabel(day)} · {rows.length}/{TRACKS_PER_BOX}곡</p>
        <div className="flex gap-2">
          {hasSaved && (
            <button onClick={reset} className="border border-black/20 px-3 py-2 text-xs font-bold uppercase tracking-[.14em] transition hover:bg-black/5">
              이 날짜 비우기
            </button>
          )}
          <button onClick={save} className="bg-[#171614] px-5 py-2 text-xs font-bold uppercase tracking-[.14em] text-white transition hover:bg-[#ce4c2b]">
            저장
          </button>
        </div>
      </div>

      {status && (
        <p className={`mt-3 border px-3 py-2 text-sm font-semibold ${status.ok ? "border-[#2f7d4f] text-[#2f7d4f]" : "border-[#c94729] text-[#c94729]"}`}>
          {status.msg}
        </p>
      )}

      <div className="mt-4 space-y-4">
        {rows.map((row, i) => {
          const tags = parseTags(row.keywords);
          return (
            <div key={i} className="border border-black/15 bg-[#f3efe7] p-4 md:p-5">
              <div className="flex items-center justify-between">
                <span className="brand text-3xl text-[#c94729]">{String(i + 1).padStart(2, "0")}</span>
                <button onClick={() => removeRow(i)} className="flex items-center gap-1 text-xs font-bold text-black/50 transition hover:text-[#c94729]">
                  <Trash2 size={13} /> 삭제
                </button>
              </div>

              <div className="mt-3 grid gap-4 md:grid-cols-[160px_minmax(0,1fr)]">
                <div>
                  <div className="grid aspect-square w-full place-items-center overflow-hidden border border-black/15 bg-white">
                    {row.image
                      ? <img src={row.image} alt="" className="h-full w-full object-cover grayscale" />
                      : <span className="text-[11px] font-bold uppercase tracking-[.14em] text-black/35">No image</span>}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <label className="flex cursor-pointer items-center gap-1.5 border border-black/20 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[.12em] transition hover:bg-black/5">
                      <ImagePlus size={13} /> 사진 선택
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => pickImage(i, e.target.files?.[0])} />
                    </label>
                    {row.image && (
                      <button onClick={() => update(i, { image: "" })} className="border border-black/20 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[.12em] transition hover:bg-black/5">
                        제거
                      </button>
                    )}
                  </div>
                  <input
                    value={row.image}
                    onChange={(e) => update(i, { image: e.target.value })}
                    placeholder="또는 이미지 URL"
                    className="mt-2 w-full border border-black/20 bg-white px-2 py-1.5 text-xs outline-none focus:border-[#c94729]"
                  />
                </div>

                <div className="space-y-3">
                  <Field label="제목"><input value={row.title} onChange={(e) => update(i, { title: e.target.value })} className={inputCls} placeholder="곡 제목" /></Field>
                  <Field label="아티스트"><input value={row.artist} onChange={(e) => update(i, { artist: e.target.value })} className={inputCls} placeholder="아티스트명" /></Field>
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
