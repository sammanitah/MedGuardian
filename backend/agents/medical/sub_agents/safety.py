"""SafetySubAgent — drug interaction and safety flag analysis."""
from __future__ import annotations

from backend.core.base_skill import SkillInput
from backend.core.skills.gemini_text_skill import GeminiTextSkill
from backend.agents.medical.prompts import SYSTEM_MEDICAL, SAFETY_PROMPT

_FALLBACK: dict = {
    "safety_level": "caution",
    "overall_assessment": "Safety analysis unavailable. Please consult your doctor.",
    "flags": [],
    "warnings": [],
    "recommendations": [],
}


class SafetySubAgent:
    """Analyses medication safety, interactions, and dosage concerns."""

    def __init__(self) -> None:
        self._skill = GeminiTextSkill()

    async def run(self, text: str) -> dict:
        result = await self._skill.execute(
            SkillInput(
                data=text,
                metadata={
                    "system_prompt": SYSTEM_MEDICAL,
                    "user_prompt": SAFETY_PROMPT,
                },
            )
        )
        return result.output if result.success and isinstance(result.output, dict) else _FALLBACK
