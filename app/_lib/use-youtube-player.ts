"use client";

import { useEffect, useRef, useState } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any -- YT IFrame API에 타입 정의가 없어 any로 다룬다 */
declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

/* IFrame API 스크립트는 페이지에 한 번만 로드한다. */
let apiReady: Promise<void> | null = null;
function loadApi(): Promise<void> {
  if (typeof window === "undefined") return new Promise(() => {});
  if (window.YT?.Player) return Promise.resolve();
  if (apiReady) return apiReady;
  apiReady = new Promise<void>((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(s);
  });
  return apiReady;
}

/**
 * 유튜브 IFrame 플레이어 뼈대.
 * - hostRef 를 렌더한 <div> 에 연결하면 그 안에 플레이어가 생성된다.
 * - playing / videoId 변화에 따라 재생·일시정지·곡 교체를 처리한다.
 * - currentTime / duration 은 0.5초 간격 폴링으로 갱신한다(진행바·시간 표시용).
 */
export function useYouTubePlayer({
  videoId,
  playing,
  onEnded,
}: {
  videoId?: string;
  playing: boolean;
  onEnded?: () => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const onEndedRef = useRef(onEnded);
  useEffect(() => {
    onEndedRef.current = onEnded;
  });

  /* 플레이어 1회 생성 + 언마운트 시 파기 */
  useEffect(() => {
    let cancelled = false;
    let poll: ReturnType<typeof setInterval> | undefined;

    loadApi().then(() => {
      if (cancelled || !hostRef.current || playerRef.current) return;
      const el = document.createElement("div"); // YT 가 이 노드를 iframe 으로 치환한다
      hostRef.current.appendChild(el);
      playerRef.current = new window.YT.Player(el, {
        width: "100%",
        height: "100%",
        videoId: videoId || undefined,
        playerVars: { playsinline: 1, rel: 0, modestbranding: 1 },
        events: {
          onReady: () => {
            if (!cancelled) setReady(true);
          },
          onStateChange: (e: any) => {
            if (e.data === window.YT.PlayerState.ENDED) onEndedRef.current?.();
          },
        },
      });
      poll = setInterval(() => {
        const p = playerRef.current;
        if (!p?.getDuration) return;
        setCurrentTime(p.getCurrentTime?.() || 0);
        setDuration(p.getDuration?.() || 0);
      }, 500);
    });

    return () => {
      cancelled = true;
      if (poll) clearInterval(poll);
      try {
        playerRef.current?.destroy?.();
      } catch {
        /* 이미 정리됨 */
      }
      playerRef.current = null;
    };
    // 마운트 시 1회만 (videoId 초기값은 위에서 사용, 이후 변화는 아래 effect가 처리)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* 곡이 바뀌면 새 영상을 큐에 올린다(자동재생 X) */
  useEffect(() => {
    const p = playerRef.current;
    if (!p || !ready) return;
    setCurrentTime(0);
    setDuration(0);
    if (videoId) p.cueVideoById?.(videoId);
    else p.stopVideo?.();
  }, [videoId, ready]);

  /* playing prop 변화에 맞춰 재생/일시정지 (키보드·스와이프 등 간접 조작 대비) */
  useEffect(() => {
    const p = playerRef.current;
    if (!p || !ready || !videoId) return;
    if (playing) p.playVideo?.();
    else p.pauseVideo?.();
  }, [playing, videoId, ready]);

  /* 브라우저 자동재생 정책상 첫 재생은 클릭 핸들러 안에서 동기로 호출해야 소리가 난다. */
  const play = () => playerRef.current?.playVideo?.();
  const pause = () => playerRef.current?.pauseVideo?.();

  return { hostRef, ready, currentTime, duration, play, pause };
}
