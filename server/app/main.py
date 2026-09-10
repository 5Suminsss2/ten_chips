from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import admin, boxes, youtube


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 스키마 관리는 Alembic 이 담당한다. 배포/개발 모두 서버 기동 전에
    #   alembic upgrade head
    # 를 실행한다. (로컬 시드는 `python -m app.seed` 가 create_all 로 처리)
    yield


app = FastAPI(title="TEN TRACKS API", version="0.1.0", lifespan=lifespan)

# dev 에서 vite 프록시(/api → :8000)를 쓰면 프론트가 같은 오리진이라 CORS 불필요.
# 프론트를 다른 도메인에서 직접 부를 때만 CORS_ORIGINS 를 채운다.
if settings.cors_origin_list:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(boxes.router)
app.include_router(admin.router)
app.include_router(youtube.router)


@app.get("/api/health", tags=["meta"])
def health() -> dict[str, str]:
    return {"status": "ok"}
