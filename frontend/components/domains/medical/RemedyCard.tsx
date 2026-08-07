import type { AnalysisSection, RemedyContent, GenericAlternative } from '@/lib/types';
import { Heart, Leaf, Pill, Activity, AlertCircle } from 'lucide-react';

interface RemedyCardProps { section: AnalysisSection; }

export default function RemedyCard({ section }: RemedyCardProps) {
  const data = section.content as unknown as RemedyContent;

  return (
    <div className="glass-card section-card severity-tip">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--severity-tip-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Heart size={20} color="var(--severity-tip)" />
        </div>
        <h3>{section.title}</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        {/* General remedies */}
        {data.general_remedies && data.general_remedies.length > 0 && (
          <div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 10 }}>
              <Leaf size={13} color="var(--severity-success)" />
              <h4 style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>General Remedies</h4>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {data.general_remedies.map((r, i) => (
                <li key={i} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', gap: 8 }}>
                  <span style={{ color: 'var(--severity-success)' }}>✓</span>{r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Lifestyle tips */}
        {data.lifestyle_tips && data.lifestyle_tips.length > 0 && (
          <div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 10 }}>
              <Activity size={13} color="var(--accent-violet)" />
              <h4 style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Lifestyle Tips</h4>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {data.lifestyle_tips.map((t, i) => (
                <li key={i} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', gap: 8 }}>
                  <span style={{ color: 'var(--accent-violet)' }}>→</span>{t}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* When to seek care */}
        {data.when_to_seek_care && data.when_to_seek_care.length > 0 && (
          <div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 10 }}>
              <AlertCircle size={13} color="var(--severity-warning)" />
              <h4 style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>When to Seek Care</h4>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {data.when_to_seek_care.map((w, i) => (
                <li key={i} style={{ fontSize: '0.875rem', color: 'var(--severity-warning)', display: 'flex', gap: 8 }}>⚠ {w}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Generic alternatives */}
      {data.generic_alternatives && data.generic_alternatives.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 10 }}>
            <Pill size={13} color="var(--severity-info)" />
            <h4 style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Generic Alternatives</h4>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead><tr><th>Brand Name</th><th>Generic (INN)</th><th>Note</th></tr></thead>
              <tbody>
                {data.generic_alternatives.map((alt: GenericAlternative, i: number) => (
                  <tr key={i}>
                    <td style={{ color: 'var(--text-secondary)' }}>{alt.brand_name || '—'}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-accent)' }}>{alt.generic_name || '—'}</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{alt.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      {data.disclaimer && (
        <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 8, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {data.disclaimer}
        </div>
      )}
    </div>
  );
}
