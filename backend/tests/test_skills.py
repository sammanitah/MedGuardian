"""Unit tests for all custom skills (Checkpoint 5)."""
import json

import pytest

from backend.core.base_skill import SkillInput


# ── TextNormalizationSkill ────────────────────────────────────────────────────


class TestTextNormalizationSkill:
    @pytest.fixture(autouse=True)
    def skill(self):
        from backend.core.skills.text_normalization_skill import TextNormalizationSkill

        self.skill = TextNormalizationSkill()

    async def test_basic_normalisation(self):
        result = await self.skill.execute(SkillInput(data="Hello  World\r\n\r\n\r\nTest"))
        assert result.success is True
        assert "Hello World" in result.output
        assert "\r" not in result.output
        assert "\n\n\n" not in result.output

    async def test_empty_string(self):
        result = await self.skill.execute(SkillInput(data=""))
        assert result.success is True
        assert result.output == ""

    async def test_strips_control_chars(self):
        result = await self.skill.execute(SkillInput(data="Hello\x00World\x1fTest"))
        assert result.success is True
        assert "\x00" not in result.output
        assert "\x1f" not in result.output
        assert "Hello" in result.output

    async def test_collapses_whitespace(self):
        result = await self.skill.execute(SkillInput(data="a   b\tc"))
        assert result.success is True
        assert "a b" in result.output

    async def test_skill_metadata(self):
        from backend.core.skills.text_normalization_skill import TextNormalizationSkill

        assert TextNormalizationSkill.name == "text_normalization"
        assert isinstance(TextNormalizationSkill.description, str)


# ── GeminiTextSkill ───────────────────────────────────────────────────────────


class TestGeminiTextSkill:
    async def test_parses_json_response(self, mock_gemini_client, mocker, sample_text):
        mocker.patch(
            "backend.core.skills.gemini_text_skill.get_gemini_client",
            return_value=mock_gemini_client,
        )
        from backend.core.skills.gemini_text_skill import GeminiTextSkill

        skill = GeminiTextSkill()
        result = await skill.execute(
            SkillInput(
                data=sample_text,
                metadata={"system_prompt": "You are helpful", "user_prompt": "Analyse"},
            )
        )
        assert result.success is True
        assert isinstance(result.output, dict)

    async def test_handles_gemini_error(self, mock_gemini_client, mocker, sample_text):
        mock_gemini_client.generate_text.side_effect = RuntimeError("API error")
        mocker.patch(
            "backend.core.skills.gemini_text_skill.get_gemini_client",
            return_value=mock_gemini_client,
        )
        from backend.core.skills.gemini_text_skill import GeminiTextSkill

        skill = GeminiTextSkill()
        result = await skill.execute(SkillInput(data=sample_text, metadata={}))
        assert result.success is False
        assert result.error is not None

    async def test_skill_metadata(self):
        from backend.core.skills.gemini_text_skill import GeminiTextSkill

        assert GeminiTextSkill.name == "gemini_text"
        assert isinstance(GeminiTextSkill.description, str)

    async def test_extracts_json_from_markdown_fence(self, mock_gemini_client, mocker, sample_text):
        mock_gemini_client.generate_text.return_value = (
            '```json\n{"summary": "test", "value": 42}\n```'
        )
        mocker.patch(
            "backend.core.skills.gemini_text_skill.get_gemini_client",
            return_value=mock_gemini_client,
        )
        from backend.core.skills.gemini_text_skill import GeminiTextSkill

        skill = GeminiTextSkill()
        result = await skill.execute(SkillInput(data=sample_text, metadata={}))
        assert result.success is True
        assert result.output.get("summary") == "test"


# ── GeminiVisionSkill ─────────────────────────────────────────────────────────


class TestGeminiVisionSkill:
    async def test_returns_extracted_text(self, mock_gemini_client, mocker):
        mocker.patch(
            "backend.core.skills.gemini_vision_skill.get_gemini_client",
            return_value=mock_gemini_client,
        )
        from backend.core.skills.gemini_vision_skill import GeminiVisionSkill

        skill = GeminiVisionSkill()
        result = await skill.execute(SkillInput(data=b"fake_image_bytes"))
        assert result.success is True
        assert isinstance(result.output, str)
        assert len(result.output) > 0

    async def test_empty_input_fails(self, mock_gemini_client, mocker):
        mocker.patch(
            "backend.core.skills.gemini_vision_skill.get_gemini_client",
            return_value=mock_gemini_client,
        )
        from backend.core.skills.gemini_vision_skill import GeminiVisionSkill

        skill = GeminiVisionSkill()
        result = await skill.execute(SkillInput(data=b""))
        assert result.success is False

    async def test_skill_metadata(self):
        from backend.core.skills.gemini_vision_skill import GeminiVisionSkill

        assert GeminiVisionSkill.name == "gemini_vision"


# ── PDFTextSkill ──────────────────────────────────────────────────────────────


class TestPDFTextSkill:
    async def test_empty_input_fails(self):
        from backend.core.skills.pdf_text_skill import PDFTextSkill

        skill = PDFTextSkill()
        result = await skill.execute(SkillInput(data=b""))
        assert result.success is False

    async def test_skill_metadata(self):
        from backend.core.skills.pdf_text_skill import PDFTextSkill

        assert PDFTextSkill.name == "pdf_text"
        assert isinstance(PDFTextSkill.description, str)
