# TEN TRACKS

매일 낯선 장르의 음악 10곡을 날짜별 "음악 상자"로 담는 앱입니다.
프론트엔드(React)와 백엔드(FastAPI)로 나뉩니다.

## 구성

| | 스택 | 위치 |
|---|---|---|
| 프론트 | React 19 · TypeScript · Tailwind 4 · Vinext/Vite | `app/` |
| 백엔드 | FastAPI · SQLModel · Alembic · SQLite(→ Postgres) | `server/` |
| 재생 | YouTube IFrame Player | `app/_lib/use-youtube-player.ts` |

프론트와 백엔드를 **함께** 띄웁니다. 개발 중 프론트의 `/api/...` 요청은
`vite.config.ts` 의 프록시가 백엔드(`:8000`)로 넘기므로, 브라우저는 같은 오리진으로 봅니다
(CORS·쿠키 설정 불필요).

---

## 필요한 것

- **Node.js 22.13 이상**
- **Python 3.12 이상**
- Windows(PowerShell·명령 프롬프트), macOS, Linux 모두 아래 명령이 동일합니다
  (가상환경 활성화 경로만 다름).

---

## 처음 한 번 (셋업)

### 1. 백엔드 (`server/`)

```bash
cd server
python -m venv .venv
.venv\Scripts\activate                 # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt

copy .env.example .env                  # macOS/Linux: cp .env.example .env
#   .env 를 열어 ADMIN_PASSWORD 를 원하는 값으로 바꾸세요 (기본 change-me).

alembic upgrade head                    # DB 스키마 생성  ← 반드시 먼저
python -m app.seed                      # (선택) 오늘 날짜에 데모 4곡 넣기
```

> `alembic upgrade head` 를 건너뛰면 테이블이 없어 API 가 500 을 냅니다.
> (`python -m app.seed` 만 돌려도 테이블은 만들어지지만, 표준 절차는 alembic 입니다.)

### 2. 프론트 (레포 루트)

```bash
cd ..            # 레포 루트로
npm install
```

---

## 매번 실행 (개발)

터미널 **두 개**를 씁니다.

```bash
# 터미널 A — 백엔드
cd server
.venv\Scripts\activate                 # macOS/Linux: source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

```bash
# 터미널 B — 프론트 (레포 루트)
npm run dev
```

| | 주소 |
|---|---|
| 앱 | http://localhost:5173  (포트가 쓰이는 중이면 5174, 5175 … 로 자동 이동 — 터미널 로그 확인) |
| API 문서(Swagger) | http://localhost:8000/docs |
| 헬스체크 | http://localhost:8000/api/health → `{"status":"ok"}` |

멈출 때는 각 터미널에서 `Ctrl+C`.

---

## 관리자로 트랙리스트 편집

1. 앱 헤더 오른쪽 **자물쇠 버튼** 클릭 → `server/.env` 의 `ADMIN_PASSWORD` 입력.
2. 로그인하면 좌측/하단 내비에 **ADMIN** 탭, 트랙리스트에 **편집** 버튼이 생깁니다.
3. ADMIN 화면에서 달을 넘기며 날짜를 고르고, 곡마다 제목·아티스트·키워드·설명·유튜브 영상을
   입력해 **저장**. 저장한 날짜는 상자에 빨간 점으로 표시됩니다.
4. 비밀번호를 여러 번 틀리면 그 IP 는 잠깁니다(기본 5회 실패 → 15분). `.env` 의
   `LOGIN_MAX_ATTEMPTS` · `LOGIN_LOCKOUT_MINUTES` 로 조절.

### (선택) 유튜브 자동 검색 켜기

곡 제목·아티스트만 넣으면 공식 음원 영상을 자동으로 찾아 채웁니다. 켜려면 서버에 키가 필요합니다.

1. Google Cloud Console → **YouTube Data API v3** 사용 설정 → API 키 발급.
2. `server/.env` 의 `YOUTUBE_API_KEY=` 에 붙여넣고 백엔드 재시작.

키는 **서버에만** 있고 브라우저 번들에는 안 들어갑니다(`/api/youtube/*` 가 대신 호출).
키가 없으면 ADMIN 화면에 안내가 뜨고, 유튜브 링크/ID 를 직접 붙여넣는 방식만 동작합니다.

---

## 데이터

- 트랙리스트는 백엔드 DB(`server/tentracks.db`)에 **날짜별**로 저장됩니다.
- 관리자가 등록하지 않은 날짜는 자동 생성 목록이 보입니다.
- 모델을 바꿨을 때: `cd server && alembic revision --autogenerate -m "설명" && alembic upgrade head`.
- DB 를 비우고 다시 시작하려면 `server/tentracks.db` 삭제 후 `alembic upgrade head` (+ 필요하면 `python -m app.seed`).

---

## 빌드 · 테스트

```bash
npm run build         # 프론트 프로덕션 빌드
npm test              # 빌드 + tests/*.test.mjs
npm run lint          # eslint
```

---

## 자주 겪는 문제

| 증상 | 원인 / 해결 |
|---|---|
| API 가 전부 500 | `alembic upgrade head` 를 안 했다 → `cd server` 후 실행 |
| 앱에서 데이터가 안 뜸, 네트워크 탭에 `/api` 실패 | 백엔드(터미널 A)가 안 떠 있음 |
| 로그인해도 계속 로그아웃됨 | 백엔드를 재시작하면 세션은 유지되지만, `tentracks.db` 를 지우면 초기화됨 |
| `429 로그인 시도가 많아 잠겼습니다` | 비밀번호 여러 번 실패로 IP 잠김 — 시간이 지나거나 백엔드 재시작 |
| 프론트 포트가 5173 이 아님 | 다른 vite 가 그 포트를 쓰는 중 — 터미널 로그의 실제 주소 사용 |
| `uvicorn` / `alembic` 명령을 못 찾음 | 가상환경 활성화 안 됨 → `.venv\Scripts\activate` |

---

## 프로덕션 배포

관리형 Postgres 전환, 호스트별 release/start 커맨드, secret, 프론트 `/api` 리라이트,
DB 백업까지 **[`server/DEPLOY.md`](server/DEPLOY.md)** 에 정리돼 있습니다.
API 엔드포인트·서버 구조는 **[`server/README.md`](server/README.md)** 참고.
