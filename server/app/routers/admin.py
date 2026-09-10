import json

from fastapi import APIRouter, Depends, HTTPException, Path, Request, Response
from sqlmodel import Session, delete, select

from ..auth import (
    COOKIE_NAME,
    check_password,
    create_session,
    destroy_session,
    require_admin,
)
from ..config import settings
from ..db import get_session
from ..models import Box, Track, utcnow
from ..ratelimit import client_ip, lock_seconds, register_failure, register_success
from ..schemas import BoxIn, BoxOut, LoginIn, box_out

router = APIRouter(prefix="/api/admin", tags=["admin"])

_DATE = r"^\d{4}-\d{2}-\d{2}$"


# ---------- 세션 ----------


@router.post("/session")
def login(
    body: LoginIn,
    request: Request,
    response: Response,
    db: Session = Depends(get_session),
) -> dict[str, bool]:
    ip = client_ip(request)
    locked = lock_seconds(ip)
    if locked:
        raise HTTPException(
            status_code=429,
            detail=f"로그인 시도가 많아 잠겼습니다. {locked}초 후 다시 시도하세요.",
            headers={"Retry-After": str(locked)},
        )
    if not check_password(body.password):
        locked = register_failure(ip)
        detail = "비밀번호가 올바르지 않습니다."
        if locked:
            raise HTTPException(
                status_code=429,
                detail=f"{detail} 시도가 많아 {locked}초 동안 잠겼습니다.",
                headers={"Retry-After": str(locked)},
            )
        raise HTTPException(status_code=401, detail=detail)
    register_success(ip)
    sid, max_age = create_session(db)
    response.set_cookie(
        COOKIE_NAME,
        sid,
        httponly=True,
        samesite=settings.cookie_samesite,
        secure=settings.cookie_secure,
        max_age=max_age,
        path="/",
    )
    return {"ok": True}


@router.get("/session")
def session_status(_: None = Depends(require_admin)) -> dict[str, bool]:
    return {"authenticated": True}


@router.delete("/session")
def logout(
    request: Request, response: Response, db: Session = Depends(get_session)
) -> dict[str, bool]:
    destroy_session(db, request.cookies.get(COOKIE_NAME))
    response.delete_cookie(COOKIE_NAME, path="/")
    return {"ok": True}


# ---------- 트랙리스트 쓰기 ----------


@router.put("/boxes/{date}", response_model=BoxOut)
def put_box(
    body: BoxIn,
    date: str = Path(pattern=_DATE),
    db: Session = Depends(get_session),
    _: None = Depends(require_admin),
) -> BoxOut:
    if not 1 <= len(body.tracks) <= 10:
        raise HTTPException(status_code=422, detail="곡은 1~10개여야 합니다.")
    if any(not t.title.strip() for t in body.tracks):
        raise HTTPException(status_code=422, detail="제목이 없는 곡이 있습니다.")

    box = db.get(Box, date)
    if box is None:
        box = Box(date=date)
        db.add(box)
    box.note = body.note.strip()
    box.published = True
    box.updated_at = utcnow()

    # 해당 날짜의 트랙을 전부 지우고 새로 넣는다 (전체 교체).
    db.exec(delete(Track).where(Track.box_date == date))
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
    return box_out(date, box.note, tracks)


@router.delete("/boxes/{date}")
def delete_box(
    date: str = Path(pattern=_DATE),
    db: Session = Depends(get_session),
    _: None = Depends(require_admin),
) -> dict[str, bool]:
    box = db.get(Box, date)
    if box is None:
        raise HTTPException(status_code=404, detail="해당 날짜의 상자가 없습니다.")
    db.exec(delete(Track).where(Track.box_date == date))
    db.delete(box)
    db.commit()
    return {"ok": True}
