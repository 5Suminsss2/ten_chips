import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TEN TRACKS — 매일 열 곡의 낯선 음악",
  description: "매일 다양한 장르의 음악 10곡을 발견하고 작은 음악 상자로 수집하세요.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&family=Playfair+Display:wght@700;900&display=swap"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
