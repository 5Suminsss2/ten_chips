from datetime import datetime, timezone

from sqlmodel import Field, Relationship, SQLModel


def utcnow() -> datetime:
    # SQLite 는 tz 정보를 저장하지 않으므로 비교가 어긋나지 않게 naive UTC 로 통일한다.
    return datetime.now(timezone.utc).replace(tzinfo=None)


class Box(SQLModel, table=True):
    """하루치 음악 상자 = 트랙리스트. 날짜(YYYY-MM-DD)로 식별한다."""

    date: str = Field(primary_key=True)  # 'YYYY-MM-DD'
    note: str = ""
    published: bool = True  # False 면 공개 조회에서 숨김
    updated_at: datetime = Field(default_factory=utcnow)

    tracks: list["Track"] = Relationship(
        back_populates="box",
        sa_relationship_kwargs={
            "cascade": "all, delete-orphan",
            "order_by": "Track.position",
        },
    )


class Track(SQLModel, table=True):
    """상자 안의 곡. box_date + position 으로 순서를 매긴다."""

    id: int | None = Field(default=None, primary_key=True)
    box_date: str = Field(foreign_key="box.date", index=True)
    position: int  # 1..10
    title: str
    artist: str = ""
    note: str = ""
    youtube_id: str | None = None
    tags_json: str = "[]"  # JSON 배열 문자열 (SQLite 엔 배열 타입이 없음)

    box: Box | None = Relationship(back_populates="tracks")


class AdminSession(SQLModel, table=True):
    """관리자 로그인 세션. id 를 HttpOnly 쿠키에 담는다."""

    id: str = Field(primary_key=True)  # secrets.token_hex(32)
    created_at: datetime = Field(default_factory=utcnow)
    expires_at: datetime
