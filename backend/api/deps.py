"""Shared FastAPI dependencies."""
from backend.core.agent_registry import AgentRegistry, get_registry
from backend.core.orchestrator import Orchestrator

# Module-level singleton — created once, reused across requests
_orchestrator = Orchestrator()


def get_orchestrator() -> Orchestrator:
    return _orchestrator


def get_agent_registry() -> AgentRegistry:
    return get_registry()
