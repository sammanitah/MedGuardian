"""Integration tests for FastAPI endpoints."""
import io
import uuid

import pytest
from httpx import ASGITransport, AsyncClient

from backend.tests.conftest import SAMPLE_EXPLANATION


@pytest.fixture
async def client():
    """ASGI test client that fires the lifespan events (so registry discovers agents)."""
    from backend.main import app

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        # The lifespan is NOT automatically run by ASGITransport by default.
        # We trigger registry.discover() manually here so tests are not
        # coupled to lifespan event ordering.
        from backend.core.agent_registry import get_registry
        get_registry().discover()
        yield ac


class TestHealthEndpoint:
    async def test_health_returns_ok(self, client):
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["service"] == "Med Guardian"


class TestAgentsEndpoint:
    async def test_list_agents_returns_medical(self, client):
        response = await client.get("/api/v1/agents")
        assert response.status_code == 200
        agents = response.json()
        assert isinstance(agents, list)
        assert len(agents) >= 1
        domains = [a["domain"] for a in agents]
        assert "medical" in domains

    async def test_agent_has_required_fields(self, client):
        response = await client.get("/api/v1/agents")
        agents = response.json()
        assert len(agents) >= 1
        agent = agents[0]
        assert "domain" in agent
        assert "display_name" in agent
        assert "version" in agent
        assert "description" in agent


class TestAnalyzeEndpoint:
    async def test_analyze_returns_report_with_disclaimer(self, client, mocker):
        """End-to-end: upload → analysis report with disclaimer always present."""
        from backend.core.schemas import AnalysisReport, AnalysisSection

        mock_section = AnalysisSection(
            id="explanation", title="Document Explanation",
            icon="FileText", severity="info",
            content=SAMPLE_EXPLANATION, order=1,
        )
        mock_report = AnalysisReport(
            session_id=str(uuid.uuid4()),
            domain="medical",
            display_name="Medical Analysis",
            filename="test.jpg",
            file_type="image/jpeg",
            raw_text="Sample prescription text",
            sections=[mock_section],
            disclaimer="Always consult a qualified healthcare professional",
            processing_time_ms=150,
            timestamp="2024-01-01T00:00:00+00:00",
        )

        # Patch the orchestrator inside the deps module (where it's instantiated)
        mock_orch = mocker.MagicMock()
        mock_orch.run = mocker.AsyncMock(return_value=mock_report)
        mocker.patch("backend.api.deps._orchestrator", mock_orch)

        response = await client.post(
            "/api/v1/analyze",
            files={"file": ("test.jpg", io.BytesIO(b"fake_image"), "image/jpeg")},
            data={"domain": "medical"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["domain"] == "medical"
        assert "disclaimer" in data
        assert len(data["disclaimer"]) > 0
        assert len(data["sections"]) >= 1

    async def test_analyze_empty_file_returns_400(self, client):
        response = await client.post(
            "/api/v1/analyze",
            files={"file": ("empty.jpg", io.BytesIO(b""), "image/jpeg")},
            data={"domain": "medical"},
        )
        assert response.status_code == 400

    async def test_analyze_missing_file_returns_422(self, client):
        response = await client.post("/api/v1/analyze", data={"domain": "medical"})
        assert response.status_code == 422
