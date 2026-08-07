'use client';
import { AlertTriangle } from 'lucide-react';

interface DisclaimerBannerProps {
  text: string;
}

export default function DisclaimerBanner({ text }: DisclaimerBannerProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '14px 20px',
      borderRadius: 'var(--radius-md)',
      background: 'rgba(245,158,11,0.08)',
      border: '1px solid rgba(245,158,11,0.3)',
      color: '#d97706',
      fontSize: '0.85rem',
      lineHeight: 1.7,
    }}>
      <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
      <span>{text}</span>
    </div>
  );
}
