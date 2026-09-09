# TEN TRACKS API (server)

FastAPI + SQLModel + SQLite 백엔드. **1단계: 읽기 전용.**

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

## 엔드포인트 (1단계)

| 메서드 | 경로 | 설명 |
|---|---|---|
| `GET` | `/api/health` | `{"status":"ok"}` |
| `GET` | `/api/boxes/{date}` | 그 날짜 트랙리스트 (`date` = `YYYY-MM-DD`). 없으면 404 |
| `GET` | `/api/boxes?from=YYYY-MM-DD&to=YYYY-MM-DD` | 기간 내 상자 목록 `[{date, trackCount}]` |

응답 예:
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

`vite.config.ts` 에 `server.proxy["/api"] → http://localhost:8000` 를 넣어 뒀으므로,
`npm run dev` 로 프론트를 띄운 상태에서 `fetch("/api/boxes/2026-09-09")` 가 그대로 백엔드로 간다.
(같은 오리진으로 보이므로 CORS·쿠키 문제 없음)

## 구조

```
server/app/
  main.py       FastAPI 앱, 라우터 등록, 시작 시 테이블 생성
  config.py     .env 로드 (pydantic-settings)
  db.py         engine + get_session 의존성
  models.py     SQLModel 테이블: Box, Track
  schemas.py    요청/응답 모델 (camelCase 출력)
  routers/
    boxes.py    공개 조회 엔드포인트
  seed.py       데모 데이터 주입 스크립트
```

## 다음 단계

- **2단계** 관리자 인증(세션 쿠키) + 쓰기(`PUT/DELETE /api/admin/boxes/{date}`), 프론트 `admin-context` 교체
- **3단계** 프론트 날짜 모델을 인덱스 → `YYYY-MM-DD` 로
- **4단계** 유튜브 검색을 서버로 (`/api/youtube/search`), 클라 `VITE_YOUTUBE_API_KEY` 제거
- **5단계** Alembic 마이그레이션, 로그인 rate-limit, Postgres, 배포
