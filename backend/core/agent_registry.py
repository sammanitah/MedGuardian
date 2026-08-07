"""
AgentRegistry — auto-discovers and manages domain agent plugins.

At application startup (lifespan), `discover()` scans backend/agents/*/agent.py
and loads every BaseAgent subclass it finds. No manual registration needed.

Adding a new domain agent:
  1. Create backend/agents/<domain>/agent.py
  2. Define a class that inherits BaseAgent with domain = "<domain>"
  3. Restart the server — done.
"""
from __future__ import annotations

import importlib
import inspect
import logging
from pathlib import Path

from backend.core.base_agent import BaseAgent

logger = logging.getLogger(__name__)


class AgentRegistry:
    """Singleton registry that holds all discovered domain agents."""

    def __init__(self) -> None:
        self._agents: dict[str, BaseAgent] = {}

    def discover(self, agents_package: str = "backend.agents") -> None:
        """Scan backend/agents/ and register all BaseAgent subclasses."""
        # Robustly find the project root: walk up from this file until we
        # find the directory that contains both 'backend/' and 'backend/agents/'
        this_file = Path(__file__).resolve()
        # This file: backend/core/agent_registry.py
        # Project root is 2 levels up: backend/core → backend → project root
        project_root = this_file.parent.parent.parent
        agents_root = project_root / "backend" / "agents"

        if not agents_root.exists():
            logger.warning("Agents directory not found: %s", agents_root)
            return

        for domain_dir in sorted(agents_root.iterdir()):
            if not domain_dir.is_dir() or domain_dir.name.startswith("_"):
                continue
            agent_file = domain_dir / "agent.py"
            if not agent_file.exists():
                continue

            module_name = f"{agents_package}.{domain_dir.name}.agent"
            try:
                module = importlib.import_module(module_name)
                for _name, cls in inspect.getmembers(module, inspect.isclass):
                    if (
                        issubclass(cls, BaseAgent)
                        and cls is not BaseAgent
                        and hasattr(cls, "domain")
                    ):
                        instance: BaseAgent = cls()
                        self._agents[instance.domain] = instance
                        logger.info(
                            "Registered domain agent: %s v%s",
                            instance.domain,
                            instance.version,
                        )
            except Exception as exc:  # noqa: BLE001
                logger.error("Failed to load agent from %s: %s", module_name, exc)

    def get(self, domain: str) -> BaseAgent | None:
        """Return the agent for a given domain key, or None."""
        return self._agents.get(domain)

    def list_all(self) -> list[BaseAgent]:
        """Return all registered agents."""
        return list(self._agents.values())

    def domains(self) -> list[str]:
        """Return a list of all registered domain keys."""
        return list(self._agents.keys())


# Module-level singleton
_registry = AgentRegistry()


def get_registry() -> AgentRegistry:
    """Return the application-wide AgentRegistry singleton."""
    return _registry
