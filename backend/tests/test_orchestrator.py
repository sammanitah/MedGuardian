"""Unit tests for the Orchestrator pipeline."""
import pytest

from backend.core.orchestrator import DISCLAIMER
from backend.core.schemas import AnalysisReport, AnalysisSection, DomainResult


class TestOrchestrator:
    async def test_disclaimer_is_always_present(self, mocker, tmp_path):
        """Architectural guarantee: Orchestrator always injects disclaimer."""
        from backend.core.orchestrator import Orchestrator

        # Mock ingestion
        mock_ingested = {
            "path": str(tmp_path / "test.jpg"),
            "mime_type": "image/jpeg",
            "filename": "test.jpg",
            "size_bytes": 100,
        }
        # Create a fake temp file
        (tmp_path / "test.jpg").write_bytes(b"fake")

        mock_section = AnalysisSection(
            id="explanation", title="Test", icon="FileText",
            severity="info", content={"summary": "test"}, order=1
        )
        mock_domain_result = DomainResult(sections=[mock_section])

        mocker.patch.object(
            Orchestrator, "__init__", lambda self: None
        )
        orch = Orchestrator.__new__(Orchestrator)

        # Patch internal agents
        orch._ingestion = mocker.MagicMock()
        orch._ingestion.ingest = mocker.AsyncMock(return_value=mock_ingested)
        orch._extraction = mocker.MagicMock()
        orch._extraction.extract = mocker.AsyncMock(return_value="sample text")

        # Patch registry
        mock_agent = mocker.MagicMock()
        mock_agent.domain = "medical"
        mock_agent.display_name = "Medical Analysis"
        mock_agent.analyze = mocker.AsyncMock(return_value=mock_domain_result)

        mock_registry = mocker.MagicMock()
        mock_registry.get.return_value = mock_agent
        mocker.patch("backend.core.orchestrator.get_registry", return_value=mock_registry)

        report = await orch.run(
            file_bytes=b"fake",
            filename="test.jpg",
            content_type="image/jpeg",
            domain="medical",
        )

        assert isinstance(report, AnalysisReport)
        assert report.disclaimer == DISCLAIMER
        assert "Always consult a qualified healthcare professional" in report.disclaimer

    async def test_unknown_domain_raises_value_error(self, mocker, tmp_path):
        from backend.core.orchestrator import Orchestrator

        orch = Orchestrator.__new__(Orchestrator)
        orch._ingestion = mocker.MagicMock()
        orch._ingestion.ingest = mocker.AsyncMock(return_value={
            "path": str(tmp_path / "x.pdf"), "mime_type": "application/pdf",
            "filename": "x.pdf", "size_bytes": 10
        })
        (tmp_path / "x.pdf").write_bytes(b"fake")
        orch._extraction = mocker.MagicMock()
        orch._extraction.extract = mocker.AsyncMock(return_value="text")

        mock_registry = mocker.MagicMock()
        mock_registry.get.return_value = None
        mock_registry.domains.return_value = ["medical"]
        mocker.patch("backend.core.orchestrator.get_registry", return_value=mock_registry)

        with pytest.raises(ValueError, match="not registered"):
            await orch.run(b"fake", "x.pdf", "application/pdf", domain="unknown")

    async def test_report_has_required_fields(self, mocker, tmp_path):
        from backend.core.orchestrator import Orchestrator

        mock_ingested = {
            "path": str(tmp_path / "t.png"),
            "mime_type": "image/png",
            "filename": "t.png",
            "size_bytes": 50,
        }
        (tmp_path / "t.png").write_bytes(b"fake")

        mock_section = AnalysisSection(
            id="safety", title="Safety", icon="Shield",
            severity="success", content={}, order=1
        )
        mock_agent = mocker.MagicMock()
        mock_agent.domain = "medical"
        mock_agent.display_name = "Medical Analysis"
        mock_agent.analyze = mocker.AsyncMock(
            return_value=DomainResult(sections=[mock_section])
        )

        orch = Orchestrator.__new__(Orchestrator)
        orch._ingestion = mocker.MagicMock()
        orch._ingestion.ingest = mocker.AsyncMock(return_value=mock_ingested)
        orch._extraction = mocker.MagicMock()
        orch._extraction.extract = mocker.AsyncMock(return_value="text")

        mock_registry = mocker.MagicMock()
        mock_registry.get.return_value = mock_agent
        mocker.patch("backend.core.orchestrator.get_registry", return_value=mock_registry)

        report = await orch.run(b"fake", "t.png", "image/png")

        assert report.session_id is not None
        assert report.processing_time_ms >= 0
        assert report.timestamp is not None
        assert report.domain == "medical"
        assert len(report.sections) == 1
