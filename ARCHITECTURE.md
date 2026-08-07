# Med Guardian — Architecture

## Overview

Med Guardian is an AI-powered multi-agent web application for medical document analysis. It uses a **plugin-based, domain-agnostic pipeline** so new analysis domains can be added without modifying core infrastructure.

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Med Guardian System                             │
│                                                                     │
│  ┌──────────┐    ┌──────────────────────────────────────────────┐  │
│  │ Next.js  │    │         FastAPI Backend                      │  │
│  │ Frontend │◄──►│                                              │  │
│  │          │    │  ┌────────────┐    ┌──────────────────────┐  │  │
│  │ Upload   │    │  │Orchestrator│───►│   AgentRegistry      │  │  │
│  │ Display  │    │  └─────┬──────┘    │ (auto-discovers)     │  │  │
│  │ Sections │    │        │           └──────────────────────┘  │  │
│  └──────────┘    │  ┌─────▼──────┐                              │  │
│                  │  │IngestionAgt│  (validate + store file)     │  │
│                  │  └─────┬──────┘                              │  │
│                  │        │                                      │  │
│                  │  ┌─────▼──────┐                              │  │
│                  │  │Extraction  │  (OCR/PDF → clean text)      │  │
│                  │  │   Agent    │                              │  │
│                  │  └─────┬──────┘                              │  │
│                  │        │                                      │  │
│                  │  ┌─────▼──────────────────────────────────┐  │  │
│                  │  │       Domain Agent Plugin               │  │  │
│                  │  │  (e.g. MedicalAnalysisAgent)            │  │  │
│                  │  │                                         │  │  │
│                  │  │  ┌──────────┐  ┌──────────┐            │  │  │
│                  │  │  │Explainer │  │  Safety  │ (parallel) │  │  │
│                  │  │  │SubAgent  │  │ SubAgent │            │  │  │
│                  │  │  └──────────┘  └──────────┘            │  │  │
│                  │  │  ┌──────────┐  ┌──────────┐            │  │  │
│                  │  │  │Diagnosis │  │  Remedy  │ (parallel) │  │  │
│                  │  │  │SubAgent  │  │ SubAgent │            │  │  │
│                  │  │  └──────────┘  └──────────┘            │  │  │
│                  │  └──────────────────────────────────────┘  │  │
│                  │        │                                      │  │
│                  │  ┌─────▼──────┐                              │  │
│                  │  │AnalysisRpt │  ← disclaimer injected here  │  │
│                  │  └────────────┘                              │  │
│                  └──────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────────┐                               │
│  │         Custom Skills           │                               │
│  │  GeminiVisionSkill  PDFTextSkill│                               │
│  │  GeminiTextSkill    TextNorm    │                               │
│  └─────────────────────────────────┘                               │
└─────────────────────────────────────────────────────────────────────┘
```

## Technology Stack

| Layer     | Technology | Version | Reason |
|-----------|-----------|---------|--------|
| Frontend  | Next.js (App Router) | 14.x | SSR, file-based routing |
| Styling   | Vanilla CSS + CSS custom properties | — | No Tailwind needed |
| Backend   | FastAPI | 0.111+ | Async, OpenAPI docs auto-generated |
| AI Engine | Google Gemini Flash Latest | — | Free tier, vision + text |
| PDF       | pdfplumber + PyMuPDF | — | Text-layer + scanned PDFs |
| Tests     | pytest + pytest-asyncio | — | Async test support |
| CI/CD     | GitHub Actions | — | Free, no secrets for lint/test |

## Data Flow

```
User uploads file
      │
      ▼
POST /api/v1/analyze (multipart/form-data)
      │
      ▼
Orchestrator.run()
      │
      ├─► IngestionAgent.ingest()  ──► validate MIME + size, write temp file
      │
      ├─► ExtractionAgent.extract()
      │       ├─► (image) GeminiVisionSkill.execute()
      │       ├─► (PDF)   PDFTextSkill.execute()
      │       └─► TextNormalizationSkill.execute()   ← always applied
      │
      ├─► AgentRegistry.get(domain)   ── auto-discovery at startup
      │
      ├─► DomainAgent.analyze(text)
      │       └─► asyncio.gather(4 sub-agents)   ← concurrent Gemini calls
      │
      └─► Wrap → AnalysisReport + inject DISCLAIMER
                        │
                        ▼
                  JSON response to frontend
                        │
                        ▼
              DynamicResultRenderer
              (routes section.id → domain component)
```

## Agent Flow

```
Orchestrator
├── IngestionAgent         (core/pipeline) — domain-agnostic
├── ExtractionAgent        (core/pipeline) — domain-agnostic
│       ├── GeminiVisionSkill    (image OCR)
│       ├── PDFTextSkill         (PDF text / scanned fallback)
│       └── TextNormalizationSkill
└── MedicalAnalysisAgent   (agents/medical) — domain plugin
        ├── ExplainerSubAgent  → GeminiTextSkill
        ├── SafetySubAgent     → GeminiTextSkill
        ├── DiagnosisSubAgent  → GeminiTextSkill
        └── RemedySubAgent     → GeminiTextSkill
```

## Extension Mechanism

To add a new domain (e.g. "legal"):

```
backend/
  agents/
    legal/
      __init__.py
      agent.py   ← class LegalAnalysisAgent(BaseAgent): domain = "legal"
```

**Zero changes** to Orchestrator, AgentRegistry, or any existing code. The registry auto-discovers the new agent at startup.

## Safety Guarantee

The Orchestrator is the **only** place that injects the medical disclaimer. Domain agents must NOT add one. This is enforced by:
1. The `DomainResult` schema has no `disclaimer` field.
2. Tests verify `DomainResult` has no disclaimer attribute.
3. The `AnalysisReport` schema requires `disclaimer` to be non-empty.

## Statelessness

No database. Every request is processed independently:
- File is validated → written to temp dir → read → deleted
- Results are generated per-request and returned to the caller
- No user data persists between requests
