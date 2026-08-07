"""
IngestionAgent — domain-agnostic file validation and storage.

Responsibilities:
  - Validate MIME type against allowed list
  - Enforce maximum file size
  - Write file to the configured upload directory
  - Return a normalised ingestion result dict

Does NOT know anything about medical, legal, or any other domain.
"""
from __future__ import annotations

import logging
import mimetypes
import uuid
from pathlib import Path

from backend.core.config import get_settings

logger = logging.getLogger(__name__)

ALLOWED_MIMES: frozenset[str] = frozenset(
    {
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/tiff",
        "image/bmp",
        "application/pdf",
    }
)

MIME_EXTENSIONS: dict[str, str] = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/tiff": ".tiff",
    "image/bmp": ".bmp",
    "application/pdf": ".pdf",
}


class IngestionAgent:
    """Core pipeline agent: validates and stores an uploaded file."""

    async def ingest(
        self,
        file_bytes: bytes,
        filename: str,
        content_type: str,
    ) -> dict[str, str | int]:
        settings = get_settings()
        max_bytes = settings.max_file_size_mb * 1024 * 1024

        # ── Size guard ──────────────────────────────────────────────────────
        if len(file_bytes) > max_bytes:
            raise ValueError(
                f"File size {len(file_bytes):,} bytes exceeds limit "
                f"of {settings.max_file_size_mb} MB."
            )

        # ── MIME normalisation ──────────────────────────────────────────────
        mime = content_type.lower().split(";")[0].strip()
        if mime not in ALLOWED_MIMES:
            guessed, _ = mimetypes.guess_type(filename)
            mime = guessed or mime

        if mime not in ALLOWED_MIMES:
            raise ValueError(
                f"Unsupported file type '{content_type}'. "
                "Supported: JPEG, PNG, WEBP, TIFF, BMP images and PDF."
            )

        # ── Write temp file ─────────────────────────────────────────────────
        ext = MIME_EXTENSIONS.get(mime, "")
        upload_dir = Path(settings.upload_dir)
        upload_dir.mkdir(parents=True, exist_ok=True)
        temp_path = upload_dir / f"{uuid.uuid4()}{ext}"
        temp_path.write_bytes(file_bytes)

        logger.info(
            "Ingested: %s | MIME: %s | size: %d bytes → %s",
            filename,
            mime,
            len(file_bytes),
            temp_path,
        )

        return {
            "path": str(temp_path),
            "mime_type": mime,
            "filename": filename,
            "size_bytes": len(file_bytes),
        }
