/**
 * TypeScript types mirroring backend Pydantic schemas.
 * Keep in sync with backend/core/schemas.py
 */

export type SeverityLevel = 'info' | 'warning' | 'danger' | 'success' | 'tip';

export interface AnalysisSection {
  id: string;
  title: string;
  icon: string;
  severity: SeverityLevel;
  content: Record<string, unknown>;
  order: number;
}

export interface AnalysisReport {
  session_id: string;
  domain: string;
  display_name: string;
  filename: string;
  file_type: string;
  raw_text: string;
  sections: AnalysisSection[];
  disclaimer: string;
  processing_time_ms: number;
  timestamp: string;
}

export interface AgentInfo {
  domain: string;
  display_name: string;
  version: string;
  description: string;
}

// ── Medical domain content types ────────────────────────────────────────────

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  purpose: string;
}

export interface ExplanationContent {
  document_type: string;
  summary: string;
  medications: Medication[];
  key_findings: string[];
  important_notes: string[];
}

export interface SafetyFlag {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface SafetyContent {
  safety_level: 'safe' | 'caution' | 'warning' | 'critical';
  overall_assessment: string;
  flags: SafetyFlag[];
  warnings: string[];
  recommendations: string[];
}

export interface PossibleCondition {
  condition: string;
  relevance: string;
  confidence: 'mentioned' | 'implied' | 'possible';
}

export interface LabAbnormality {
  test: string;
  value: string;
  normal_range: string;
  interpretation: string;
}

export interface DiagnosisContent {
  document_context: string;
  possible_conditions: PossibleCondition[];
  lab_abnormalities: LabAbnormality[];
  key_indicators: string[];
  educational_note: string;
}

export interface GenericAlternative {
  brand_name: string;
  generic_name: string;
  note: string;
}

export interface RemedyContent {
  general_remedies: string[];
  lifestyle_tips: string[];
  generic_alternatives: GenericAlternative[];
  dietary_suggestions: string[];
  when_to_seek_care: string[];
  disclaimer: string;
}

// ── Analysis stage ───────────────────────────────────────────────────────────

export type AnalysisStage = 'idle' | 'uploading' | 'extracting' | 'analyzing' | 'done' | 'error';
