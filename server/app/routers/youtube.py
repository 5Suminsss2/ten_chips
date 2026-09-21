import httpx
from fastapi import APIRouter, Depends, HTTPException, Query

from ..auth import require_admin
from ..config import settings
from ..schemas import CamelModel

router = APIRouter(prefix="/api/youtube", tags=["youtube"])

_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"


class YtStatus(CamelModel):
    enabled: bool


class YtHit(CamelModel):
    video_id: str  # → "videoId"
    title: str
    channel: str
    thumbnail: str


@router.get("/status", response_model=YtStatus)
def status(_: None = Depends(require_admin)) -> YtStatus:
    """관리자 화면에서 자동 검색을 켤지 판단용 — 서버에 키가 있는지만 알려준다."""
    return YtStatus(enabled=bool(settings.youtube_api_key))


async def search_video(title: str, artist: str = "") -> YtHit:
    """제목+아티스트로 '공식 음원' 영상을 한 건 찾는다. 키는 서버 .env 에만 있다.

    /api/youtube/search(관리자 세션)와 /api/automation/youtube-search(자동화 토큰)가
    함께 쓰는 공용 로직.
    """
    if not settings.youtube_api_key:
        raise HTTPException(
            status_code=503, detail="유튜브 API 키가 서버에 설정되지 않았습니다."
        )

    q = f"{artist} {title} official audio".strip()
    params = {
        "part": "snippet",
        "q": q,
        "type": "video",
        "maxResults": "1",
        "key": settings.youtube_api_key,
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            res = await client.get(_SEARCH_URL, params=params)
    except httpx.HTTPError:
        raise HTTPException(status_code=502, detail="유튜브에 연결하지 못했습니다.")

    if res.status_code != 200:
        body = res.json() if res.headers.get("content-type", "").startswith("application/json") else {}
        msg = (body.get("error") or {}).get("message") or f"유튜브 검색 실패 ({res.status_code})"
        raise HTTPException(status_code=502, detail=msg)

    items = res.json().get("items") or []
    item = items[0] if items else None
    vid = (item or {}).get("id", {}).get("videoId")
    snippet = (item or {}).get("snippet")
    if not vid or not snippet:
        raise HTTPException(status_code=404, detail="검색 결과가 없습니다.")

    thumbs = snippet.get("thumbnails") or {}
    thumb = (thumbs.get("medium") or thumbs.get("default") or {}).get("url", "")
    return YtHit(
        video_id=vid,
        title=snippet.get("title", ""),
        channel=snippet.get("channelTitle", ""),
        thumbnail=thumb,
    )


@router.get("/search", response_model=YtHit)
async def search(
    title: str = Query(min_length=1),
    artist: str = Query(default=""),
    _: None = Depends(require_admin),
) -> YtHit:
    return await search_video(title, artist)
