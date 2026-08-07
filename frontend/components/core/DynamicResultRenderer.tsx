/**
 * DynamicResultRenderer — domain-agnostic section router.
 *
 * Maps section.id → domain-specific component if registered.
 * Falls back to SectionCard for any unregistered section.
 *
 * Adding a new domain's components:
 *   1. Create components/domains/<domain>/YourCard.tsx
 *   2. Register it in SECTION_REGISTRY below
 *   3. Done — no other file changes needed
 */
import type { AnalysisSection } from '@/lib/types';
import SectionCard from './SectionCard';
import ExplanationCard from '@/components/domains/medical/ExplanationCard';
import SafetyPanel from '@/components/domains/medical/SafetyPanel';
import DiagnosisCard from '@/components/domains/medical/DiagnosisCard';
import RemedyCard from '@/components/domains/medical/RemedyCard';

type SectionComponent = React.ComponentType<{ section: AnalysisSection }>;

/** Registry: section.id → domain-specific component */
const SECTION_REGISTRY: Record<string, SectionComponent> = {
  explanation:    ExplanationCard,
  safety:         SafetyPanel,
  possible_causes: DiagnosisCard,
  remedies:       RemedyCard,
  // Future domains: add entries here without changing any other file
};

interface DynamicResultRendererProps {
  sections: AnalysisSection[];
}

export default function DynamicResultRenderer({ sections }: DynamicResultRendererProps) {
  const sorted = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {sorted.map((section) => {
        const Component = SECTION_REGISTRY[section.id] ?? SectionCard;
        return (
          <div key={section.id} className="animate-fade-up">
            <Component section={section} />
          </div>
        );
      })}
    </div>
  );
}
