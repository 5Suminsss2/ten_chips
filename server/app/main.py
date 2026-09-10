import logging
import warnings
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import admin, boxes, youtube

log = logging.getLogger("uvicorn.error")


def _check_prod_config() -> None:
    """배포로 보이는데(비-SQLite DB) 안전하지 않은 기본값이면 경고한다."""
    if settings.database_url.startswith("sqlite"):
        return
    if settings.admin_password == "change-me":
        warnings.warn("ADMIN_PASSWORD 가 기본값입니다. 배포에선 반드시 바꾸세요.", stacklevel=2)
    if not settings.cookie_secure:
        log.warning("COOKIE_SECURE=false — HTTPS 배포에선 true 여야 세션 쿠키가 안전합니다.")
    if settings.cookie_samesite == "none" and not settings.cookie_secure:
        log.warning("COOKIE_SAMESITE=none 은 COOKIE_SECURE=true 와 함께 써야 합니다.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 스키마 관리는 Alembic 이 담당한다. 배포/개발 모두 서버 기동 전에
    #   alembic upgrade head
    # 를 실행한다. (로컬 시드는 `python -m app.seed` 가 create_all 로 처리)
    _check_prod_config()
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
