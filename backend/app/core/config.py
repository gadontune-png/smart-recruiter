"""Application configuration loaded from environment / .env file."""
from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    PROJECT_NAME: str = "Smart Recruiter API"
    API_V1_PREFIX: str = "/api"

    DATABASE_URL: str = (
        "postgresql://postgres:postgres@localhost:5432/smart_recruiter"
    )

    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    # --- compatibility aliases for other members' modules ---
    codewars_base_url: str = "https://www.codewars.com/api/v1"

    @property
    def database_url(self) -> str:
        return self.DATABASE_URL

    @property
    def jwt_secret(self) -> str:
        return self.SECRET_KEY

    @property
    def app_name(self) -> str:
        return self.PROJECT_NAME


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
