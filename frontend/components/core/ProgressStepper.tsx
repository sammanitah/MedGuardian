'use client';
import { Check } from 'lucide-react';
import type { AnalysisStage } from '@/lib/types';

interface Step {
  id: AnalysisStage;
  label: string;
  description: string;
}

const STEPS: Step[] = [
  { id: 'uploading',  label: 'Upload',    description: 'Sending file to server' },
  { id: 'extracting', label: 'Extract',   description: 'Reading document text' },
  { id: 'analyzing',  label: 'Analyse',   description: 'AI agents running' },
  { id: 'done',       label: 'Complete',  description: 'Analysis ready' },
];

const STAGE_ORDER: Record<AnalysisStage, number> = {
  idle: -1, uploading: 0, extracting: 1, analyzing: 2, done: 3, error: -1,
};

interface ProgressStepperProps {
  stage: AnalysisStage;
}

export default function ProgressStepper({ stage }: ProgressStepperProps) {
  if (stage === 'idle') return null;

  const currentIdx = STAGE_ORDER[stage] ?? -1;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 0, padding: '24px 0',
    }}>
      {STEPS.map((step, i) => {
        const stepIdx = STAGE_ORDER[step.id];
        const isDone = currentIdx > stepIdx;
        const isActive = currentIdx === stepIdx;
        const isPending = currentIdx < stepIdx;

        return (
          <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
            {/* Step node */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div className={`step-dot ${isDone ? 'done' : isActive ? 'active' : 'pending'}`}>
                {isDone ? <Check size={14} /> : <span>{i + 1}</span>}
              </div>
              <div style={{ textAlign: 'center', minWidth: 80 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: isActive ? 'var(--text-primary)' : isDone ? 'var(--severity-success)' : 'var(--text-muted)' }}>
                  {step.label}
                </div>
                {isActive && (
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {step.description}
                  </div>
                )}
              </div>
            </div>

            {/* Connector */}
            {i < STEPS.length - 1 && (
              <div style={{
                width: 60, height: 2, margin: '-18px 4px 0',
                background: isDone ? 'var(--severity-success)' : 'var(--border)',
                transition: 'var(--transition-slow)',
                flexShrink: 0,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
