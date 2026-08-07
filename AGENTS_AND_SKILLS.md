# Med Guardian — Agents and Skills

This document satisfies ADLC hackathon checkpoint: every **custom agent** and every **custom skill** is documented here.

---

## Custom Agents

### 1. MedicalAnalysisAgent ⭐
**File:** [`backend/agents/medical/agent.py`](backend/agents/medical/agent.py)
**Inherits:** `BaseAgent`
**Domain key:** `"medical"`

#### What makes it "custom"
- Designed specifically for the medical domain
- Orchestrates 4 specialised sub-agents running in parallel
- Implements the medical-specific section structure
- Auto-discovered by `AgentRegistry` — zero registration boilerplate

#### Custom Behaviour
```python
class MedicalAnalysisAgent(BaseAgent):
    domain = "medical"
    # Runs 4 sub-agents concurrently using asyncio.gather
    async def analyze(self, text: str) -> DomainResult:
        results = await asyncio.gather(
            self._explainer.run(text),
            self._safety.run(text),
            self._diagnosis.run(text),
            self._remedy.run(text),
            return_exceptions=True,
        )
        ...
```

#### Sub-Agents (composed internally)
| Name | File |
|------|------|
| ExplainerSubAgent | `backend/agents/medical/sub_agents/explainer.py` |
| SafetySubAgent | `backend/agents/medical/sub_agents/safety.py` |
| DiagnosisSubAgent | `backend/agents/medical/sub_agents/diagnosis.py` |
| RemedySubAgent | `backend/agents/medical/sub_agents/remedy.py` |

---

## Custom Skills

### Skill 1: TextNormalizationSkill ⭐
**File:** [`backend/core/skills/text_normalization_skill.py`](backend/core/skills/text_normalization_skill.py)
**Name key:** `"text_normalization"`
**Inherits:** `BaseSkill`

#### Purpose
Cleans raw text extracted from documents:
- Strips null bytes and control characters
- Normalises line endings (`\r\n` → `\n`)
- Strips trailing whitespace per line
- Collapses 3+ blank lines → 2
- Collapses runs of spaces/tabs to a single space

#### Why it's custom
This is a purpose-built, domain-agnostic preprocessing step. Every document ingested goes through this skill before reaching any domain agent.

#### Input / Output
- **Input:** `SkillInput(data: str)` — raw extracted text
- **Output:** `SkillResult(success=True, output: str)` — clean text

---

### Skill 2: GeminiVisionSkill ⭐
**File:** [`backend/core/skills/gemini_vision_skill.py`](backend/core/skills/gemini_vision_skill.py)
**Name key:** `"gemini_vision"`
**Inherits:** `BaseSkill`

#### Purpose
Extracts text from images (JPEG, PNG, WEBP, BMP, TIFF) using Gemini Vision API. No binary system dependencies (no Tesseract).

#### Why it's custom
Wraps the Gemini multimodal API in a Skill-compatible interface so any agent can call it uniformly without managing API keys or retry logic.

#### Input / Output
- **Input:** `SkillInput(data: bytes)` — raw image bytes
- **Output:** `SkillResult(success=True, output: str)` — extracted text

---

### Skill 3: GeminiTextSkill ⭐
**File:** [`backend/core/skills/gemini_text_skill.py`](backend/core/skills/gemini_text_skill.py)
**Name key:** `"gemini_text"`
**Inherits:** `BaseSkill`

#### Purpose
Sends a structured prompt + document text to Gemini and returns a parsed JSON dict. All 4 medical sub-agents use this skill.

#### Why it's custom
Centralises JSON parsing, markdown code-fence stripping, and error handling so sub-agents get clean Python dicts — not raw strings.

#### Input / Output
- **Input:** `SkillInput(data: str, metadata={"system_prompt": ..., "user_prompt": ...})`
- **Output:** `SkillResult(success=True, output: dict)` — parsed JSON

---

### Skill 4: PDFTextSkill ⭐
**File:** [`backend/core/skills/pdf_text_skill.py`](backend/core/skills/pdf_text_skill.py)
**Name key:** `"pdf_text"`
**Inherits:** `BaseSkill`

#### Purpose
Extracts text from PDF files:
1. **Primary path:** `pdfplumber` — fast, no API calls, for text-layer PDFs
2. **Fallback:** PyMuPDF renders pages to images → `GeminiVisionSkill` — for scanned/image-only PDFs

#### Why it's custom
Dual-strategy extraction with graceful fallback. Sub-skills are composable (PDFTextSkill internally uses GeminiVisionSkill).

#### Input / Output
- **Input:** `SkillInput(data: bytes)` — PDF file bytes
- **Output:** `SkillResult(success=True, output: str)` — full extracted text

---

## BaseSkill Contract

All custom skills must implement:

```python
class BaseSkill(ABC):
    name: str          # unique key, e.g. "gemini_vision"
    description: str   # human-readable purpose

    @abstractmethod
    async def execute(self, input: SkillInput) -> SkillResult: ...
```

## BaseAgent Contract

All custom agents must implement:

```python
class BaseAgent(ABC):
    domain: str
    display_name: str
    version: str
    description: str

    @abstractmethod
    async def analyze(self, text: str) -> DomainResult: ...
```

## Summary Table

| Type | Name | File | Key |
|------|------|------|-----|
| Custom Agent | MedicalAnalysisAgent | `backend/agents/medical/agent.py` | `"medical"` |
| Custom Skill | TextNormalizationSkill | `backend/core/skills/text_normalization_skill.py` | `"text_normalization"` |
| Custom Skill | GeminiVisionSkill | `backend/core/skills/gemini_vision_skill.py` | `"gemini_vision"` |
| Custom Skill | GeminiTextSkill | `backend/core/skills/gemini_text_skill.py` | `"gemini_text"` |
| Custom Skill | PDFTextSkill | `backend/core/skills/pdf_text_skill.py` | `"pdf_text"` |
