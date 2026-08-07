"""
Custom Skill: PDFTextSkill

Extracts text from PDF documents:
  1. Primary:  pdfplumber (text-layer PDFs) — fast, no API calls
  2. Fallback: PyMuPDF renders pages → GeminiVisionSkill (scanned PDFs)

This skill is domain-agnostic; it only extracts raw text.
"""
from __future__ import annotations

import io
import logging

from backend.core.base_skill import BaseSkill, SkillInput, SkillResult

logger = logging.getLogger(__name__)


class PDFTextSkill(BaseSkill):
    """Custom Skill: PDF bytes → extracted text.

    Handles both text-layer and scanned PDFs.
    """

    name = "pdf_text"
    description = (
        "Extracts text from PDF files using pdfplumber. "
        "Falls back to Gemini Vision (via PyMuPDF page rendering) "
        "for scanned / image-only PDFs."
    )

    async def execute(self, input: SkillInput) -> SkillResult:
        try:
            pdf_bytes: bytes = input.data
            if not pdf_bytes:
                return SkillResult(success=False, error="No PDF data provided")

            text = await self._extract_with_pdfplumber(pdf_bytes)

            if not text.strip():
                logger.info("No text layer found in PDF — attempting vision fallback")
                text = await self._vision_fallback(pdf_bytes)

            return SkillResult(success=True, output=text)
        except Exception as exc:
            return SkillResult(success=False, error=str(exc))

    @staticmethod
    async def _extract_with_pdfplumber(pdf_bytes: bytes) -> str:
        import pdfplumber

        pages: list[str] = []
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text() or ""
                if page_text.strip():
                    pages.append(page_text.strip())
        return "\n\n".join(pages)

    @staticmethod
    async def _vision_fallback(pdf_bytes: bytes) -> str:
        """Render each PDF page to an image and send to GeminiVisionSkill."""
        try:
            import fitz  # PyMuPDF
        except ImportError:
            return "[Scanned PDF detected. Install pymupdf for OCR support.]"

        from backend.core.base_skill import SkillInput as SI
        from backend.core.skills.gemini_vision_skill import GeminiVisionSkill

        vision = GeminiVisionSkill()
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        page_texts: list[str] = []

        for page in doc:
            pix = page.get_pixmap(dpi=150)
            img_bytes = pix.tobytes("png")
            result = await vision.execute(SI(data=img_bytes))
            if result.success and result.output:
                page_texts.append(result.output)

        doc.close()
        return "\n\n".join(page_texts)
