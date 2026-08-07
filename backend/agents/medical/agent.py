"""
MedicalAnalysisAgent — Custom Domain Agent (Checkpoint 4).

Implements BaseAgent for the "medical" domain.
Auto-discovered by AgentRegistry at startup.

Design decisions:
  - Runs all 4 sub-agents concurrently via asyncio.gather (~4× faster)
  - Each sub-agent failure is caught gracefully (returns fallback, not error)
  - Disclaimer is NOT added here — the Orchestrator always injects it
  - Safety level maps to AnalysisSection severity for colour-coded UI
"""
from __future__ import annotations

import asyncio
import logging

from backend.core.base_agent import BaseAgent
from backend.core.schemas import AnalysisSection, DomainResult
from backend.agents.medical.sub_agents.diagnosis import DiagnosisSubAgent
from backend.agents.medical.sub_agents.explainer import ExplainerSubAgent
from backend.agents.medical.sub_agents.remedy import RemedySubAgent
from backend.agents.medical.sub_agents.safety import SafetySubAgent

logger = logging.getLogger(__name__)

_SAFETY_SEVERITY_MAP: dict[str, str] = {
    "safe": "success",
    "caution": "warning",
    "warning": "warning",
    "critical": "danger",
}


class MedicalAnalysisAgent(BaseAgent):
    """Custom domain agent for medical document analysis.

    Registered under domain = "medical".
    Composes 4 specialist sub-agents, each backed by GeminiTextSkill.
    """

    domain = "medical"
    display_name = "Medical Analysis"
    version = "1.0.0"
    description = (
        "Analyses prescriptions, lab reports, and medical summaries. "
        "Provides plain-language explanation, safety flags, "
        "possible findings, and general remedies."
    )

    def __init__(self) -> None:
        self._explainer = ExplainerSubAgent()
        self._safety = SafetySubAgent()
        self._diagnosis = DiagnosisSubAgent()
        self._remedy = RemedySubAgent()

    async def analyze(self, text: str) -> DomainResult:
        # Run all 4 sub-agents concurrently — ~4× faster than sequential
        _fallbacks = [
            {"document_type": "Unknown", "summary": "Unavailable.", "medications": [], "key_findings": [], "important_notes": []},
            {"safety_level": "caution", "overall_assessment": "Unavailable.", "flags": [], "warnings": [], "recommendations": []},
            {"document_context": "Unknown", "possible_conditions": [], "lab_abnormalities": [], "key_indicators": [], "educational_note": "Consult a doctor."},
            {"general_remedies": [], "lifestyle_tips": [], "generic_alternatives": [], "dietary_suggestions": [], "when_to_seek_care": [], "disclaimer": "Consult your doctor."},
        ]

        results = await asyncio.gather(
            self._explainer.run(text),
            self._safety.run(text),
            self._diagnosis.run(text),
            self._remedy.run(text),
            return_exceptions=True,
        )

        processed = []
        for i, r in enumerate(results):
            if isinstance(r, Exception):
                logger.error("Sub-agent %d failed: %s", i, r)
                processed.append(_fallbacks[i])
            else:
                processed.append(r)

        explanation, safety, diagnosis, remedy = processed

        safety_severity = _SAFETY_SEVERITY_MAP.get(
            safety.get("safety_level", "caution"), "warning"
        )

        sections = [
            AnalysisSection(
                id="explanation",
                title="Document Explanation",
                icon="FileText",
                severity="info",
                content=explanation,
                order=1,
            ),
            AnalysisSection(
                id="safety",
                title="Safety Analysis",
                icon="ShieldCheck",
                severity=safety_severity,  # type: ignore[arg-type]
                content=safety,
                order=2,
            ),
            AnalysisSection(
                id="possible_causes",
                title="Possible Causes & Findings",
                icon="Microscope",
                severity="info",
                content=diagnosis,
                order=3,
            ),
            AnalysisSection(
                id="remedies",
                title="Remedies & Alternatives",
                icon="Heart",
                severity="tip",
                content=remedy,
                order=4,
            ),
        ]

        return DomainResult(sections=sections)
