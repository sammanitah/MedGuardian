import type { AnalysisSection, SafetyContent, SafetyFlag } from '@/lib/types';
import { ShieldCheck, ShieldAlert, ShieldX, Shield, AlertTriangle } from 'lucide-react';

interface SafetyPanelProps { section: AnalysisSection; }

const LEVEL_CONFIG = {
  safe:     { color: 'var(--severity-success)', bg: 'var(--severity-success-bg)', Icon: ShieldCheck, label: 'Safe' },
  caution:  { color: 'var(--severity-warning)', bg: 'var(--severity-warning-bg)', Icon: Shield,      label: 'Caution' },
  warning:  { color: 'var(--severity-warning)', bg: 'var(--severity-warning-bg)', Icon: ShieldAlert,  label: 'Warning' },
  critical: { color: 'var(--severity-danger)',  bg: 'var(--severity-danger-bg)',  Icon: ShieldX,      label: 'Critical' },
};

const FLAG_SEVERITY_COLOR: Record<string, string> = {
  low:    'var(--severity-info)',
  medium: 'var(--severity-warning)',
  high:   'var(--severity-danger)',
};

export default function SafetyPanel({ section }: SafetyPanelProps) {
  const data = section.content as unknown as SafetyContent;
  const level = data.safety_level ?? 'caution';
  const cfg = LEVEL_CONFIG[level] ?? LEVEL_CONFIG.caution;
  const { Icon } = cfg;

  return (
    <div className="glass-card section-card" style={{ borderLeftColor: cfg.color }}>
      {/* Header with safety level badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={20} color={cfg.color} />
          </div>
          <h3>{section.title}</h3>
        </div>
        <span className={`severity-badge severity-${section.severity}`} style={{ color: cfg.color, background: cfg.bg }}>
          {cfg.label}
        </span>
      </div>

      {/* Overall assessment */}
      {data.overall_assessment && (
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 20, padding: '12px 16px', background: `${cfg.color}08`, borderRadius: 8 }}>
          {data.overall_assessment}
        </p>
      )}

      {/* Flags */}
      {data.flags && data.flags.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h4 style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 10 }}>Safety Flags</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.flags.map((flag: SafetyFlag, i: number) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 14px', borderRadius: 8, background: `${FLAG_SEVERITY_COLOR[flag.severity] ?? cfg.color}10`, border: `1px solid ${FLAG_SEVERITY_COLOR[flag.severity] ?? cfg.color}25` }}>
                <AlertTriangle size={14} color={FLAG_SEVERITY_COLOR[flag.severity] ?? cfg.color} style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.8rem', color: FLAG_SEVERITY_COLOR[flag.severity] ?? cfg.color, textTransform: 'capitalize' }}>{flag.type}</span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 2 }}>{flag.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {data.warnings && data.warnings.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h4 style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8 }}>Warnings</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {data.warnings.map((w, i) => (
              <li key={i} style={{ fontSize: '0.875rem', color: 'var(--severity-warning)', display: 'flex', gap: 8 }}>⚠ {w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {data.recommendations && data.recommendations.length > 0 && (
        <div>
          <h4 style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8 }}>Recommendations</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {data.recommendations.map((r, i) => (
              <li key={i} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', gap: 8 }}>✓ {r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
