"""RemedySubAgent — general remedies, lifestyle tips, and generic alternatives."""
from __future__ import annotations

from backend.core.base_skill import SkillInput
from backend.core.skills.gemini_text_skill import GeminiTextSkill
from backend.agents.medical.prompts import SYSTEM_MEDICAL, REMEDY_PROMPT

_FALLBACK: dict = {
    "general_remedies": [],
    "lifestyle_tips": [],
    "generic_alternatives": [],
    "dietary_suggestions": [],
    "when_to_seek_care": [],
    "disclaimer": "Consult your doctor before making any medical decisions.",
}


class RemedySubAgent:
    """Suggests general remedies, lifestyle changes, and generic medicine alternatives.

    Constraint: Must not prescribe. Output is guidance only.
    Every response must include a disclaimer field.
    """

    def __init__(self) -> None:
        self._skill = GeminiTextSkill()

    async def run(self, text: str) -> dict:
        result = await self._skill.execute(
            SkillInput(
                data=text,
                metadata={
                    "system_prompt": SYSTEM_MEDICAL,
                    "user_prompt": REMEDY_PROMPT,
                },
            )
        )
        return result.output if result.success and isinstance(result.output, dict) else _FALLBACK
