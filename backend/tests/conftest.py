"""
Pytest configuration and shared fixtures for Med Guardian tests.

Key design decisions:
  - GEMINI_API_KEY is set before any backend import so Settings() doesn't fail
  - mock_gemini_client patches GeminiClient without touching real API
  - sample_* fixtures provide reusable test data
"""
import json
import os

import pytest

# Must be set before any backend imports — Settings() reads env at import time
os.environ.setdefault("GEMINI_API_KEY", "test_key_for_ci")
os.environ.setdefault("UPLOAD_DIR", "/tmp/medguardian_test_uploads")

# ── Shared sample data ────────────────────────────────────────────────────────

SAMPLE_EXPLANATION = {
    "document_type": "Prescription",
    "summary": "A prescription for Amoxicillin to treat a bacterial infection.",
    "medications": [
        {
            "name": "Amoxicillin",
            "dosage": "500mg",
            "frequency": "3 times daily",
            "purpose": "Bacterial infection",
        }
    ],
    "key_findings": ["Bacterial infection diagnosed"],
    "important_notes": ["Complete the full 7-day course"],
}

SAMPLE_SAFETY = {
    "safety_level": "safe",
    "overall_assessment": "Medication appears safe for general use.",
    "flags": [],
    "warnings": [],
    "recommendations": ["Check for penicillin allergy before use"],
}

SAMPLE_DIAGNOSIS = {
    "document_context": "Prescription for bacterial infection",
    "possible_conditions": [
        {
            "condition": "Bacterial Infection",
            "relevance": "Antibiotic prescribed",
            "confidence": "mentioned",
        }
    ],
    "lab_abnormalities": [],
    "key_indicators": ["Antibiotic prescription"],
    "educational_note": "Always consult a qualified doctor for a proper diagnosis",
}

SAMPLE_REMEDY = {
    "general_remedies": ["Rest adequately", "Stay well hydrated"],
    "lifestyle_tips": ["Complete the full antibiotic course"],
    "generic_alternatives": [
        {
            "brand_name": "Amoxil",
            "generic_name": "Amoxicillin",
            "note": "Consult pharmacist before switching",
        }
    ],
    "dietary_suggestions": ["Eat probiotic-rich foods"],
    "when_to_seek_care": ["If symptoms worsen after 48 hours"],
    "disclaimer": "These are general suggestions. Consult your doctor.",
}

SAMPLE_TEXT = (
    "Patient: John Doe\n"
    "Date: 2024-01-01\n"
    "Rx: Amoxicillin 500mg — take 3 times daily for 7 days\n"
    "Dr. Jane Smith | Reg No: 12345"
)


# ── Fixtures ──────────────────────────────────────────────────────────────────


@pytest.fixture
def sample_text() -> str:
    return SAMPLE_TEXT


@pytest.fixture
def mock_gemini_client(mocker):
    """Mock GeminiClient to avoid real API calls in every test."""
    mock = mocker.MagicMock()
    mock.generate_text = mocker.AsyncMock(return_value=json.dumps(SAMPLE_EXPLANATION))
    mock.generate_from_image = mocker.AsyncMock(
        return_value="Extracted: Patient John Doe Rx Amoxicillin 500mg"
    )
    return mock
