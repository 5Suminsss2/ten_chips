# 배포 (5단계 · 운영 준비)

TEN TRACKS 는 **정적 프론트(vinext/Cloudflare) + FastAPI 백엔드** 2개를 배포한다.
핵심은 **브라우저가 프론트와 API 를 같은 오리진으로 보게 하는 것** — 세션 쿠키가
`SameSite=Lax` 라 크로스사이트 `fetch(credentials)` 로는 안 실린다.

---

## 1. DB — SQLite → Postgres

로컬은 SQLite 파일이면 충분하지만, 배포 대상은 대부분 파일시스템이 휘발성이라
관리형 Postgres 를 쓴다 (Railway/Render 애드온, Neon, Supabase 등).

1. 관리형 Postgres 를 만들고 접속 URL 을 받는다.
2. `DATABASE_URL` 을 **`postgresql+psycopg://` 스킴**으로 바꾼다
   (드라이버는 `requirements.txt` 의 `psycopg[binary]`):

   ```
   DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST:5432/tentracks
   ```

   호스트가 주는 URL 이 `postgres://...` 형태면 `postgresql+psycopg://...` 로 접두어만 바꾼다.
3. 마이그레이션을 적용한다 (아래 release 커맨드).

`app/db.py` 는 비-SQLite 면 커넥션 풀(`pool_pre_ping`, `pool_size=5`, `max_overflow=10`)을
자동으로 켠다. Alembic `env.py` 도 URL 을 `settings.database_url` 에서 읽으므로 그대로 동작한다.

---

## 2. 백엔드 (Railway / Render / Fly)

| 단계 | 커맨드 |
|---|---|
| build | `pip install -r requirements.txt` |
| release (배포마다, 서버 기동 전) | `alembic upgrade head` |
| start | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

- **Render**: `render.yaml` 의 `preDeployCommand: alembic upgrade head`, `startCommand` 위와 동일.
- **Railway**: `railway.json` / Nixpacks 의 `startCommand`, 릴리스 단계에 `alembic upgrade head`.
- **Fly**: `fly.toml` `[deploy] release_command = "alembic upgrade head"`.

첫 배포 때, 이미 데이터가 든 SQLite 를 옮기는 게 아니면 `alembic upgrade head` 가 빈
Postgres 에 스키마를 만든다. 기존 SQLite 데이터를 옮겨야 하면 별도 ETL 이 필요하다
(행 수가 적으니 스크립트 한 번이면 충분).

### 환경변수 / secret

플랫폼의 secret 저장소에 넣는다 (`.env` 파일을 배포에 올리지 않는다):

| 키 | 배포 값 |
|---|---|
| `ADMIN_PASSWORD` | **강한 값으로 교체** (기본 `change-me` 면 기동 시 경고) |
| `YOUTUBE_API_KEY` | 유튜브 검색을 쓸 때만 |
| `DATABASE_URL` | 위 Postgres URL |
| `COOKIE_SECURE` | `true` (HTTPS) |
| `COOKIE_SAMESITE` | 같은 도메인 `lax` · 다른 도메인 `none` |
| `TRUST_PROXY` | `true` (로드밸런서 뒤 — rate-limit IP 판별용) |
| `SESSION_TTL_DAYS` | 기본 7 |
| `CORS_ORIGINS` | 도메인을 분리했을 때만 (아래) |
| `LOGIN_MAX_ATTEMPTS` / `LOGIN_LOCKOUT_MINUTES` | 기본 5 / 15 |

`app/main.py` 는 비-SQLite `DATABASE_URL` 인데 `ADMIN_PASSWORD` 가 기본값이거나
`COOKIE_SECURE=false` 면 기동 로그에 경고를 남긴다.

> 로그인 rate-limit 은 인메모리다. 인스턴스를 2개 이상으로 스케일하면 프로세스마다
> 따로 세므로, 그 때는 공유 저장소(Redis)로 옮겨야 한다.

---

## 3. 프론트 ↔ API 연결 — 둘 중 하나

### (권장) 같은 도메인 + `/api` 리라이트

프론트를 서비스하는 CDN/호스트에서 `/api/*` 를 백엔드로 리버스 프록시한다.
브라우저는 전부 같은 오리진으로 보므로 CORS 설정이 없어도 되고,
`SameSite=Lax` 쿠키가 그대로 실린다. `CORS_ORIGINS` 는 비워둔다.

- Cloudflare: 프론트 Worker/Pages 앞에서 `/api/*` 를 백엔드 URL 로 `fetch` 프록시하거나
  Rule 로 라우팅. (dev 의 `vite.config.ts` `server.proxy` 는 개발 전용이라 배포엔 안 쓰인다.)

### (대안) 도메인 분리 + CORS

프론트 `https://tentracks.example.com`, API `https://api.example.com` 처럼 나뉘면:

- 백엔드: `CORS_ORIGINS=https://tentracks.example.com`, `COOKIE_SAMESITE=none`,
  `COOKIE_SECURE=true`.
- 프론트: `fetch` 는 이미 `credentials: "same-origin"` — 크로스 오리진이면
  `"include"` 로 바꿔야 쿠키가 오간다 (`app/_lib/admin-context.tsx`, `youtube-search.ts`).

---

## 4. DB 백업

- **관리형 Postgres**: 대부분 일 단위 자동 백업(PITR 포함) 을 제공한다 — 켜고 보존기간을 확인.
- **추가 안전장치**: `pg_dump` 를 주기 실행해 오브젝트 스토리지(S3/R2)에 올린다.

  ```bash
  pg_dump "$DATABASE_URL" | gzip > tentracks-$(date +%F).sql.gz
  ```

  cron(플랫폼 스케줄러 또는 GitHub Actions)으로 하루 1회.
- **복구 훈련**: 분기에 한 번, 백업을 빈 DB 에 복원해 실제로 되는지 확인.
- (로컬 SQLite 를 유지한다면 파일 복사 스냅샷 또는 Litestream 으로 스트리밍 백업.)

---

## 체크리스트

- [ ] 관리형 Postgres 생성, `DATABASE_URL=postgresql+psycopg://...`
- [ ] release 커맨드 `alembic upgrade head`
- [ ] secret: `ADMIN_PASSWORD`(교체) · `DATABASE_URL` · `YOUTUBE_API_KEY`
- [ ] `COOKIE_SECURE=true`, `TRUST_PROXY=true`, `COOKIE_SAMESITE` 도메인에 맞게
- [ ] 프론트 `/api` 리라이트 (또는 `CORS_ORIGINS` + `credentials: "include"`)
- [ ] 자동 백업 on + `pg_dump` cron + 분기 복구 훈련
