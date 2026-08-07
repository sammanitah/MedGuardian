"""
ExtractionAgent — domain-agnostic text extraction from files.

Dispatches to the correct skill based on MIME type:
  - Images  → GeminiVisionSkill
  - PDFs    → PDFTextSkill (with GeminiVision fallback for scanned pages)

After extraction, always applies TextNormalizationSkill.
Cleans up the temp file on success.

Does NOT know anything about medical, legal, or any other domain.
"""
from __future__ import annotations

import logging
from pathlib import Path

from backend.core.base_skill import SkillInput
from backend.core.skills.gemini_vision_skill import GeminiVisionSkill
from backend.core.skills.pdf_text_skill import PDFTextSkill
from backend.core.skills.text_normalization_skill import TextNormalizationSkill

logger = logging.getLogger(__name__)

IMAGE_MIMES: frozenset[str] = frozenset(
    {"image/jpeg", "image/png", "image/webp", "image/tiff", "image/bmp"}
)


class ExtractionAgent:
    """Core pipeline agent: dispatches file to the correct skill, normalises text."""

    def __init__(self) -> None:
        self._vision = GeminiVisionSkill()
        self._pdf = PDFTextSkill()
        self._normalizer = TextNormalizationSkill()

    async def extract(self, file_path: str, mime_type: str) -> str:
        path = Path(file_path)
        file_bytes = path.read_bytes()

        # ── Dispatch to extraction skill ────────────────────────────────────
        if mime_type in IMAGE_MIMES:
            result = await self._vision.execute(SkillInput(data=file_bytes))
        elif mime_type == "application/pdf":
            result = await self._pdf.execute(SkillInput(data=file_bytes))
        else:
            raise ValueError(f"No extraction skill for MIME type: {mime_type}")

        if not result.success:
            raise RuntimeError(f"Text extraction failed: {result.error}")

        raw_text: str = result.output or ""

        # ── Normalise ───────────────────────────────────────────────────────
        norm = await self._normalizer.execute(SkillInput(data=raw_text))
        clean_text = norm.output if norm.success else raw_text

        # ── Cleanup temp file ────────────────────────────────────────────────
        try:
            path.unlink(missing_ok=True)
        except OSError:
            logger.warning("Could not delete temp file: %s", file_path)

        logger.info("Extracted %d chars from %s (%s)", len(clean_text), path.name, mime_type)
        return clean_text
