"""로그인 실패 rate-limit — IP 기준, 인메모리.

실패가 `login_max_attempts` 회 쌓이면 `login_lockout_minutes` 동안 그 IP 를 잠근다.
로그인 성공하면 카운터를 지운다.

인메모리라 프로세스마다 따로 센다 — 단일 인스턴스 배포를 가정한다.
여러 인스턴스면 Redis 같은 공유 저장소로 바꿔야 한다.
"""

import math
import threading
import time

from fastapi import Request

from .config import settings

_lock = threading.Lock()
# ip -> [실패 횟수, 잠금 해제 epoch(초). 0 이면 잠기지 않음]
_state: dict[str, list[float]] = {}


def client_ip(request: Request) -> str:
    """요청자 IP. 프록시 뒤(trust_proxy)면 X-Forwarded-For 의 첫 IP 를 쓴다."""
    if settings.trust_proxy:
        fwd = request.headers.get("x-forwarded-for")
        if fwd:
            return fwd.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _prune(now: float) -> None:
    if len(_state) < 512:
        return
    stale = [ip for ip, (fails, until) in _state.items() if until < now and fails == 0]
    for ip in stale:
        _state.pop(ip, None)


def lock_seconds(ip: str) -> int:
    """잠겨 있으면 남은 초, 아니면 0. 잠금이 풀렸으면 카운터도 리셋한다."""
    now = time.time()
    with _lock:
        entry = _state.get(ip)
        if not entry:
            return 0
        fails, until = entry
        if until and until > now:
            return math.ceil(until - now)
        if until and until <= now:
            _state.pop(ip, None)  # 잠금 만료 → 깨끗이
        return 0


def register_failure(ip: str) -> int:
    """실패 1회 기록. 이 실패로 잠겼으면 잠금 초, 아니면 0."""
    now = time.time()
    with _lock:
        _prune(now)
        fails, until = _state.get(ip, [0.0, 0.0])
        if until and until <= now:
            fails, until = 0.0, 0.0
        fails += 1
        if fails >= settings.login_max_attempts:
            until = now + settings.login_lockout_minutes * 60
            _state[ip] = [fails, until]
            return math.ceil(until - now)
        _state[ip] = [fails, until]
        return 0


def register_success(ip: str) -> None:
    with _lock:
        _state.pop(ip, None)


def reset() -> None:
    """테스트용."""
    with _lock:
        _state.clear()
