from collections.abc import Generator

from sqlmodel import Session, SQLModel, create_engine

from .config import settings

_is_sqlite = settings.database_url.startswith("sqlite")

# SQLite: 스레드 공유 허용. 그 외(Postgres 등): 커넥션 풀 옵션.
connect_args = {"check_same_thread": False} if _is_sqlite else {}
engine_kwargs: dict = {"echo": False, "connect_args": connect_args}
if not _is_sqlite:
    engine_kwargs.update(pool_pre_ping=True, pool_size=5, max_overflow=10)

engine = create_engine(settings.database_url, **engine_kwargs)


def create_all() -> None:
    """스키마를 코드에서 바로 만든다 — 로컬 시드/테스트 편의용.

    운영 스키마 관리는 Alembic 이 담당한다 (`alembic upgrade head`).
    Alembic 이 이미 만든 테이블이 있으면 이 호출은 그 테이블을 건드리지 않는다.
    """
    from . import models  # noqa: F401  (SQLModel 테이블 등록용 import)

    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
