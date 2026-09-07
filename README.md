# TEN TRACKS

매일 낯선 장르의 음악 10곡을 발견하고 날짜별 음악 상자로 수집하는 UI 프로토타입입니다.

## 기술 스택

- React 19
- TypeScript
- Tailwind CSS 4
- Vinext / Vite
- Lucide React

## 실행 방법

Node.js 22 이상이 필요합니다.

```bash
npm install
npm run dev
```

터미널에 표시되는 로컬 주소를 브라우저에서 열면 됩니다.
Windows PowerShell과 명령 프롬프트에서도 같은 명령어를 사용합니다.

## 주요 파일

- `app/page.tsx`: 화면 구성, 샘플 음악 데이터, 화면 전환과 재생 인터랙션
- `app/globals.css`: 색상, 종이 질감, 상자와 카드 스타일
- `app/layout.tsx`: 사이트 제목과 메타데이터
- `public/album-palm.png`: 감상 화면 앨범 이미지

## 현재 구현된 화면

- 오늘의 음악 상자
- 곡 감상 화면
- 월별 컬렉션
- 모바일/데스크톱 반응형 내비게이션

현재 음악 데이터와 재생 상태는 프론트엔드 샘플입니다. 실제 음원 재생을 붙이려면 `app/page.tsx`의 `tracks` 데이터에 음원 URL을 추가하고 `HTMLAudioElement` 또는 음악 서비스 API를 연결하면 됩니다.
