import type { AnalysisSection, SeverityLevel } from '@/lib/types';

const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  info: 'var(--severity-info)',
  success: 'var(--severity-success)',
  warning: 'var(--severity-warning)',
  danger: 'var(--severity-danger)',
  tip: 'var(--severity-tip)',
};

interface SectionCardProps {
  section: AnalysisSection;
}

/** Generic fallback renderer for any AnalysisSection. */
export default function SectionCard({ section }: SectionCardProps) {
  const color = SEVERITY_COLORS[section.severity];

  return (
    <div
      className="glass-card section-card"
      style={{ borderLeftColor: color }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: `${color}20`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1rem',
        }}>
          📄
        </div>
        <div>
          <h3 style={{ fontSize: '1rem', marginBottom: 2 }}>{section.title}</h3>
          <span className={`severity-badge severity-${section.severity}`}>{section.severity}</span>
        </div>
      </div>
      <pre style={{
        fontFamily: 'monospace', fontSize: '0.78rem',
        color: 'var(--text-secondary)', whiteSpace: 'pre-wrap',
        background: 'rgba(0,0,0,0.2)', padding: 12,
        borderRadius: 8, overflowX: 'auto',
      }}>
        {JSON.stringify(section.content, null, 2)}
      </pre>
    </div>
  );
}
