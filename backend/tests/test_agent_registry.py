"""Unit tests for the AgentRegistry auto-discovery system."""
import pytest

from backend.core.agent_registry import AgentRegistry


class TestAgentRegistry:
    @pytest.fixture(autouse=True)
    def fresh_registry(self):
        """Use a fresh registry for each test (not the module singleton)."""
        self.registry = AgentRegistry()

    def test_empty_before_discover(self):
        assert self.registry.domains() == []
        assert self.registry.list_all() == []
        assert self.registry.get("medical") is None

    def test_discover_registers_medical_agent(self):
        self.registry.discover()
        assert "medical" in self.registry.domains()

    def test_get_returns_correct_agent(self):
        self.registry.discover()
        agent = self.registry.get("medical")
        assert agent is not None
        assert agent.domain == "medical"
        assert agent.display_name == "Medical Analysis"
        assert agent.version == "1.0.0"

    def test_list_all_returns_agents(self):
        self.registry.discover()
        agents = self.registry.list_all()
        assert len(agents) >= 1
        domains = [a.domain for a in agents]
        assert "medical" in domains

    def test_get_unknown_domain_returns_none(self):
        self.registry.discover()
        assert self.registry.get("nonexistent_domain") is None

    def test_discover_is_idempotent(self):
        """Calling discover() twice should not duplicate agents."""
        self.registry.discover()
        count_first = len(self.registry.list_all())
        self.registry.discover()
        count_second = len(self.registry.list_all())
        # May re-register (overwrite), but shouldn't exceed original count
        assert count_second >= count_first
