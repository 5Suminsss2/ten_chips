import type { NextConfig } from "next";

/**
 * 배포 시 프론트와 백엔드가 다른 서비스여도, 브라우저에는 같은 오리진으로 보이게 한다.
 * `/api/*` 요청을 vinext 가 서버에서 백엔드로 프록시한다 (쿠키·CORS 문제 없음).
 *
 * - 로컬 개발: BACKEND_URL 이 없으면 rewrite 를 걸지 않는다.
 *   (dev 는 vite.config.ts 의 server.proxy 가 /api → :8000 을 담당)
 * - 배포: BACKEND_URL 을 프론트 서비스 env 에 넣는다.
 *   전체 URL(https://api.example.com) 또는 호스트만(api.example.com) 다 받는다.
 */
const raw = process.env.BACKEND_URL?.trim().replace(/\/$/, "");
const BACKEND_URL = raw && !/^https?:\/\//.test(raw) ? `https://${raw}` : raw;

const nextConfig: NextConfig = {
  async rewrites() {
    if (!BACKEND_URL) return [];
    return [{ source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` }];
  },
};

export default nextConfig;
