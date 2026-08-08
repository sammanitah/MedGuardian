'use client';
import { useCallback, useState } from 'react';
import { Upload, FileText, Image as ImageIcon, X } from 'lucide-react';

interface DropZoneProps {
  onFile: (file: File) => void;
  file: File | null;
  disabled?: boolean;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff', 'image/bmp', 'application/pdf'];
const MAX_MB = 15;

export default function DropZone({ onFile, file, disabled }: DropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback((f: File): string | null => {
    if (!ACCEPTED_TYPES.includes(f.type)) return `Unsupported file type: ${f.type}`;
    if (f.size > MAX_MB * 1024 * 1024) return `File too large (max ${MAX_MB} MB)`;
    return null;
  }, []);

  const handleFile = useCallback((f: File) => {
    const err = validate(f);
    if (err) { setError(err); return; }
    setError(null);
    onFile(f);
  }, [onFile, validate]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [disabled, handleFile]);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = '';
  }, [handleFile]);

  const isImage = file?.type.startsWith('image/');

  return (
    <div style={{ position: 'relative' }}>
      <label
        htmlFor="file-upload"
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 16, padding: 40,
          border: `2px dashed ${dragging ? 'var(--accent-indigo)' : file ? 'var(--severity-success)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-lg)',
          background: dragging
            ? 'rgba(99,102,241,0.08)'
            : file
            ? 'rgba(16,185,129,0.06)'
            : 'var(--bg-card)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'var(--transition)',
          minHeight: 200,
          backdropFilter: 'blur(12px)',
        }}
      >
        {file ? (
          <>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: 'rgba(16,185,129,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {isImage ? <ImageIcon size={28} color="var(--severity-success)" /> : <FileText size={28} color="var(--severity-success)" />}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{file.name}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                {(file.size / 1024).toFixed(1)} KB · {file.type}
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); onFile(null as unknown as File); setError(null); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '6px 14px', borderRadius: 8,
                background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
                color: 'var(--severity-danger)', cursor: 'pointer', fontSize: '0.8rem',
              }}
            >
              <X size={12} /> Remove
            </button>
          </>
        ) : (
          <>
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: 'var(--gradient-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid var(--border)',
            }}>
              <Upload size={28} color="var(--accent-indigo)" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                Drop your document here
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                or click to browse
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 8 }}>
                JPEG · PNG · WEBP · BMP · TIFF · PDF · Max {MAX_MB} MB
              </div>
            </div>
          </>
        )}
        <input
          id="file-upload"
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          onChange={onInputChange}
          disabled={disabled}
          style={{ display: 'none' }}
        />
      </label>

      {error && (
        <div style={{
          marginTop: 8, padding: '8px 14px',
          borderRadius: 8, background: 'var(--severity-danger-bg)',
          color: 'var(--severity-danger)', fontSize: '0.8rem',
          border: '1px solid rgba(239,68,68,0.2)',
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
