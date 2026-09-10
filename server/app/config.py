from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """server/.env 에서 값을 읽는다. 없으면 아래 기본값."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    admin_password: str = "change-me"
    youtube_api_key: str = ""
    session_ttl_days: int = 7
    cookie_secure: bool = False  # HTTPS 프로덕션에선 true
    cookie_samesite: str = "lax"  # 프론트·API 가 다른 도메인이면 "none" (+ cookie_secure=true)
    database_url: str = "sqlite:///./tentracks.db"
    cors_origins: str = ""  # 쉼표로 구분

    # 로그인 rate-limit — IP 기준. 배포가 프록시 뒤면 trust_proxy=true 로.
    login_max_attempts: int = 5
    login_lockout_minutes: int = 15
    trust_proxy: bool = False

    @field_validator("database_url")
    @classmethod
    def _normalize_db_url(cls, v: str) -> str:
        """호스트가 주는 postgres://... / postgresql://... 를 psycopg 드라이버로 고정한다.

        SQLAlchemy 는 스킴에 드라이버가 없으면 psycopg2 를 찾는데, 우리는 psycopg(3)만 깐다.
        """
        if v.startswith("postgres://"):
            v = "postgresql://" + v[len("postgres://") :]
        if v.startswith("postgresql://"):
            v = "postgresql+psycopg://" + v[len("postgresql://") :]
        return v

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
