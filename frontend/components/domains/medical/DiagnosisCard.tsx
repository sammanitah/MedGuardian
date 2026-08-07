import type { AnalysisSection, DiagnosisContent, PossibleCondition, LabAbnormality } from '@/lib/types';
import { Microscope, Info } from 'lucide-react';

interface DiagnosisCardProps { section: AnalysisSection; }

const CONFIDENCE_COLORS: Record<string, string> = {
  mentioned: 'var(--severity-info)',
  implied:   'var(--severity-warning)',
  possible:  'var(--text-muted)',
};

export default function DiagnosisCard({ section }: DiagnosisCardProps) {
  const data = section.content as unknown as DiagnosisContent;

  return (
    <div className="glass-card section-card severity-info">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Microscope size={20} color="var(--severity-info)" />
        </div>
        <h3>{section.title}</h3>
      </div>

      {/* Educational disclaimer */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '10px 14px', borderRadius: 8, background: 'rgba(99,102,241,0.08)', border: '1px solid var(--border)', marginBottom: 20 }}>
        <Info size={14} color="var(--accent-indigo)" style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--text-accent)' }}>Educational only.</strong> The following are conditions or findings present in or implied by the document — not a medical diagnosis.
        </p>
      </div>

      {/* Context */}
      {data.document_context && (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 20, lineHeight: 1.7 }}>{data.document_context}</p>
      )}

      {/* Conditions */}
      {data.possible_conditions && data.possible_conditions.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h4 style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 10 }}>Conditions / Findings</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.possible_conditions.map((c: PossibleCondition, i: number) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 14px', borderRadius: 8, background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)' }}>
                <div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.condition}</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: `${CONFIDENCE_COLORS[c.confidence] ?? 'var(--text-muted)'}20`, color: CONFIDENCE_COLORS[c.confidence] ?? 'var(--text-muted)' }}>
                      {c.confidence}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{c.relevance}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lab abnormalities */}
      {data.lab_abnormalities && data.lab_abnormalities.length > 0 && (
        <div>
          <h4 style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 10 }}>Lab Values</h4>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>Test</th><th>Value</th><th>Normal Range</th><th>Interpretation</th></tr>
              </thead>
              <tbody>
                {data.lab_abnormalities.map((lab: LabAbnormality, i: number) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{lab.test || '—'}</td>
                    <td style={{ color: 'var(--accent-purple)' }}>{lab.value || '—'}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{lab.normal_range || '—'}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{lab.interpretation || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
