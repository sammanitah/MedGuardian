"""Shared Pydantic schemas for the universal analysis pipeline."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any, Literal

from pydantic import BaseModel, Field


class AnalysisSection(BaseModel):
    """A single output section from a domain agent.

    Domain agents return a list of these; the frontend renders each
    using a domain-specific component (if registered) or SectionCard fallback.
    """

    id: str                   # e.g. "explanation", "safety", "possible_causes"
    title: str                # Display title
    icon: str                 # Lucide icon name string
    severity: Literal["info", "warning", "danger", "success", "tip"]
    content: dict[str, Any]   # Agent-defined shape — flexible
    order: int                # Render order (ascending)


class DomainResult(BaseModel):
    """Raw output from a domain agent before Orchestrator wrapping."""

    sections: list[AnalysisSection]
    metadata: dict[str, Any] = {}


class AnalysisReport(BaseModel):
    """Universal API response — the only schema the frontend knows."""

    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    domain: str
    display_name: str
    filename: str
    file_type: str
    raw_text: str
    sections: list[AnalysisSection]
    disclaimer: str           # Always injected by Orchestrator (never by domain agent)
    processing_time_ms: int
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )


class AgentInfo(BaseModel):
    """Metadata about a registered domain agent (returned by /api/v1/agents)."""

    domain: str
    display_name: str
    version: str
    description: str
