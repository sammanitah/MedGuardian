"""
BaseAgent — the domain plugin contract.

Every domain analysis agent must:
  1. Inherit BaseAgent
  2. Set class-level `domain`, `display_name`, `description`
  3. Implement `analyze(text: str) -> DomainResult`

The Orchestrator discovers agents via the AgentRegistry and calls
agent.analyze() without knowing anything about the domain.
"""
from __future__ import annotations

from abc import ABC, abstractmethod

from backend.core.schemas import DomainResult


class BaseAgent(ABC):
    """Abstract base class for all domain analysis agents.

    Agents know *what* a domain means; the Orchestrator does not.
    Adding a new domain = create a new subclass, drop it in backend/agents/.
    Zero changes to the core pipeline.
    """

    domain: str          # Unique domain key, e.g. "medical"
    display_name: str    # Human-readable name, e.g. "Medical Analysis"
    version: str = "1.0.0"
    description: str

    @abstractmethod
    async def analyze(self, text: str) -> DomainResult:
        """Analyze extracted document text and return structured sections."""
        ...
