from collections.abc import Generator

from sqlmodel import Session, SQLModel, create_engine

from .config import settings

connect_args = (
    {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
)
engine = create_engine(settings.database_url, echo=False, connect_args=connect_args)


def init_db() -> None:
    """1단계: 마이그레이션 없이 테이블을 만든다. 2단계에서 Alembic 으로 교체."""
    from . import models  # noqa: F401  (SQLModel 테이블 등록용 import)

    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
