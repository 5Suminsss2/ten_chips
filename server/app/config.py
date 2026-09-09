from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """server/.env 에서 값을 읽는다. 없으면 아래 기본값."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    admin_password: str = "change-me"
    youtube_api_key: str = ""
    session_ttl_days: int = 7
    cookie_secure: bool = False  # HTTPS 프로덕션에선 true
    database_url: str = "sqlite:///./tentracks.db"
    cors_origins: str = ""  # 쉼표로 구분

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
