"""Application configuration via environment variables."""
import os
from functools import lru_cache
from typing import Any

try:
    from pydantic_settings import BaseSettings
except ImportError:  # pragma: no cover
    from pydantic import BaseModel

    class BaseSettings(BaseModel):  # type: ignore[no-redef]
        """Fallback settings class if pydantic_settings is missing from IDE path."""

        def __init__(self, **data: Any) -> None:
            env_key = os.getenv("GEMINI_API_KEY", "")
            data.setdefault("gemini_api_key", env_key)
            super().__init__(**data)


class Settings(BaseSettings):
    """All configuration is read from environment variables (or .env file)."""

    gemini_api_key: str = ""
    gemini_model: str = "gemini-flash-latest"
    upload_dir: str = "./uploads"
    max_file_size_mb: int = 15
    default_domain: str = "medical"

    model_config = {"env_file": ".env", "case_sensitive": False, "extra": "ignore"}


@lru_cache
def get_settings() -> Settings:
    """Return cached application settings."""
    return Settings()
