"""
Medical domain — all Gemini prompts in one place (single source of truth).

Rules for every prompt:
  - Instruct Gemini to return ONLY valid JSON
  - Never prescribe — describe only
  - Never use the word 'diagnosis' without an educational qualifier
  - Always keep language simple enough for a non-medical reader
"""

# ── System instruction shared by all medical sub-agents ────────────────────────
SYSTEM_MEDICAL = (
    "You are a medical document analysis assistant. "
    "Your role is to help patients understand their medical documents in simple terms. "
    "Rules you MUST follow:\n"
    "1. Return ONLY valid JSON — no markdown, no prose outside JSON.\n"
    "2. Use plain language that a non-medical person can understand.\n"
    "3. Never provide actual medical advice, prescriptions, or diagnoses.\n"
    "4. Be accurate and conservative — do not speculate beyond the document.\n"
    "5. If information is absent from the document, use empty arrays [] or empty strings."
)

# ── ExplainerSubAgent prompt ───────────────────────────────────────────────────
EXPLAINER_PROMPT = """Analyse this medical document and return a plain-language explanation.

Return ONLY this JSON (no extra text):
{
  "document_type": "e.g. Prescription / Lab Report / Discharge Summary",
  "summary": "2–3 sentence plain-English summary of the document",
  "medications": [
    {
      "name": "medication name",
      "dosage": "dosage info or empty string",
      "frequency": "how often or empty string",
      "purpose": "what it is prescribed for or empty string"
    }
  ],
  "key_findings": ["finding 1", "finding 2"],
  "important_notes": ["note 1", "note 2"]
}"""

# ── SafetySubAgent prompt ──────────────────────────────────────────────────────
SAFETY_PROMPT = """Analyse this medical document for potential drug safety concerns.

Return ONLY this JSON (no extra text):
{
  "safety_level": "safe | caution | warning | critical",
  "overall_assessment": "one sentence overview",
  "flags": [
    {
      "type": "interaction | dosage | allergy | contraindication | other",
      "description": "clear description of the concern",
      "severity": "low | medium | high"
    }
  ],
  "warnings": ["specific warning 1", "specific warning 2"],
  "recommendations": ["recommendation 1", "recommendation 2"]
}

safety_level key:
  safe     → no concerns found in the document
  caution  → minor concerns worth monitoring
  warning  → significant concerns that need attention
  critical → serious safety issues requiring immediate medical attention"""

# ── DiagnosisSubAgent prompt ───────────────────────────────────────────────────
DIAGNOSIS_PROMPT = """Based solely on this medical document, identify conditions, lab findings, or causes mentioned or implied.

IMPORTANT: This is educational only — NOT a diagnosis.

Return ONLY this JSON (no extra text):
{
  "document_context": "one sentence — what kind of document is this",
  "possible_conditions": [
    {
      "condition": "condition or finding name",
      "relevance": "why it appears relevant based on the document",
      "confidence": "mentioned | implied | possible"
    }
  ],
  "lab_abnormalities": [
    {
      "test": "test name",
      "value": "reported value",
      "normal_range": "if stated in document, else empty string",
      "interpretation": "brief plain-language meaning"
    }
  ],
  "key_indicators": ["indicator 1", "indicator 2"],
  "educational_note": "Always consult a qualified doctor for a proper diagnosis"
}"""

# ── RemedySubAgent prompt ──────────────────────────────────────────────────────
REMEDY_PROMPT = """Based on this medical document, suggest general remedies, lifestyle changes, and generic medicine equivalents.

IMPORTANT: These are general suggestions — NOT prescriptions. Always consult a doctor.

Return ONLY this JSON (no extra text):
{
  "general_remedies": ["remedy 1", "remedy 2"],
  "lifestyle_tips": ["tip 1", "tip 2"],
  "generic_alternatives": [
    {
      "brand_name": "brand name if mentioned",
      "generic_name": "generic / INN name",
      "note": "consult your pharmacist or doctor before switching"
    }
  ],
  "dietary_suggestions": ["suggestion 1"],
  "when_to_seek_care": ["seek care if ..."],
  "disclaimer": "These are general educational suggestions only. Consult your doctor before making any medical decisions."
}"""
