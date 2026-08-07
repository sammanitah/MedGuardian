import Link from 'next/link';
import {
  FileText, Shield, Brain, Heart, Zap, Lock, ArrowRight, Microscope, Sparkles,
} from 'lucide-react';

const features = [
  { icon: FileText, title: 'OCR & PDF Support', desc: 'Upload prescriptions, lab reports, or scanned images — we extract and understand them all.', color: 'var(--severity-info)' },
  { icon: Shield, title: 'Safety Analysis', desc: 'Automatic drug interaction and safety flag detection powered by Gemini AI.', color: 'var(--severity-success)' },
  { icon: Brain, title: 'Plain Language', desc: 'Medical jargon translated into clear, simple English anyone can understand.', color: 'var(--accent-violet)' },
  { icon: Microscope, title: 'Findings Analysis', desc: 'Lab values and possible causes explained in educational, non-diagnostic terms.', color: 'var(--severity-warning)' },
  { icon: Heart, title: 'Remedy Suggestions', desc: 'General remedies, lifestyle tips, and generic medicine alternatives.', color: 'var(--severity-danger)' },
  { icon: Lock, title: 'Privacy First', desc: 'Stateless processing. No data stored. Files processed and discarded immediately.', color: 'var(--severity-tip)' },
];

export default function LandingPage() {
  return (
    <main>
      {/* ── Hero ── */}
      <section style={{ padding: '80px 24px 80px', textAlign: 'center' }}>
        <div className="container animate-fade-up">
          {/* Main Logo Display */}
          <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
            <img
              src="/logo.png"
              alt="MedGuardian"
              style={{
                height: 90,
                width: 'auto',
                filter: 'drop-shadow(0 0 25px rgba(167, 139, 250, 0.8)) drop-shadow(0 0 45px rgba(99, 102, 241, 0.5))',
                animation: 'brand-glow-pulse 4s ease-in-out infinite',
              }}
            />
          </div>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 20,
            background: 'rgba(99,102,241,0.12)',
            border: '1px solid var(--border-bright)',
            color: 'var(--text-accent)',
            fontSize: '0.8rem', fontWeight: 600,
            marginBottom: 32, letterSpacing: '0.05em',
          }}>
            <Sparkles size={12} />
            Powered by Google Gemini · Multi-Agent Architecture
          </div>

          <h1 style={{ marginBottom: 24 }}>
            Understand Your
            <br />
            <span className="brand-text" style={{ fontSize: 'inherit' }}>Medical Documents</span>
            <br />
            in Seconds
          </h1>

          <p style={{
            fontSize: '1.2rem', color: 'var(--text-secondary)',
            maxWidth: 600, margin: '0 auto 48px',
            lineHeight: 1.8,
          }}>
            Upload any prescription, lab report, or medical document.
            Our AI multi-agent system explains it in plain language,
            checks safety, and suggests remedies — all for free.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/analyze" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
              <Zap size={18} />
              Analyse Now — It&apos;s Free
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 48, justifyContent: 'center', marginTop: 64, flexWrap: 'wrap' }}>
            {[
              { value: '4', label: 'AI Agents' },
              { value: '4', label: 'Custom Skills' },
              { value: '0', label: 'Data Stored' },
              { value: '100%', label: 'Free' },
            ].map(({ value, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div className="gradient-text" style={{ fontSize: '2rem', fontWeight: 800 }}>{value}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '40px 24px 100px' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: 16 }}>
            Everything You Need to <span className="gradient-text">Understand Your Health</span>
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 56, maxWidth: 500, margin: '0 auto 56px' }}>
            Six powerful features working together through a modular multi-agent architecture.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            {features.map(({ icon: Icon, title, desc, color }, i) => (
              <div
                key={title}
                className={`glass-card animate-fade-up stagger-${Math.min(i + 1, 4)}`}
                style={{ padding: 28 }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: `${color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <Icon size={22} color={color} />
                </div>
                <h3 style={{ marginBottom: 8 }}>{title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Disclaimer ── */}
      <section style={{ padding: '0 24px 80px' }}>
        <div className="container">
          <div style={{
            padding: '20px 28px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.25)',
            color: 'var(--severity-warning)',
            fontSize: '0.875rem',
            lineHeight: 1.7,
            textAlign: 'center',
          }}>
            ⚠️ <strong>Medical Disclaimer:</strong> Med Guardian is for educational purposes only.
            It does not provide medical advice, diagnosis, or treatment.
            Always consult a qualified healthcare professional before making any medical decisions.
          </div>
        </div>
      </section>
    </main>
  );
}
