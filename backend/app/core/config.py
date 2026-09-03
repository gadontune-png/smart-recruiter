import os

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Smart Recruiter API"
    # PostgreSQL is the only supported database.
    # Override via the DATABASE_URL env var or backend/.env.
    database_url: str = (
        "postgresql+psycopg://smartrecruiter:smartrecruiter@localhost:5433/smartrecruiter"
    )
    jwt_secret: str = "dev-secret-change-me"
    codewars_base_url: str = "https://www.codewars.com/api/v1"

    # Email / SMTP settings for invitation emails.
    smtp_host: str = "localhost"
    smtp_port: int = 587
    smtp_username: str | None = None
    smtp_password: str | None = None
    smtp_use_tls: bool = True
    sender_email: str = "noreply@smartrecruiter.com"
    sender_name: str = "Smart Recruiter"
    frontend_base_url: str = "http://localhost:5173"

    class Config:
        env_file = ".env"


settings = Settings()

if settings.jwt_secret == "dev-secret-change-me" and os.getenv("ENVIRONMENT") == "production":
    raise RuntimeError(
        "JWT_SECRET must be set to a secure value in production. "
        "Set the JWT_SECRET env var to a strong random string."
    )
