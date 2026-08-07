"""
BaseSkill — the atomic capability unit.

Every custom skill must:
  1. Inherit BaseSkill
  2. Set class-level `name` and `description`
  3. Implement `execute(input: SkillInput) -> SkillResult`

Skills are stateless, reusable, and composable by any agent.
"""
from abc import ABC, abstractmethod
from typing import Any

from pydantic import BaseModel


class SkillInput(BaseModel):
    """Universal input wrapper for any skill."""

    data: Any
    metadata: dict[str, Any] = {}


class SkillResult(BaseModel):
    """Universal output wrapper returned by every skill."""

    success: bool
    output: Any = None
    error: str | None = None


class BaseSkill(ABC):
    """Abstract base class for all custom skills.

    A skill is a discrete, reusable capability that an agent can invoke.
    Skills know *how* to do something; agents decide *when* and *why*.
    """

    name: str
    description: str

    @abstractmethod
    async def execute(self, input: SkillInput) -> SkillResult:
        """Execute the skill and return a SkillResult."""
        ...
