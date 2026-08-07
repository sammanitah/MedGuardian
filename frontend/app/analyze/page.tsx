'use client';
import { useState, useCallback } from 'react';
import { Zap, RotateCcw, Clock, Tag } from 'lucide-react';

import type { AnalysisReport, AnalysisStage } from '@/lib/types';
import { analyzeDocument, ApiError } from '@/lib/api';

import DropZone from '@/components/core/DropZone';
import DisclaimerBanner from '@/components/core/DisclaimerBanner';
import DynamicResultRenderer from '@/components/core/DynamicResultRenderer';
import RawTextViewer from '@/components/core/RawTextViewer';
import LoadingOverlay from '@/components/core/LoadingOverlay';

export default function AnalysePage() {
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<AnalysisStage>('idle');
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((f: File | null) => {
    setFile(f);
    if (!f) {
      setReport(null);
      setStage('idle');
      setError(null);
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!file) return;

    // Trigger particles towards logo from click location
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('medguardian:analyze-click', {
          detail: { x: e.clientX, y: e.clientY },
        })
      );
    }

    setError(null);
    setReport(null);

    try {
      // Transition into full-screen AI loading experience
      setStage('uploading');
      await new Promise(r => setTimeout(r, 700));
      setStage('extracting');
      await new Promise(r => setTimeout(r, 600));
      setStage('analyzing');

      const result = await analyzeDocument(file, 'medical');
      setReport(result);
      setStage('done');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Analysis failed. Please try again.';
      setError(msg);
      setStage('error');
    }
  }, [file]);

  const handleReset = useCallback(() => {
    setFile(null);
    setReport(null);
    setStage('idle');
    setError(null);
  }, []);

  const isLoading = stage === 'uploading' || stage === 'extracting' || stage === 'analyzing';

  return (
    <main style={{ padding: '48px 24px 80px' }}>
      {/* Full-screen space loading experience */}
      <LoadingOverlay stage={stage} filename={file?.name} />

      <div className="container" style={{ maxWidth: 860 }}>
        {/* Page header */}
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(1.8rem,4vw,2.5rem)', marginBottom: 12 }}>
            Analyse Your <span className="gradient-text">Medical Document</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: 560, margin: '0 auto' }}>
            Upload a prescription, lab report, or medical image.
            Our AI multi-agent system will explain it, check safety, and suggest remedies.
          </p>
        </div>

        {/* Upload card */}
        <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
          <DropZone onFile={handleFile} file={file} disabled={isLoading} />

          <div style={{ marginTop: 20, display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            {report && (
              <button className="btn btn-secondary" onClick={handleReset} id="reset-btn">
                <RotateCcw size={14} /> New Analysis
              </button>
            )}
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={!file || isLoading}
              id="analyze-btn"
            >
              <Zap size={14} />
              Analyse Document
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            padding: '14px 20px', borderRadius: 'var(--radius-md)',
            background: 'var(--severity-danger-bg)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: 'var(--severity-danger)',
            marginBottom: 24,
          }}>
            ✕ {error}
          </div>
        )}

        {/* Analysis Report Results */}
        {report && (
          <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Report header meta card */}
            <div className="glass-card" style={{ padding: '16px 24px' }}>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ fontSize: '1.1rem', marginBottom: 4 }}>{report.display_name}</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{report.filename}</p>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    <Clock size={12} />
                    {report.processing_time_ms} ms
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <Tag size={12} color="var(--accent-indigo)" />
                    <span className="tag">{report.domain}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer — always visible */}
            <DisclaimerBanner text={report.disclaimer} />

            {/* Domain sections */}
            <DynamicResultRenderer sections={report.sections} />

            {/* Raw text (collapsible) */}
            <RawTextViewer text={report.raw_text} />

            {/* Session ID */}
            <div style={{ textAlign: 'right', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Session: {report.session_id}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
