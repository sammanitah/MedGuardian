"""
Custom Skill: GeminiVisionSkill

Extracts text from images (JPEG, PNG, WEBP, BMP, TIFF) by sending them
to the Gemini Vision API.

No system-level binary dependencies (no Tesseract, no ImageMagick).
Relies solely on google-generativeai + Pillow.
"""
from backend.core.base_skill import BaseSkill, SkillInput, SkillResult
from backend.core.gemini_client import get_gemini_client

_DEFAULT_PROMPT = (
    "Extract ALL text from this medical document image exactly as it appears. "
    "Preserve structure, headings, bullet points, tables, and all text content. "
    "Do not interpret, summarise, or add any text that is not in the image."
)


class GeminiVisionSkill(BaseSkill):
    """Custom Skill: image bytes → extracted text via Gemini Vision API."""

    name = "gemini_vision"
    description = (
        "Extracts text from image files (JPEG, PNG, WEBP, BMP, TIFF) "
        "using Gemini Vision. No Tesseract binary required."
    )

    async def execute(self, input: SkillInput) -> SkillResult:
        try:
            image_bytes: bytes = input.data
            if not image_bytes:
                return SkillResult(success=False, error="No image data provided")

            prompt: str = input.metadata.get("prompt", _DEFAULT_PROMPT)
            client = get_gemini_client()
            text = await client.generate_from_image(image_bytes, prompt)
            return SkillResult(success=True, output=text)
        except Exception as exc:
            return SkillResult(success=False, error=str(exc))
