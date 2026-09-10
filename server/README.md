# TEN TRACKS API (server)

FastAPI + SQLModel + SQLite 백엔드. **2단계: 공개 조회 + 관리자 인증·쓰기.**

## 실행

```bash
cd server
python -m venv .venv
.venv\Scripts\activate            # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt

copy .env.example .env            # macOS/Linux: cp .env.example .env
python -m app.seed                # 오늘 날짜에 데모 4곡 넣기
uvicorn app.main:app --reload --port 8000
```

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
| `POST` | `/api/admin/session` | `{password}` → 쿠키 발급. 틀리면 401 |
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
server/app/
  main.py        FastAPI 앱, 라우터 등록, 시작 시 테이블 생성
  config.py      .env 로드 (pydantic-settings)
  db.py          engine + get_session 의존성
  models.py      SQLModel: Box · Track · AdminSession
  schemas.py     요청/응답 모델 (camelCase) + box_out 헬퍼
  auth.py        비밀번호 확인 · 세션 생성/파기 · require_admin 의존성
  routers/
    boxes.py     공개 조회
    admin.py     세션 + 트랙리스트 쓰기
    youtube.py   유튜브 검색 프록시 (require_admin, 키는 서버에만)
  seed.py        데모 데이터 주입
```

## 다음 단계

- ~~**3단계** 프론트 날짜 모델을 인덱스 → `YYYY-MM-DD` 로 (월 이동 UI)~~ ✓
- ~~**4단계** 유튜브 검색을 서버로 (`/api/youtube/search`), 클라 API 키 제거~~ ✓
- **5단계** Alembic 마이그레이션, 로그인 rate-limit, SQLite → Postgres, 배포
