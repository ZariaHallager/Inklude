"""Application configuration via pydantic-settings."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Central application settings loaded from environment variables."""

    database_url: str = "postgresql+asyncpg://inklude:inklude@localhost:5432/inklude"
    test_database_url: str = "sqlite+aiosqlite:///./test.db"
    api_key: str = "change-me-to-a-secure-key"
    log_level: str = "INFO"
    spacy_model: str = "en_core_web_md"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
