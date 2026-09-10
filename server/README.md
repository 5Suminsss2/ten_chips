# TEN TRACKS API (server)

FastAPI + SQLModel + SQLite 백엔드. 공개 조회 · 관리자 인증/쓰기 · 유튜브 검색 프록시.

## 실행

```bash
cd server
python -m venv .venv
.venv\Scripts\activate            # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt

copy .env.example .env            # macOS/Linux: cp .env.example .env
alembic upgrade head              # 스키마 생성/최신화 (기동 전 항상)
python -m app.seed                # 오늘 날짜에 데모 4곡 넣기 (선택)
uvicorn app.main:app --reload --port 8000
```

이미 `create_all` 로 만든 기존 `tentracks.db` 가 있으면, 한 번만 현재 리비전으로 표시:

```bash
alembic stamp head
```

### 마이그레이션

```bash
alembic revision --autogenerate -m "설명"   # 모델 변경 후 새 리비전
alembic upgrade head                        # 적용
alembic downgrade -1                        # 한 단계 되돌리기
```

`alembic/env.py` 가 `app.config.settings.database_url` 과 `SQLModel.metadata` 를 읽으므로,
DB URL 은 `alembic.ini` 가 아니라 `server/.env` 에서 온다. SQLite 는 batch 모드(ALTER 제약)로 처리된다.

- API 문서(자동): http://localhost:8000/docs
- 헬스체크: http://localhost:8000/api/health
- 관리자 비밀번호: `.env` 의 `ADMIN_PASSWORD` (기본 `change-me`)

## 엔드포인트

### 공개

| 메서드 | 경로 | 설명 |
|---|---|---|
| `GET` | `/api/health` | `{"status":"ok"}` |
| `GET` | `/api/boxes/{date}` | 그 날짜 트랙리스트 (`date` = `YYYY-MM-DD`). 없거나 비공개면 404 |
| `GET` | `/api/boxes?from=YYYY-MM-DD&to=YYYY-MM-DD` | 기간 내 상자 목록 `[{date, trackCount}]` |

### 관리자 (HttpOnly 세션 쿠키)

| 메서드 | 경로 | 설명 |
|---|---|---|
| `POST` | `/api/admin/session` | `{password}` → 쿠키 발급. 틀리면 401. 같은 IP 가 `LOGIN_MAX_ATTEMPTS` 회 실패하면 `LOGIN_LOCKOUT_MINUTES` 분 429 (`Retry-After`) |
| `GET` | `/api/admin/session` | 로그인 상태 (200 / 401) |
| `DELETE` | `/api/admin/session` | 로그아웃 (세션 파기 + 쿠키 만료) |
| `PUT` | `/api/admin/boxes/{date}` | `{note?, tracks:[…]}` — 트랙 전체 교체. 1~10곡, 제목 필수 |
| `DELETE` | `/api/admin/boxes/{date}` | 그 날짜 상자 삭제. 없으면 404 |
| `GET` | `/api/youtube/status` | `{enabled}` — 서버에 `YOUTUBE_API_KEY` 가 있는지 |
| `GET` | `/api/youtube/search?title=&artist=` | 공식 음원 영상 1건 `{videoId, title, channel, thumbnail}`. 키 없으면 503 |

응답 예 (`GET /api/boxes/{date}`):
```json
{
  "date": "2026-09-09",
  "note": "데모 상자",
  "tracks": [
    { "position": 1, "title": "La Llorona (World Mix)", "artist": "Lila Downs",
      "note": "...", "youtubeId": "dQw4w9WgXcQ", "tags": ["WORLD","FOLK","MEXICO"] }
  ]
}
```

## 프론트 연동

`vite.config.ts` 에 `server.proxy["/api"] → http://localhost:8000` 가 있으므로,
`npm run dev` 로 프론트를 띄운 상태에서 `fetch("/api/...")` 가 그대로 백엔드로 간다.
브라우저는 같은 오리진(5173)으로 보므로 CORS·쿠키 설정이 필요 없다.
프론트 `app/_lib/admin-context.tsx` 가 이 API 를 호출한다 (더는 localStorage 안 씀).

## 구조

```
server/
  alembic.ini    Alembic 설정 (DB URL 은 env.py 가 app 설정에서 채움)
  alembic/
    env.py       settings.database_url + SQLModel.metadata 연결
    versions/    마이그레이션 리비전
  app/
    main.py      FastAPI 앱, 라우터 등록 (스키마는 Alembic 담당)
    config.py    .env 로드 (pydantic-settings)
    db.py        engine + get_session 의존성 (+ 로컬용 create_all)
    models.py    SQLModel: Box · Track · AdminSession
    schemas.py   요청/응답 모델 (camelCase) + box_out 헬퍼
    auth.py      비밀번호 확인 · 세션 생성/파기 · require_admin 의존성
    ratelimit.py 로그인 실패 잠금 (IP 기준, 인메모리 — 단일 인스턴스 가정)
    routers/
      boxes.py   공개 조회
      admin.py   세션 + 트랙리스트 쓰기
      youtube.py 유튜브 검색 프록시 (require_admin, 키는 서버에만)
    seed.py      데모 데이터 주입
```

## 5단계 · 운영 준비

- ~~**3단계** 프론트 날짜 모델을 인덱스 → `YYYY-MM-DD` 로 (월 이동 UI)~~ ✓
- ~~**4단계** 유튜브 검색을 서버로 (`/api/youtube/search`), 클라 API 키 제거~~ ✓
- ~~Alembic 도입 (`create_all` → 마이그레이션)~~ ✓
- ~~로그인 rate-limit (실패 N회 잠금)~~ ✓
- ~~Postgres 지원 (`DATABASE_URL=postgresql+psycopg://...`, `psycopg[binary]`, 풀 옵션)~~ ✓
- 실제 배포 — **[DEPLOY.md](DEPLOY.md)** 참고 (release 커맨드 `alembic upgrade head`,
  secret, `COOKIE_SECURE`/`COOKIE_SAMESITE`/`TRUST_PROXY`, 프론트 `/api` 리라이트, DB 백업)

로컬은 그대로 SQLite. Postgres 로 바꾸려면 `DATABASE_URL` 만 교체하고
`alembic upgrade head` 를 다시 돌리면 된다 (`env.py`·`db.py` 가 URL 스킴에 맞춰 동작).
