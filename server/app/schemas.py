import json

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    """응답을 camelCase 로 내보낸다 (프론트의 Track 타입과 맞추기 위해)."""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class TrackOut(CamelModel):
    position: int
    title: str
    artist: str
    note: str
    youtube_id: str | None = None  # → 응답 키는 "youtubeId"
    tags: list[str]


class BoxOut(CamelModel):
    date: str
    note: str
    tracks: list[TrackOut]


class BoxSummary(CamelModel):
    date: str
    track_count: int  # → "trackCount"


def parse_tags(raw: str) -> list[str]:
    try:
        value = json.loads(raw)
    except (ValueError, TypeError):
        return []
    return [str(x) for x in value] if isinstance(value, list) else []
