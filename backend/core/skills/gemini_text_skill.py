"""
Custom Skill: GeminiTextSkill

Sends a structured text prompt to Gemini and parses the response as JSON.
Used by every domain analysis sub-agent to get structured output.

Input metadata keys:
  - system_prompt (str): Gemini system instruction
  - user_prompt   (str): Task-specific prompt prepended to document text
"""
from __future__ import annotations

import json
import re

from backend.core.base_skill import BaseSkill, SkillInput, SkillResult
from backend.core.gemini_client import get_gemini_client


def _extract_json(raw: str) -> dict:
    """Best-effort JSON extraction from a Gemini response string."""
    raw = raw.strip()

    # Strip markdown code fences if present
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)

    # Try full parse
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass

    # Find first {...} block
    match = re.search(r"\{[\s\S]*\}", raw)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    # Fallback: return raw text wrapped in dict
    return {"text": raw}


class GeminiTextSkill(BaseSkill):
    """Custom Skill: text + prompt → structured JSON via Gemini."""

    name = "gemini_text"
    description = (
        "Sends document text and a structured prompt to Gemini, "
        "then parses and returns the JSON response. "
        "Used by all domain analysis sub-agents."
    )

    async def execute(self, input: SkillInput) -> SkillResult:
        try:
            document_text: str = input.data or ""
            system_prompt: str = input.metadata.get("system_prompt", "")
            user_prompt: str = input.metadata.get("user_prompt", "")

            full_prompt = f"{user_prompt}\n\nDocument text:\n{document_text}"

            client = get_gemini_client()
            raw = await client.generate_text(full_prompt, system_prompt)
            parsed = _extract_json(raw)
            return SkillResult(success=True, output=parsed)
        except Exception as exc:
            return SkillResult(success=False, error=str(exc))
