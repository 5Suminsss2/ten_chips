"""데모 데이터 한 번 넣기:  python -m app.seed

오늘 날짜의 상자에 데모 4곡을 넣는다. 이미 있으면 건너뛴다.
(youtubeId 는 임시 예시 값 — 실제 곡으로 교체 필요)
"""

import json
from datetime import date

from sqlmodel import Session

from .db import create_all, engine
from .models import Box, Track

DEMO = [
    (
        "La Llorona (World Mix)",
        "Lila Downs",
        ["WORLD", "FOLK", "MEXICO"],
        "익숙하지 않은 언어가 건네는 낯선 감정. 듣고 나면, 당신의 플레이리스트가 조금 더 넓어질 거예요.",
        "dQw4w9WgXcQ",
    ),
    (
        "Sunset in Accra",
        "Ebo Taylor",
        ["AFROBEAT", "GHANA"],
        "기타 한 줄에서 시작되는 느긋한 리듬. 오늘의 두 번째 낯선 세계예요.",
        "kJQP7kiw5Fk",
    ),
    (
        "Paper Moon",
        "Mondo Grosso",
        ["CITY POP", "JAPAN"],
        "반짝이는 도시의 밤과 조금 오래된 미래가 함께 흐르는 곡이에요.",
        "9bZkp7q19f0",
    ),
    (
        "The Quiet Market",
        "Nala Sinephro",
        ["JAZZ", "AMBIENT"],
        "서두르지 않는 소리 사이에서 오늘 놓쳤던 여백을 발견해 보세요.",
        "",
    ),
]


def run() -> None:
    create_all()  # 로컬 편의 — 운영은 `alembic upgrade head`
    today = date.today().isoformat()
    with Session(engine) as session:
        if session.get(Box, today) is not None:
            print(f"{today} 상자가 이미 있어요. 건너뜁니다.")
            return
        session.add(Box(date=today, note="데모 상자"))
        for position, (title, artist, tags, note, youtube_id) in enumerate(DEMO, start=1):
            session.add(
                Track(
                    box_date=today,
                    position=position,
                    title=title,
                    artist=artist,
                    note=note,
                    youtube_id=youtube_id or None,
                    tags_json=json.dumps(tags, ensure_ascii=False),
                )
            )
        session.commit()
    print(f"{today} 데모 상자 4곡을 넣었어요.")


if __name__ == "__main__":
    run()
