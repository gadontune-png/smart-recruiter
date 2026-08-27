from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Smart Recruiter API"
    database_url: str = "sqlite:///./smart_recruiter.db"
    jwt_secret: str = "dev-secret-change-me"
    codewars_base_url: str = "https://www.codewars.com/api/v1"

    class Config:
        env_file = ".env"


settings = Settings()

