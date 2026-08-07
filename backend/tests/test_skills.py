# pyright: reportMissingImports=false
"""Unit tests for all custom skills (Checkpoint 5)."""
from backend.core.base_skill import SkillInput


# ── TextNormalizationSkill ────────────────────────────────────────────────────


class TestTextNormalizationSkill:
    async def test_basic_normalisation(self) -> None:
        from backend.core.skills.text_normalization_skill import TextNormalizationSkill

        skill = TextNormalizationSkill()
        result = await skill.execute(SkillInput(data="  Hello   World  \r\n\r\n"))
        assert result.success is True
        assert result.output == "Hello World"

    async def test_empty_string(self) -> None:
        from backend.core.skills.text_normalization_skill import TextNormalizationSkill

        skill = TextNormalizationSkill()
        result = await skill.execute(SkillInput(data="   "))
        assert result.success is True
        assert result.output == ""

    async def test_strips_control_chars(self) -> None:
        from backend.core.skills.text_normalization_skill import TextNormalizationSkill

        skill = TextNormalizationSkill()
        result = await skill.execute(SkillInput(data="Text\x00with\x08nulls"))
        assert result.success is True
        assert "\x00" not in result.output

    async def test_collapses_whitespace(self) -> None:
        from backend.core.skills.text_normalization_skill import TextNormalizationSkill

        skill = TextNormalizationSkill()
        result = await skill.execute(SkillInput(data="A\n\n\n\n\nB"))
        assert result.success is True
        assert result.output == "A\n\nB"

    def test_skill_metadata(self) -> None:
        from backend.core.skills.text_normalization_skill import TextNormalizationSkill

        skill = TextNormalizationSkill()
        assert skill.name == "text_normalization"
        assert len(skill.description) > 0


# ── GeminiTextSkill ───────────────────────────────────────────────────────────


class TestGeminiTextSkill:
    async def test_parses_json_response(self, mocker) -> None:
        from backend.core.skills.gemini_text_skill import GeminiTextSkill

        mock_gemini = mocker.MagicMock()
        mock_gemini.generate_text = mocker.AsyncMock(
            return_value='{"key": "value", "list": [1, 2]}'
        )
        mocker.patch(
            "backend.core.skills.gemini_text_skill.get_gemini_client",
            return_value=mock_gemini,
        )

        skill = GeminiTextSkill()
        result = await skill.execute(
            SkillInput(
                data="sample document",
                metadata={"system_prompt": "sys", "user_prompt": "user"},
            )
        )

        assert result.success is True
        assert isinstance(result.output, dict)
        assert result.output["key"] == "value"

    async def test_handles_gemini_error(self, mocker) -> None:
        from backend.core.skills.gemini_text_skill import GeminiTextSkill

        mock_gemini = mocker.MagicMock()
        mock_gemini.generate_text = mocker.AsyncMock(
            side_effect=RuntimeError("API quota exceeded")
        )
        mocker.patch(
            "backend.core.skills.gemini_text_skill.get_gemini_client",
            return_value=mock_gemini,
        )

        skill = GeminiTextSkill()
        result = await skill.execute(
            SkillInput(
                data="sample",
                metadata={"system_prompt": "s", "user_prompt": "u"},
            )
        )

        assert result.success is False
        assert "API quota exceeded" in result.error

    def test_skill_metadata(self) -> None:
        from backend.core.skills.gemini_text_skill import GeminiTextSkill

        skill = GeminiTextSkill()
        assert skill.name == "gemini_text"

    def test_extracts_json_from_markdown_fence(self) -> None:
        from backend.core.skills.gemini_text_skill import _extract_json

        fenced = "```json\n{\"summary\": \"test\"}\n```"
        result = _extract_json(fenced)
        assert result["summary"] == "test"


# ── GeminiVisionSkill ─────────────────────────────────────────────────────────


class TestGeminiVisionSkill:
    async def test_returns_extracted_text(self, mocker) -> None:
        from backend.core.skills.gemini_vision_skill import GeminiVisionSkill

        mock_gemini = mocker.MagicMock()
        mock_gemini.generate_from_image = mocker.AsyncMock(
            return_value="Extracted OCR text"
        )
        mocker.patch(
            "backend.core.skills.gemini_vision_skill.get_gemini_client",
            return_value=mock_gemini,
        )

        skill = GeminiVisionSkill()
        result = await skill.execute(SkillInput(data=b"fake_image_bytes"))

        assert result.success is True
        assert result.output == "Extracted OCR text"

    async def test_empty_input_fails(self) -> None:
        from backend.core.skills.gemini_vision_skill import GeminiVisionSkill

        skill = GeminiVisionSkill()
        result = await skill.execute(SkillInput(data=b""))
        assert result.success is False

    def test_skill_metadata(self) -> None:
        from backend.core.skills.gemini_vision_skill import GeminiVisionSkill

        skill = GeminiVisionSkill()
        assert skill.name == "gemini_vision"


# ── PDFTextSkill ──────────────────────────────────────────────────────────────


class TestPDFTextSkill:
    async def test_empty_input_fails(self) -> None:
        from backend.core.skills.pdf_text_skill import PDFTextSkill

        skill = PDFTextSkill()
        result = await skill.execute(SkillInput(data=b""))
        assert result.success is False

    def test_skill_metadata(self) -> None:
        from backend.core.skills.pdf_text_skill import PDFTextSkill

        skill = PDFTextSkill()
        assert skill.name == "pdf_text"
