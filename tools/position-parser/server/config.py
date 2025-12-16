from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # API Keys
    api_key: str = ""
    anthropic_api_key: str = ""

    # Development settings
    dev_mode: bool = False
    cache_enabled: bool = True
    cache_dir: str = "./cache"

    # CORS settings
    allowed_origins: str = "http://localhost:3000"

    # Server settings
    host: str = "0.0.0.0"
    port: int = 8001

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
