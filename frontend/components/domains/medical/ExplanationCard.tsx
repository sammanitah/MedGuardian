import type { AnalysisSection, ExplanationContent, Medication } from '@/lib/types';
import { FileText, Pill, AlertCircle } from 'lucide-react';

interface ExplanationCardProps {
  section: AnalysisSection;
}

export default function ExplanationCard({ section }: ExplanationCardProps) {
  const data = section.content as unknown as ExplanationContent;

  return (
    <div className="glass-card section-card severity-info">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--severity-info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FileText size={20} color="var(--severity-info)" />
        </div>
        <div>
          <h3 style={{ marginBottom: 4 }}>{section.title}</h3>
          {data.document_type && (
            <span className="tag">{data.document_type}</span>
          )}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 20, background: 'rgba(59,130,246,0.06)', padding: '12px 16px', borderRadius: 8 }}>
          {data.summary}
        </p>
      )}

      {/* Medications */}
      {data.medications && data.medications.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <Pill size={14} color="var(--severity-info)" />
            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Medications</h4>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  <th>Purpose</th>
                </tr>
              </thead>
              <tbody>
                {data.medications.map((med: Medication, i: number) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: 'var(--text-accent)' }}>{med.name || '—'}</td>
                    <td>{med.dosage || '—'}</td>
                    <td>{med.frequency || '—'}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{med.purpose || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Key findings */}
      {data.key_findings && data.key_findings.length > 0 && (
        <div style={{ marginBottom: data.important_notes?.length ? 20 : 0 }}>
          <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: 10 }}>Key Findings</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {data.key_findings.map((f, i) => (
              <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--severity-info)', marginTop: 3 }}>•</span>{f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Important notes */}
      {data.important_notes && data.important_notes.length > 0 && (
        <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 8, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
            <AlertCircle size={13} color="var(--severity-info)" />
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--severity-info)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Important Notes</span>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {data.important_notes.map((n, i) => (
              <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>• {n}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
