# TEN TRACKS

매일 낯선 장르의 음악 10곡을 날짜별 "음악 상자"로 담는 앱입니다.
프론트엔드(React)와 백엔드(FastAPI)로 나뉩니다.

## 구성

| | 스택 | 위치 |
|---|---|---|
| 프론트 | React 19 · TypeScript · Tailwind 4 · Vinext/Vite | `app/` |
| 백엔드 | FastAPI · SQLModel · SQLite | `server/` |
| 재생 | YouTube IFrame Player | `app/_lib/use-youtube-player.ts` |

## 실행 (개발)

두 개를 같이 띄웁니다. 프론트의 `/api` 요청은 vite 프록시가 `:8000`(백엔드)으로 넘깁니다.

```bash
# 터미널 A — 백엔드
cd server
python -m venv .venv
.venv\Scripts\activate            # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env            # macOS/Linux: cp .env.example .env
python -m app.seed                # 오늘 날짜에 데모 4곡
uvicorn app.main:app --reload --port 8000   # http://localhost:8000/docs

# 터미널 B — 프론트
npm install
npm run dev
```

Node.js 22 이상, Python 3.12 이상이 필요합니다. Windows PowerShell·명령 프롬프트에서도 같은 명령을 씁니다.

## 화면

- 오늘의 음악 상자 / 곡 감상(유튜브 재생) / 월별 컬렉션 / 모바일·데스크톱 반응형 내비
- 관리자 트랙리스트 편집: 헤더 자물쇠 버튼 → 비밀번호(`server/.env` 의 `ADMIN_PASSWORD`, 기본 `change-me`)

## 데이터

트랙리스트는 백엔드 DB(`server/tentracks.db`)에 날짜별로 저장됩니다. 관리자가 편집하면 서버에
반영되고, 등록본이 없는 날짜는 자동 생성 목록이 보입니다. API·구축 계획은 `server/README.md` 참고.
