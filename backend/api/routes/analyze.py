"""POST /api/v1/analyze — main document analysis endpoint."""
from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from backend.api.deps import get_orchestrator
from backend.core.orchestrator import Orchestrator
from backend.core.schemas import AnalysisReport

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post(
    "/analyze",
    response_model=AnalysisReport,
    summary="Analyse a medical document",
    description=(
        "Upload an image (JPEG/PNG/WEBP/BMP/TIFF) or PDF. "
        "Returns a structured AnalysisReport with sections from the domain agent."
    ),
)
async def analyze_document(
    file: UploadFile = File(..., description="Medical document image or PDF"),
    domain: str = Form(default="medical", description="Domain agent to use"),
    orchestrator: Orchestrator = Depends(get_orchestrator),
) -> AnalysisReport:
    file_bytes = await file.read()

    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    logger.info(
        "Analyse request | file=%s | type=%s | domain=%s",
        file.filename,
        file.content_type,
        domain,
    )

    try:
        report = await orchestrator.run(
            file_bytes=file_bytes,
            filename=file.filename or "upload",
            content_type=file.content_type or "application/octet-stream",
            domain=domain,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Analysis pipeline error")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {exc}") from exc

    return report
