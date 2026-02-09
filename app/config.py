"""Application configuration via pydantic-settings."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Central application settings loaded from environment variables."""

    database_url: str = "postgresql+asyncpg://inklude:inklude@localhost:5432/inklude"
    test_database_url: str = "sqlite+aiosqlite:///./test.db"
    api_key: str = "change-me-to-a-secure-key"
    log_level: str = "INFO"
    spacy_model: str = "en_core_web_md"

    # Google OAuth
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:8000/api/v1/auth/callback/google"

    # JWT
    jwt_secret_key: str = "change-me-to-a-random-secret-at-least-32-chars-long"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440  # 24 hours

    # Frontend
    frontend_url: str = "http://localhost:5173"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
