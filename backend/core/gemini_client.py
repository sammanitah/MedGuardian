"""
Gemini API client — singleton wrapper with retry logic.

Rate-limit aware: exponential back-off on transient errors.
All calls are wrapped in asyncio.to_thread so the sync SDK
does not block the FastAPI event loop.

Uses the current google-genai SDK (google.genai), not the deprecated
google.generativeai package.
"""
from __future__ import annotations

import asyncio
import io
import logging
from functools import lru_cache

try:
    import PIL.Image
except ImportError:  # pragma: no cover
    PIL = None  # type: ignore[assignment]

from backend.core.config import get_settings

logger = logging.getLogger(__name__)

_MAX_RETRIES = 3


class GeminiClient:
    """Thread-safe Gemini client used by all skills."""

    def __init__(self) -> None:
        settings = get_settings()
        self._api_key = settings.gemini_api_key
        self._model_name = settings.gemini_model

    def _get_client(self):
        """Return a configured google.genai client."""
        try:
            from google import genai
            return genai.Client(api_key=self._api_key)
        except ImportError:
            raise ImportError(
                "google-genai package not found. Install: pip install google-genai"
            )

    async def generate_text(
        self,
        prompt: str,
        system_instruction: str = "",
    ) -> str:
        """Send a text prompt to Gemini and return the response text."""
        client = self._get_client()

        def _call() -> str:
            from google.genai import types as genai_types
            config = None
            if system_instruction:
                config = genai_types.GenerateContentConfig(
                    system_instruction=system_instruction
                )
            response = client.models.generate_content(
                model=self._model_name,
                contents=prompt,
                config=config,
            )
            return response.text

        for attempt in range(_MAX_RETRIES):
            try:
                return await asyncio.to_thread(_call)
            except Exception as exc:
                if attempt == _MAX_RETRIES - 1:
                    raise
                wait = 2 ** attempt
                logger.warning(
                    "Gemini text call failed (attempt %d/%d): %s — retrying in %ds",
                    attempt + 1,
                    _MAX_RETRIES,
                    exc,
                    wait,
                )
                await asyncio.sleep(wait)
        raise RuntimeError("Gemini generate_text failed after all retries")  # pragma: no cover

    async def generate_from_image(
        self,
        image_bytes: bytes,
        prompt: str,
    ) -> str:
        """Send an image + prompt to Gemini Vision and return extracted text."""
        client = self._get_client()

        def _call() -> str:
            img = PIL.Image.open(io.BytesIO(image_bytes))
            response = client.models.generate_content(
                model=self._model_name,
                contents=[prompt, img],
            )
            return response.text

        for attempt in range(_MAX_RETRIES):
            try:
                return await asyncio.to_thread(_call)
            except Exception as exc:
                if attempt == _MAX_RETRIES - 1:
                    raise
                wait = 2 ** attempt
                logger.warning(
                    "Gemini vision call failed (attempt %d/%d): %s — retrying in %ds",
                    attempt + 1,
                    _MAX_RETRIES,
                    exc,
                    wait,
                )
                await asyncio.sleep(wait)
        raise RuntimeError("Gemini generate_from_image failed after all retries")  # pragma: no cover


@lru_cache
def get_gemini_client() -> GeminiClient:
    """Return the singleton GeminiClient instance."""
    return GeminiClient()
