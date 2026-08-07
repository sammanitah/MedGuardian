"""ExplainerSubAgent — plain-language summary of a medical document."""
from __future__ import annotations

from backend.core.base_skill import SkillInput
from backend.core.skills.gemini_text_skill import GeminiTextSkill
from backend.agents.medical.prompts import SYSTEM_MEDICAL, EXPLAINER_PROMPT

_FALLBACK: dict = {
    "document_type": "Unknown",
    "summary": "Analysis unavailable.",
    "medications": [],
    "key_findings": [],
    "important_notes": [],
}


class ExplainerSubAgent:
    """Explains the document in plain English for non-medical readers."""

    def __init__(self) -> None:
        self._skill = GeminiTextSkill()

    async def run(self, text: str) -> dict:
        result = await self._skill.execute(
            SkillInput(
                data=text,
                metadata={
                    "system_prompt": SYSTEM_MEDICAL,
                    "user_prompt": EXPLAINER_PROMPT,
                },
            )
        )
        return result.output if result.success and isinstance(result.output, dict) else _FALLBACK
