'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';

interface RawTextViewerProps {
  text: string;
}

export default function RawTextViewer({ text }: RawTextViewerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="glass-card" style={{ overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '14px 20px',
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: 'var(--text-secondary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', fontWeight: 600 }}>
          <FileText size={14} />
          Raw Extracted Text ({text.length.toLocaleString()} chars)
        </div>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {open && (
        <div style={{
          padding: '0 20px 20px',
          maxHeight: 300,
          overflowY: 'auto',
        }}>
          <pre style={{
            fontFamily: 'monospace', fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            lineHeight: 1.7,
          }}>
            {text || '(no text extracted)'}
          </pre>
        </div>
      )}
    </div>
  );
}
