import secrets
from datetime import timedelta

from fastapi import Depends, HTTPException, Request
from sqlmodel import Session, delete

from .config import settings
from .db import get_session
from .models import AdminSession, utcnow

COOKIE_NAME = "tt_session"


def check_password(password: str) -> bool:
    return secrets.compare_digest(password, settings.admin_password)


def create_session(db: Session) -> tuple[str, int]:
    """세션 행을 만들고 (id, max_age_seconds) 를 돌려준다."""
    ttl = timedelta(days=settings.session_ttl_days)
    sid = secrets.token_hex(32)
    db.add(AdminSession(id=sid, expires_at=utcnow() + ttl))
    db.commit()
    return sid, int(ttl.total_seconds())


def destroy_session(db: Session, sid: str | None) -> None:
    if sid:
        db.exec(delete(AdminSession).where(AdminSession.id == sid))
        db.commit()


def _is_valid(db: Session, sid: str | None) -> bool:
    if not sid:
        return False
    row = db.get(AdminSession, sid)
    if row is None:
        return False
    if row.expires_at <= utcnow():
        db.delete(row)
        db.commit()
        return False
    return True


def require_admin(request: Request, db: Session = Depends(get_session)) -> None:
    """관리자 전용 라우트 의존성. 쿠키의 세션이 유효하지 않으면 401."""
    if not _is_valid(db, request.cookies.get(COOKIE_NAME)):
        raise HTTPException(status_code=401, detail="관리자 로그인이 필요합니다.")
