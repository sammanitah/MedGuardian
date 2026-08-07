# pyright: reportMissingImports=false
"""
Med Guardian — FastAPI application entry point.

Startup (lifespan):
  - AgentRegistry discovers all domain agents in backend/agents/
  - Logs registered domains

API:
  POST /api/v1/analyze  — main analysis endpoint
  GET  /api/v1/agents   — list registered domain agents
  GET  /health          — liveness probe
  GET  /docs            — Swagger UI
"""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI  # type: ignore[import-not-found]
from fastapi.middleware.cors import CORSMiddleware  # type: ignore[import-not-found]

from backend.api.routes import analyze, registry
from backend.core.agent_registry import get_registry

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    # ── Startup ──────────────────────────────────────────────────────────────
    reg = get_registry()
    reg.discover()
    logger.info("Med Guardian started. Registered domains: %s", reg.domains())
    yield
    # ── Shutdown ─────────────────────────────────────────────────────────────
    logger.info("Med Guardian shutting down.")


app = FastAPI(
    title="Med Guardian API",
    description=(
        "AI-powered multi-agent medical document analysis. "
        "Upload prescriptions or lab reports and get structured insights."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(analyze.router, prefix="/api/v1", tags=["Analysis"])
app.include_router(registry.router, prefix="/api/v1", tags=["Registry"])


@app.get("/health", tags=["Health"])
async def health() -> dict[str, str]:
    """Liveness probe."""
    return {"status": "ok", "service": "Med Guardian"}
