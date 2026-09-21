import json

from fastapi import APIRouter, Depends, HTTPException, Path, Query
from sqlmodel import Session, select

from ..auth import require_automation
from ..db import get_session
from ..models import Box, Track, utcnow
from ..schemas import BoxIn, BoxOut, box_out
from .youtube import YtHit, search_video

router = APIRouter(prefix="/api/automation", tags=["automation"])

_DATE = r"^\d{4}-\d{2}-\d{2}$"


@router.get("/youtube-search", response_model=YtHit)
async def automation_youtube_search(
    title: str = Query(min_length=1),
    artist: str = Query(default=""),
    _: None = Depends(require_automation),
) -> YtHit:
    return await search_video(title, artist)


@router.post("/boxes/{date}", response_model=BoxOut, status_code=201)
def create_draft_box(
    body: BoxIn,
    date: str = Path(pattern=_DATE),
    db: Session = Depends(get_session),
    _: None = Depends(require_automation),
) -> BoxOut:
    """예약 에이전트 전용 등록 라우트.

    관리자 라우트(PUT /api/admin/boxes/{date})와 달리 '없는 날짜에 초안을 새로
    만드는 것'만 할 수 있다 — 사람이 이미 만든 상자(초안이든 발행본이든)가
    있으면 절대 덮어쓰지 않고 409를 돌려준다. published 도 body 값과 무관하게
    항상 false로 강제한다 (사람이 검토 후 저장해야 공개됨).
    """
    if db.get(Box, date) is not None:
        raise HTTPException(
            status_code=409, detail="해당 날짜엔 이미 상자가 있어 자동 등록을 건너뜁니다."
        )
    if not 1 <= len(body.tracks) <= 10:
        raise HTTPException(status_code=422, detail="곡은 1~10개여야 합니다.")
    if any(not t.title.strip() for t in body.tracks):
        raise HTTPException(status_code=422, detail="제목이 없는 곡이 있습니다.")

    box = Box(date=date, note=body.note.strip(), published=False, updated_at=utcnow())
    db.add(box)
    for i, t in enumerate(body.tracks, start=1):
        tags = [s for s in (x.strip() for x in t.tags) if s]
        db.add(
            Track(
                box_date=date,
                position=i,
                title=t.title.strip(),
                artist=t.artist.strip(),
                note=t.note.strip(),
                youtube_id=(t.youtube_id or None),
                tags_json=json.dumps(tags, ensure_ascii=False),
            )
        )
    db.commit()

    tracks = db.exec(
        select(Track).where(Track.box_date == date).order_by(Track.position)
    ).all()
    return box_out(date, box.note, tracks, box.published)
