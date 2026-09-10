# 배포 (Render)

TEN TRACKS 는 **프론트(vinext/Node) + 백엔드(FastAPI) + Postgres** 세 조각이다.
전부 [Render](https://render.com) 한 곳에 올리고, 프론트가 `/api/*` 를 백엔드로
서버사이드 프록시하므로 브라우저에는 **같은 오리진**으로 보인다 — CORS 설정도,
크로스사이트 쿠키 고민도 없다.

레포에 이미 준비돼 있는 것:

| 파일 | 역할 |
|---|---|
| `render.yaml` | Render Blueprint — Postgres 1 + 웹 서비스 2 를 한 번에 정의 |
| `next.config.ts` | `BACKEND_URL` 이 있으면 `/api/*` → 백엔드로 rewrite (프록시) |
| `server/app/config.py` | `postgres://` / `postgresql://` URL 을 `postgresql+psycopg://` 로 정규화 |
| `server/app/main.py` | 기동 시 안전하지 않은 설정(기본 비밀번호 등) 경고 |

---

## 0. 준비

1. GitHub 에 이 레포가 올라가 있어야 한다. 로컬 커밋을 푸시:

   ```bash
   git push origin dev      # 또는 배포용 브랜치/ main
   ```

2. [render.com](https://render.com) 가입 (GitHub 로그인). 무료 플랜으로 시작 가능.
   - 무료 웹 서비스: 15분 미사용 시 잠들고 다음 요청에서 콜드스타트(~1분).
   - 무료 Postgres: 생성 후 **약 30일이면 만료**된다. 계속 운영하려면 유료
     (`basic-256mb` 등, `render.yaml` 의 `plan:` 을 바꾸면 된다).

---

## 1. Blueprint 로 한 번에 생성

1. Render 대시보드 → **New +** → **Blueprint**.
2. 이 레포를 선택하고, 배포할 **브랜치**를 고른다 (예: `dev`).
3. Render 가 `render.yaml` 을 읽어 3개를 만든다:
   - `tentracks-db` (Postgres)
   - `tentracks-api` (FastAPI)
   - `tentracks-web` (프론트)
4. **Apply**.

빌드가 도는 동안, `tentracks-api` 에서 아직 비어 있는 secret 을 채운다:

| 키 | 값 |
|---|---|
| `ADMIN_PASSWORD` | 강한 비밀번호 (관리자 로그인에 쓸 값). 기본 `change-me` 면 로그에 경고가 뜬다 |
| `YOUTUBE_API_KEY` | 유튜브 자동 검색을 쓸 때만. [YouTube Data API v3](https://console.cloud.google.com/apis/library/youtube.googleapis.com) 키. 안 쓰면 비워둠 |

입력 후 `tentracks-api` 를 **Manual Deploy → Deploy latest commit** 로 다시 배포.

> `render.yaml` 이 자동으로 채우는 것:
> - `DATABASE_URL` ← `tentracks-db` 의 접속 문자열 (`config.py` 가 `+psycopg` 로 정규화)
> - `COOKIE_SECURE=true`, `TRUST_PROXY=true` (프록시 뒤 · HTTPS)
>
> `BACKEND_URL` 은 `https://tentracks-api.onrender.com` 리터럴로 박혀 있다.
> **vinext 는 이 값을 빌드 때 `dist` 에 굳혀 넣으므로**, `tentracks-api` 의 이름을 바꿨다면
> `render.yaml` 의 `BACKEND_URL` 도 같이 고치고 `tentracks-web` 을 재배포해야 한다.

빌드 커맨드가 하는 일:
- 백엔드: `pip install -r requirements.txt && alembic upgrade head` — 매 배포마다 마이그레이션 적용
- 프론트: `npm ci && npx vinext build` → 실행은 `npx vinext start`

---

## 2. 확인

1. `https://tentracks-api.onrender.com/api/health` → `{"status":"ok"}`
2. `https://tentracks-web.onrender.com` → 앱이 뜨고, 이번 달 상자 그리드가 보인다
   (첫 배포엔 DB 가 비어서 전부 "자동 생성 목록").
3. 헤더 자물쇠 → `ADMIN_PASSWORD` 로 로그인 → ADMIN 에서 날짜 골라 트랙 저장 →
   새로고침해도 남아 있으면 프론트→프록시→백엔드→Postgres 왕복이 다 되는 것.

(선택) 데모 데이터: `tentracks-api` 의 **Shell** 탭에서 `python -m app.seed`.

---

## 3. 손볼 것

- **커스텀 도메인**: 두 서비스에 각각 붙일 수 있지만, 프론트(`tentracks-web`)에만
  `tentracks.example.com` 을 붙이면 충분하다. 백엔드는 `/api` 프록시로만 노출된다.
- **콜드스타트가 싫으면**: 두 웹 서비스를 유료(`starter`)로. 또는 외부 uptime 핑으로
  프론트를 깨워둔다(백엔드는 프론트가 깨우니 따라 깬다).
- **로그인 rate-limit 은 인메모리**다. 인스턴스를 2개 이상으로 스케일하면 프로세스마다
  따로 세므로, 그 때는 공유 저장소(Redis)로 옮겨야 한다.

---

## 4. DB 백업

- Render Postgres(유료 플랜)는 자동 일일 백업 + PITR 을 제공한다 — 대시보드에서 보존기간 확인.
- 추가 안전장치로 `pg_dump` 를 주기 실행해 오브젝트 스토리지(S3/R2)에 올린다:

  ```bash
  pg_dump "$DATABASE_URL" | gzip > tentracks-$(date +%F).sql.gz
  ```

  Render **Cron Job** 서비스로 하루 1회, 또는 GitHub Actions 스케줄로.
- 분기에 한 번, 백업을 빈 DB 에 복원해 실제로 되는지 확인한다.

---

## 다른 호스트로 갈 때

핵심 계약은 셋이다. Render 가 아니어도 이대로면 된다:

1. **백엔드**: `pip install -r requirements.txt` → (배포마다) `alembic upgrade head` →
   `uvicorn app.main:app --host 0.0.0.0 --port $PORT`. env 로
   `DATABASE_URL`(Postgres) · `ADMIN_PASSWORD` · `COOKIE_SECURE=true` · `TRUST_PROXY=true`
   (필요시 `YOUTUBE_API_KEY`).
2. **프론트**: `npx vinext build` → `npx vinext start --port $PORT`. env 로
   `BACKEND_URL`(백엔드 공개 URL 또는 호스트) — `next.config.ts` 가 `/api/*` 를 거기로 프록시.
3. 프론트·백엔드를 굳이 **다른 도메인**으로 갈라놓아야 하면, 프록시 대신
   백엔드에 `CORS_ORIGINS=https://프론트도메인` + `COOKIE_SAMESITE=none` 을 주고,
   프론트의 `fetch` 를 `credentials: "include"` 로 바꾼다
   (`app/_lib/admin-context.tsx`, `app/_lib/youtube-search.ts`).
