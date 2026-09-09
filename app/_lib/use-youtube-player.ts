"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
 * setHost 를 "재생 위치" <div> 의 ref 로 넘긴다. 그 노드가 바뀌면(카드 캐러셀에서
 * 중앙 카드가 바뀌면) 플레이어를 그 자리에 다시 만든다 — iframe 은 부모가 바뀌면
 * 어차피 새로고침되므로 곡을 넘기면 영상도 다시 로드된다.
 * currentTime / duration 은 0.5초 폴링으로 갱신(진행바·시간 표시용).
 * 브라우저 자동재생 정책상 첫 재생은 클릭 핸들러 안에서 play() 를 동기 호출해야 소리가 난다.
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
  const playerRef = useRef<any>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const [ready, setReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const onEndedRef = useRef(onEnded);
  useEffect(() => {
    onEndedRef.current = onEnded;
  });

  const teardown = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = undefined;
    try {
      playerRef.current?.destroy?.();
    } catch {
      /* 이미 정리됨 */
    }
    playerRef.current = null;
    setReady(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  /* 재생 위치 노드가 붙거나 떨어질 때마다 플레이어를 새로 만든다 */
  const setHost = useCallback(
    (node: HTMLDivElement | null) => {
      teardown();
      if (!node) return;
      loadApi().then(() => {
        if (playerRef.current) return;
        const el = document.createElement("div"); // YT 가 iframe 으로 치환
        node.appendChild(el);
        playerRef.current = new window.YT.Player(el, {
          width: "100%",
          height: "100%",
          playerVars: { playsinline: 1, rel: 0, modestbranding: 1 },
          events: {
            onReady: () => setReady(true),
            onStateChange: (e: any) => {
              if (e.data === window.YT.PlayerState.ENDED) onEndedRef.current?.();
            },
          },
        });
        pollRef.current = setInterval(() => {
          const p = playerRef.current;
          if (!p?.getDuration) return;
          setCurrentTime(p.getCurrentTime?.() || 0);
          setDuration(p.getDuration?.() || 0);
        }, 500);
      });
    },
    [teardown],
  );

  /* 언마운트 시 확실히 정리 */
  useEffect(() => teardown, [teardown]);

  /* 준비되면(또는 videoId 가 바뀌면) 해당 영상을 큐에 올린다(자동재생 X) */
  useEffect(() => {
    const p = playerRef.current;
    if (!p || !ready) return;
    setCurrentTime(0);
    setDuration(0);
    if (videoId) p.cueVideoById?.(videoId);
    else p.stopVideo?.();
  }, [videoId, ready]);

  /* 재생 / 일시정지 */
  useEffect(() => {
    const p = playerRef.current;
    if (!p || !ready || !videoId) return;
    if (playing) p.playVideo?.();
    else p.pauseVideo?.();
  }, [playing, videoId, ready]);

  const play = () => playerRef.current?.playVideo?.();
  const pause = () => playerRef.current?.pauseVideo?.();

  return { setHost, ready, currentTime, duration, play, pause };
}
