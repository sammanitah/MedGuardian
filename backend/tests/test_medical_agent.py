"""Unit tests for MedicalAnalysisAgent and its sub-agents."""
from backend.tests.conftest import (
    SAMPLE_DIAGNOSIS,
    SAMPLE_EXPLANATION,
    SAMPLE_REMEDY,
    SAMPLE_SAFETY,
    SAMPLE_TEXT,
)


class TestMedicalAnalysisAgent:
    async def test_analyze_returns_four_sections(self, mocker):
        from backend.agents.medical.agent import MedicalAnalysisAgent

        agent = MedicalAnalysisAgent()
        mocker.patch.object(agent._explainer, "run", mocker.AsyncMock(return_value=SAMPLE_EXPLANATION))
        mocker.patch.object(agent._safety, "run", mocker.AsyncMock(return_value=SAMPLE_SAFETY))
        mocker.patch.object(agent._diagnosis, "run", mocker.AsyncMock(return_value=SAMPLE_DIAGNOSIS))
        mocker.patch.object(agent._remedy, "run", mocker.AsyncMock(return_value=SAMPLE_REMEDY))

        result = await agent.analyze(SAMPLE_TEXT)

        assert len(result.sections) == 4
        section_ids = {s.id for s in result.sections}
        assert section_ids == {"explanation", "safety", "possible_causes", "remedies"}

    async def test_sections_have_correct_order(self, mocker):
        from backend.agents.medical.agent import MedicalAnalysisAgent

        agent = MedicalAnalysisAgent()
        mocker.patch.object(agent._explainer, "run", mocker.AsyncMock(return_value=SAMPLE_EXPLANATION))
        mocker.patch.object(agent._safety, "run", mocker.AsyncMock(return_value=SAMPLE_SAFETY))
        mocker.patch.object(agent._diagnosis, "run", mocker.AsyncMock(return_value=SAMPLE_DIAGNOSIS))
        mocker.patch.object(agent._remedy, "run", mocker.AsyncMock(return_value=SAMPLE_REMEDY))

        result = await agent.analyze(SAMPLE_TEXT)
        orders = [s.order for s in result.sections]
        assert orders == sorted(orders)

    async def test_safety_level_safe_maps_to_success_severity(self, mocker):
        from backend.agents.medical.agent import MedicalAnalysisAgent

        agent = MedicalAnalysisAgent()
        mocker.patch.object(agent._explainer, "run", mocker.AsyncMock(return_value=SAMPLE_EXPLANATION))
        mocker.patch.object(agent._safety, "run", mocker.AsyncMock(return_value=SAMPLE_SAFETY))
        mocker.patch.object(agent._diagnosis, "run", mocker.AsyncMock(return_value=SAMPLE_DIAGNOSIS))
        mocker.patch.object(agent._remedy, "run", mocker.AsyncMock(return_value=SAMPLE_REMEDY))

        result = await agent.analyze(SAMPLE_TEXT)
        safety_section = next(s for s in result.sections if s.id == "safety")
        assert safety_section.severity == "success"  # safe → success

    async def test_sub_agent_failure_uses_fallback(self, mocker):
        """If one sub-agent crashes, the others still succeed."""
        from backend.agents.medical.agent import MedicalAnalysisAgent

        agent = MedicalAnalysisAgent()
        mocker.patch.object(agent._explainer, "run", mocker.AsyncMock(side_effect=RuntimeError("boom")))
        mocker.patch.object(agent._safety, "run", mocker.AsyncMock(return_value=SAMPLE_SAFETY))
        mocker.patch.object(agent._diagnosis, "run", mocker.AsyncMock(return_value=SAMPLE_DIAGNOSIS))
        mocker.patch.object(agent._remedy, "run", mocker.AsyncMock(return_value=SAMPLE_REMEDY))

        result = await agent.analyze(SAMPLE_TEXT)
        # Should still return 4 sections with fallback for explainer
        assert len(result.sections) == 4

    async def test_agent_metadata(self):
        from backend.agents.medical.agent import MedicalAnalysisAgent

        agent = MedicalAnalysisAgent()
        assert agent.domain == "medical"
        assert agent.display_name == "Medical Analysis"
        assert agent.version == "1.0.0"
        assert isinstance(agent.description, str)

    async def test_disclaimer_not_in_domain_result(self, mocker):
        """Domain agent must NOT add disclaimer — that's the Orchestrator's job."""
        from backend.agents.medical.agent import MedicalAnalysisAgent

        agent = MedicalAnalysisAgent()
        mocker.patch.object(agent._explainer, "run", mocker.AsyncMock(return_value=SAMPLE_EXPLANATION))
        mocker.patch.object(agent._safety, "run", mocker.AsyncMock(return_value=SAMPLE_SAFETY))
        mocker.patch.object(agent._diagnosis, "run", mocker.AsyncMock(return_value=SAMPLE_DIAGNOSIS))
        mocker.patch.object(agent._remedy, "run", mocker.AsyncMock(return_value=SAMPLE_REMEDY))

        result = await agent.analyze(SAMPLE_TEXT)
        # DomainResult has no disclaimer field — check it's not there
        assert not hasattr(result, "disclaimer")
