from fastapi import APIRouter, Depends, HTTPException, Path, Query
from sqlmodel import Session, col, func, select

from ..db import get_session
from ..models import Box, Track
from ..schemas import BoxOut, BoxSummary, box_out

router = APIRouter(prefix="/api/boxes", tags=["boxes"])

_DATE = r"^\d{4}-\d{2}-\d{2}$"


@router.get("/{date}", response_model=BoxOut)
def get_box(
    date: str = Path(pattern=_DATE),
    session: Session = Depends(get_session),
) -> BoxOut:
    """특정 날짜의 트랙리스트. 없거나 비공개면 404."""
    box = session.get(Box, date)
    if box is None or not box.published:
        raise HTTPException(status_code=404, detail="해당 날짜의 상자가 없습니다.")

    tracks = session.exec(
        select(Track).where(Track.box_date == date).order_by(Track.position)
    ).all()
    return box_out(box.date, box.note, tracks)


@router.get("", response_model=list[BoxSummary])
def list_boxes(
    date_from: str = Query(alias="from", pattern=_DATE),
    date_to: str = Query(alias="to", pattern=_DATE),
    session: Session = Depends(get_session),
) -> list[BoxSummary]:
    """기간 안에서 공개된 상자들 — 월 그리드 표시용 (날짜 + 곡 수)."""
    counts = dict(
        session.exec(
            select(Track.box_date, func.count())
            .where(col(Track.box_date).between(date_from, date_to))
            .group_by(Track.box_date)
        ).all()
    )
    boxes = session.exec(
        select(Box)
        .where(col(Box.date).between(date_from, date_to), Box.published == True)  # noqa: E712
        .order_by(Box.date)
    ).all()
    return [BoxSummary(date=b.date, track_count=counts.get(b.date, 0)) for b in boxes]
