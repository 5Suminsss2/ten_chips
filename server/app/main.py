from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .db import init_db
from .routers import admin, boxes, youtube


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1단계: 시작할 때 테이블을 만든다. 2단계에서 Alembic 마이그레이션으로 교체.
    init_db()
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
