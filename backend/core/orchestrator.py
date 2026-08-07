"""
Orchestrator — coordinates the full analysis pipeline.

Pipeline order:
  1. IngestionAgent  — validate + store file
  2. ExtractionAgent — extract + normalise text
  3. AgentRegistry   — look up the requested domain agent
  4. Domain Agent    — analyze(text) → DomainResult
  5. Wrap            — build AnalysisReport and inject disclaimer

The Orchestrator is the ONLY place that injects the disclaimer.
Domain agents MUST NOT include a disclaimer in their own output —
this is an architectural safety guarantee.
"""
from __future__ import annotations

import logging
import time
import uuid
from datetime import datetime, timezone

from backend.core.agent_registry import get_registry
from backend.core.pipeline.extraction_agent import ExtractionAgent
from backend.core.pipeline.ingestion_agent import IngestionAgent
from backend.core.schemas import AnalysisReport

logger = logging.getLogger(__name__)

DISCLAIMER = (
    "⚠️ IMPORTANT: This analysis is AI-generated for educational purposes only. "
    "It does NOT constitute medical advice, diagnosis, or treatment. "
    "Always consult a qualified healthcare professional before making any medical decisions."
)


class Orchestrator:
    """Domain-agnostic analysis pipeline coordinator."""

    def __init__(self) -> None:
        self._ingestion = IngestionAgent()
        self._extraction = ExtractionAgent()

    async def run(
        self,
        file_bytes: bytes,
        filename: str,
        content_type: str,
        domain: str = "medical",
    ) -> AnalysisReport:
        start = time.monotonic()
        session_id = str(uuid.uuid4())

        logger.info("Pipeline start | session=%s | domain=%s | file=%s", session_id, domain, filename)

        # Step 1: Ingest
        ingested = await self._ingestion.ingest(file_bytes, filename, content_type)

        # Step 2: Extract text
        raw_text = await self._extraction.extract(
            ingested["path"], ingested["mime_type"]  # type: ignore[arg-type]
        )

        # Step 3: Get domain agent
        registry = get_registry()
        agent = registry.get(domain)
        if agent is None:
            available = registry.domains()
            raise ValueError(
                f"Domain '{domain}' is not registered. Available: {available}"
            )

        # Step 4: Domain analysis
        domain_result = await agent.analyze(raw_text)

        # Step 5: Wrap into AnalysisReport — inject disclaimer here
        elapsed_ms = int((time.monotonic() - start) * 1000)
        report = AnalysisReport(
            session_id=session_id,
            domain=agent.domain,
            display_name=agent.display_name,
            filename=filename,
            file_type=str(ingested["mime_type"]),
            raw_text=raw_text,
            sections=domain_result.sections,
            disclaimer=DISCLAIMER,
            processing_time_ms=elapsed_ms,
            timestamp=datetime.now(timezone.utc).isoformat(),
        )

        logger.info(
            "Pipeline complete | session=%s | sections=%d | elapsed=%dms",
            session_id,
            len(report.sections),
            elapsed_ms,
        )
        return report
