"""
Custom Skill: TextNormalizationSkill

Cleans and normalises raw text extracted from documents:
  - Strips control characters and null bytes
  - Normalises line endings to \\n
  - Collapses excessive blank lines
  - Removes trailing whitespace per line
  - Collapses runs of spaces/tabs

This skill is domain-agnostic and is always applied after extraction.
"""
import re

from backend.core.base_skill import BaseSkill, SkillInput, SkillResult


class TextNormalizationSkill(BaseSkill):
    """Custom Skill: normalises raw OCR/PDF text for downstream agents."""

    name = "text_normalization"
    description = (
        "Strips OCR noise, normalises whitespace, and removes control characters "
        "from raw extracted text. Domain-agnostic."
    )

    async def execute(self, input: SkillInput) -> SkillResult:
        try:
            text: str = input.data or ""

            # Remove null bytes and non-printable control chars (keep \n and \t)
            text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)

            # Normalise Windows / old Mac line endings
            text = text.replace("\r\n", "\n").replace("\r", "\n")

            # Strip trailing whitespace per line
            lines = [line.rstrip() for line in text.split("\n")]
            text = "\n".join(lines)

            # Collapse 3+ consecutive blank lines → 2
            text = re.sub(r"\n{3,}", "\n\n", text)

            # Collapse runs of spaces/tabs to single space
            text = re.sub(r"[ \t]+", " ", text)

            return SkillResult(success=True, output=text.strip())
        except Exception as exc:
            return SkillResult(success=False, error=str(exc))
