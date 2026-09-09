import json

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    """입출력을 camelCase 로 (프론트의 Track 타입과 맞추기 위해). 입력은 snake_case 도 허용."""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


# ---------- 출력 ----------


class TrackOut(CamelModel):
    position: int
    title: str
    artist: str
    note: str
    youtube_id: str | None = None  # → "youtubeId"
    tags: list[str]


class BoxOut(CamelModel):
    date: str
    note: str
    tracks: list[TrackOut]


class BoxSummary(CamelModel):
    date: str
    track_count: int  # → "trackCount"


# ---------- 입력 ----------


class LoginIn(BaseModel):
    password: str


class TrackIn(CamelModel):
    title: str
    artist: str = ""
    note: str = ""
    youtube_id: str | None = None
    tags: list[str] = []


class BoxIn(CamelModel):
    note: str = ""
    tracks: list[TrackIn]


# ---------- 헬퍼 ----------


def parse_tags(raw: str) -> list[str]:
    try:
        value = json.loads(raw)
    except (ValueError, TypeError):
        return []
    return [str(x) for x in value] if isinstance(value, list) else []


def box_out(date: str, note: str, tracks: list) -> BoxOut:
    """Track ORM 행 목록 → BoxOut 응답."""
    return BoxOut(
        date=date,
        note=note,
        tracks=[
            TrackOut(
                position=t.position,
                title=t.title,
                artist=t.artist,
                note=t.note,
                youtube_id=t.youtube_id,
                tags=parse_tags(t.tags_json),
            )
            for t in tracks
        ],
    )
