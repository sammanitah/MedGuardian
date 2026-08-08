# Med Guardian 🛡️

> AI-powered multi-agent medical document analysis — ADLC Hackathon Project

[![CI](https://github.com/your-org/MedGuardian/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/MedGuardian/actions/workflows/ci.yml)

## What It Does

Upload a **prescription**, **lab report**, or **medical image** and get:

| Feature | Description |
|---------|-------------|
| 📄 **Plain language explanation** | Medical jargon → simple English |
| 🛡️ **Safety analysis** | Drug interactions and safety flags |
| 🔬 **Findings analysis** | Lab values and possible causes |
| 💚 **Remedies & alternatives** | General remedies, generic medicines |

> ⚠️ **This is educational only.** Med Guardian does not provide medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional.

---

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full system diagram, data flow, and extension guide.

**Quick summary:**
```
Upload → IngestionAgent → ExtractionAgent → MedicalAnalysisAgent → AnalysisReport
                              │                      │
                         (4 Skills)          (4 sub-agents, concurrent)
```

**Adding a new domain:** Drop a file in `backend/agents/<domain>/agent.py`. Zero other changes required.

---

## Project Structure

```
MedGuardian/
├── backend/
│   ├── core/
│   │   ├── base_agent.py          # Domain agent contract
│   │   ├── base_skill.py          # Skill contract
│   │   ├── schemas.py             # Pydantic schemas
│   │   ├── orchestrator.py        # Pipeline coordinator
│   │   ├── agent_registry.py      # Auto-discovery
│   │   ├── gemini_client.py       # Gemini API wrapper
│   │   ├── pipeline/
│   │   │   ├── ingestion_agent.py
│   │   │   └── extraction_agent.py
│   │   └── skills/
│   │       ├── gemini_vision_skill.py    # Custom Skill 1
│   │       ├── gemini_text_skill.py      # Custom Skill 2
│   │       ├── pdf_text_skill.py         # Custom Skill 3
│   │       └── text_normalization_skill.py # Custom Skill 4
│   ├── agents/
│   │   └── medical/               # Custom Domain Agent
│   │       ├── agent.py           # MedicalAnalysisAgent
│   │       ├── prompts.py
│   │       └── sub_agents/
│   │           ├── explainer.py
│   │           ├── safety.py
│   │           ├── diagnosis.py
│   │           └── remedy.py
│   ├── api/
│   │   └── routes/
│   │       ├── analyze.py         # POST /api/v1/analyze
│   │       └── registry.py        # GET /api/v1/agents
│   ├── tests/                     # pytest test suite
│   ├── main.py                    # FastAPI app entry point
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx               # Landing page
│   │   └── analyze/page.tsx       # Analysis page
│   ├── components/
│   │   ├── core/                  # Domain-agnostic components
│   │   └── domains/medical/       # Medical-specific components
│   ├── lib/
│   │   ├── api.ts                 # API client
│   │   └── types.ts               # TypeScript types
│   └── styles/globals.css
├── .github/workflows/ci.yml
├── ARCHITECTURE.md
├── AGENTS.md
├── AGENTS_AND_SKILLS.md
└── README.md
```

---

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- A [Gemini API key](https://aistudio.google.com/app/apikey) (free)

### 1. Clone & configure

```bash
git clone https://github.com/your-org/MedGuardian.git
cd MedGuardian
cp .env.example .env
# Edit .env → set GEMINI_API_KEY=your_key_here
```

### 2. Backend

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

API available at: http://localhost:8000 (Production: https://medguardian-backend-eja3.onrender.com)  
Swagger UI: http://localhost:8000/docs (Production: https://medguardian-backend-eja3.onrender.com/docs)

### 3. Frontend

```bash
cd frontend
npm install
# Create frontend/.env.local with:
echo "NEXT_PUBLIC_API_URL=https://medguardian-backend-eja3.onrender.com" > .env.local
npm run dev
```

Frontend available at: http://localhost:3000

---

## Running Tests

```bash
# From the project root
pip install -r backend/requirements.txt
pytest backend/tests/ -v
```

---

## Hackathon Compliance

| Checkpoint | Deliverable |
|-----------|------------|
| ✅ ARCHITECTURE.md | [ARCHITECTURE.md](ARCHITECTURE.md) |
| ✅ AGENTS.md | [AGENTS.md](AGENTS.md) |
| ✅ AGENTS_AND_SKILLS.md | [AGENTS_AND_SKILLS.md](AGENTS_AND_SKILLS.md) |
| ✅ Custom AI Agent | `MedicalAnalysisAgent` — `backend/agents/medical/agent.py` |
| ✅ Custom AI Skill | 4 skills in `backend/core/skills/` |
| ✅ Working application | FastAPI + Next.js |
| ✅ GitHub Actions CI/CD | `.github/workflows/ci.yml` |
| ✅ Automated tests | `backend/tests/` |
| ✅ Clean modular architecture | Plugin-based, zero changes to add domains |
| ✅ README with setup | This file |

---

## Tech Stack

- **Frontend:** Next.js 14 (App Router), Vanilla CSS, Lucide React
- **Backend:** FastAPI, Python 3.11+, Pydantic v2
- **AI:** Google Gemini Flash Latest (free tier)
- **PDF:** pdfplumber + PyMuPDF
- **Tests:** pytest + pytest-asyncio
- **CI:** GitHub Actions

---

## License

MIT — free to use, modify, and distribute.
