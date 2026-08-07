# Med Guardian — Agents

This document describes every AI agent in the Med Guardian system.

---

## 1. IngestionAgent
**File:** `backend/core/pipeline/ingestion_agent.py`
**Type:** Core pipeline agent (not a domain plugin)
**Domain-agnostic:** Yes

### Responsibilities
- Accept a raw file upload (bytes + filename + content_type)
- Validate the MIME type against the allowed list
- Enforce the configured maximum file size
- Write the file to the upload directory with a UUID filename
- Return metadata: `path`, `mime_type`, `filename`, `size_bytes`

### Rules & Constraints
- Must NOT know anything about medical, legal, or any domain
- Must raise `ValueError` for unsupported MIME types
- Must raise `ValueError` for files exceeding `MAX_FILE_SIZE_MB`
- Does NOT call any AI API

---

## 2. ExtractionAgent
**File:** `backend/core/pipeline/extraction_agent.py`
**Type:** Core pipeline agent
**Domain-agnostic:** Yes

### Responsibilities
- Dispatch the ingested file to the correct extraction Skill based on MIME type
- Apply `TextNormalizationSkill` to all extracted text
- Delete the temporary file after successful extraction
- Return clean, normalised plain text

### Rules & Constraints
- Must NOT know anything about medical, legal, or any domain
- Always applies `TextNormalizationSkill` after extraction
- Raises `ValueError` for unsupported MIME types
- Raises `RuntimeError` if the extraction skill fails

### Skill dispatch table
| MIME type | Skill used |
|-----------|-----------|
| image/* | GeminiVisionSkill |
| application/pdf | PDFTextSkill (+ GeminiVision fallback) |

---

## 3. Orchestrator
**File:** `backend/core/orchestrator.py`
**Type:** Pipeline coordinator (not a domain plugin)
**Domain-agnostic:** Yes

### Responsibilities
1. Call `IngestionAgent.ingest()`
2. Call `ExtractionAgent.extract()`
3. Resolve the domain agent via `AgentRegistry.get(domain)`
4. Call `DomainAgent.analyze(text)`
5. Wrap the `DomainResult` in an `AnalysisReport`
6. **Inject the mandatory disclaimer** into `AnalysisReport.disclaimer`

### Safety Guarantee
The Orchestrator is the **sole and only** place where the disclaimer is injected.
Domain agents MUST NOT add disclaimers. This is an architectural invariant.

### Rules & Constraints
- Raises `ValueError` if the requested domain is not registered
- Processing time is measured from `run()` call to `AnalysisReport` construction
- Session ID is a UUID4, unique per request

---

## 4. AgentRegistry
**File:** `backend/core/agent_registry.py`
**Type:** Plugin manager (not an analysis agent)

### Responsibilities
- At startup, scan `backend/agents/*/agent.py`
- Import every class that inherits from `BaseAgent`
- Register it under `agent.domain`

### Rules & Constraints
- Registration failures are logged but do not crash the server
- `get(domain)` returns `None` for unknown domains (not an exception)
- Calling `discover()` twice will re-register existing agents (idempotent)

---

## 5. MedicalAnalysisAgent ⭐ (Custom Domain Agent)
**File:** `backend/agents/medical/agent.py`
**Class:** `MedicalAnalysisAgent(BaseAgent)`
**Domain key:** `"medical"`
**Domain:** Medical documents (prescriptions, lab reports, summaries)

### Responsibilities
- Run 4 specialist sub-agents **concurrently** via `asyncio.gather`
- Map the combined results to a list of `AnalysisSection` objects
- Return a `DomainResult` (no disclaimer — that's the Orchestrator's job)

### Sub-agents (all backed by GeminiTextSkill)
| Sub-Agent | Section ID | Responsibility |
|-----------|-----------|---------------|
| ExplainerSubAgent | `explanation` | Plain-language document summary + medications table |
| SafetySubAgent | `safety` | Drug interactions, dosage flags, safety level |
| DiagnosisSubAgent | `possible_causes` | Educational findings from document content |
| RemedySubAgent | `remedies` | General remedies, lifestyle tips, generic alternatives |

### Behavior Rules
1. **Never** include actual medical diagnoses
2. **Never** prescribe medications
3. Use plain language suitable for non-medical readers
4. If a sub-agent throws, log the error and use the static fallback dict
5. `safety_level` from SafetySubAgent maps directly to the section's `severity`

### Safety Level Mapping
| safety_level | section severity |
|-------------|-----------------|
| safe | success (green) |
| caution | warning (amber) |
| warning | warning (amber) |
| critical | danger (red) |

### Version
`1.0.0`

---

## BaseAgent Contract

All domain agents must implement:

```python
class BaseAgent(ABC):
    domain: str          # e.g. "medical"
    display_name: str    # e.g. "Medical Analysis"
    version: str         # e.g. "1.0.0"
    description: str

    @abstractmethod
    async def analyze(self, text: str) -> DomainResult: ...
```

## Adding a New Domain Agent

1. Create `backend/agents/<domain>/agent.py`
2. Define a class inheriting `BaseAgent` with `domain = "<domain>"`
3. Restart the server — `AgentRegistry` auto-discovers it
4. Register domain-specific UI components in `DynamicResultRenderer`
