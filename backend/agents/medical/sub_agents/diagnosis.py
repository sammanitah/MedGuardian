"""DiagnosisSubAgent — educational possible-causes analysis from document content."""
from __future__ import annotations

from backend.core.base_skill import SkillInput
from backend.core.skills.gemini_text_skill import GeminiTextSkill
from backend.agents.medical.prompts import SYSTEM_MEDICAL, DIAGNOSIS_PROMPT

_FALLBACK: dict = {
    "document_context": "Unknown",
    "possible_conditions": [],
    "lab_abnormalities": [],
    "key_indicators": [],
    "educational_note": "Always consult a qualified doctor for a proper diagnosis.",
}


class DiagnosisSubAgent:
    """Identifies possible causes and findings mentioned in the document.

    Constraint: Output is strictly educational. The sub-agent must
    never use 'diagnosis' without an explicit educational qualifier.
    """

    def __init__(self) -> None:
        self._skill = GeminiTextSkill()

    async def run(self, text: str) -> dict:
        result = await self._skill.execute(
            SkillInput(
                data=text,
                metadata={
                    "system_prompt": SYSTEM_MEDICAL,
                    "user_prompt": DIAGNOSIS_PROMPT,
                },
            )
        )
        return result.output if result.success and isinstance(result.output, dict) else _FALLBACK
