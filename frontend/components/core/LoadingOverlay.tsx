'use client';
import { useEffect, useRef, useState } from 'react';
import type { AnalysisStage } from '@/lib/types';
import ProgressStepper from './ProgressStepper';

interface LoadingOverlayProps {
  stage: AnalysisStage;
  filename?: string;
}

const MEDICAL_QUOTES = [
  "Every prescription tells a story. AI helps you understand it.",
  "Turning medical complexity into human clarity.",
  "Your health deserves explanations, not confusion.",
  "Understanding medicine should never require a medical degree.",
  "Analyzing interactions. Protecting your health.",
  "Every report is translated into insights you can trust.",
  "AI that reads. Explains. Protects.",
  "Making healthcare information accessible to everyone.",
  "Knowledge is the first step toward better health.",
  "Helping you make informed healthcare decisions.",
];

export default function LoadingOverlay({ stage, filename }: LoadingOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [quote, setQuote] = useState<string>('');

  const active = stage === 'uploading' || stage === 'extracting' || stage === 'analyzing';

  // Select a random quote when analysis begins
  useEffect(() => {
    if (stage === 'uploading') {
      const idx = Math.floor(Math.random() * MEDICAL_QUOTES.length);
      setQuote(MEDICAL_QUOTES[idx]);
    }
  }, [stage]);

  // Procedural constellation background animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Stars
    const stars = Array.from({ length: 80 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 1 + Math.random() * 1.8,
      alpha: 0.2 + Math.random() * 0.7,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
    }));

    // Constellations
    interface ActiveConstellation {
      stars: typeof stars;
      alpha: number;
      fadeDir: number;
    }
    const constellations: ActiveConstellation[] = [];

    const spawnRapidConstellation = () => {
      if (!active || constellations.length >= 4) return;
      const count = 3 + Math.floor(Math.random() * 3);
      const start = stars[Math.floor(Math.random() * stars.length)];
      if (!start) return;

      const nearby = stars
        .filter(s => s !== start)
        .map(s => ({ star: s, d: Math.hypot(s.x - start.x, s.y - start.y) }))
        .filter(item => item.d > 20 && item.d < 200)
        .slice(0, count - 1)
        .map(item => item.star);

      if (nearby.length >= 2) {
        constellations.push({
          stars: [start, ...nearby],
          alpha: 0,
          fadeDir: 0.025,
        });
      }
    };

    const interval = setInterval(spawnRapidConstellation, 600);

    const loop = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw stars
      stars.forEach(s => {
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < 0) s.x = width;
        if (s.x > width) s.x = 0;
        if (s.y < 0) s.y = height;
        if (s.y > height) s.y = 0;

        ctx.fillStyle = `rgba(167, 139, 250, ${s.alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw active constellations
      for (let i = constellations.length - 1; i >= 0; i--) {
        const c = constellations[i];
        c.alpha += c.fadeDir;
        if (c.alpha >= 0.7) {
          c.fadeDir = -0.02;
        }
        if (c.alpha <= 0) {
          constellations.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = `rgba(167, 139, 250, ${c.alpha})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let j = 0; j < c.stars.length - 1; j++) {
          ctx.moveTo(c.stars[j].x, c.stars[j].y);
          ctx.lineTo(c.stars[j + 1].x, c.stars[j + 1].y);
        }
        ctx.stroke();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, [active]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#070b14',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        overflow: 'hidden',
        opacity: active ? 1 : 0,
        pointerEvents: active ? 'auto' : 'none',
        visibility: active ? 'visible' : 'hidden',
        transition: 'opacity 0.35s ease, visibility 0.35s ease',
      }}
    >
      {/* Background canvas */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      />

      {/* Purple nebula background glow */}
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, rgba(99,102,241,0.1) 45%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />

      {/* Main loading card */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: 600,
          width: '100%',
        }}
      >
        {/* Pulsing Logo */}
        <div style={{ marginBottom: 28, position: 'relative' }}>
          <img
            src="/logo.png"
            alt="MedGuardian"
            style={{
              height: 72,
              width: 'auto',
              filter: 'drop-shadow(0 0 20px rgba(167, 139, 250, 0.85)) drop-shadow(0 0 40px rgba(99, 102, 241, 0.55))',
              animation: 'brand-glow-pulse 2s ease-in-out infinite',
            }}
          />
        </div>

        {/* Brand Header */}
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8, color: '#f1f5f9' }}>
          Med<span className="gradient-text">Guardian</span> AI
        </h2>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 28 }}>
          {filename ? `Analyzing ${filename}` : 'Processing document with multi-agent intelligence'}
        </p>

        {/* Progress Stepper */}
        <div style={{ width: '100%', marginBottom: 32 }}>
          <ProgressStepper stage={stage} />
        </div>

        {/* Inspirational Quote Card */}
        {quote && (
          <div
            className="glass-card"
            style={{
              padding: '18px 24px',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(13, 20, 40, 0.85)',
              border: '1px solid rgba(139, 92, 246, 0.35)',
              boxShadow: '0 0 30px rgba(139, 92, 246, 0.2)',
              maxWidth: 520,
            }}
          >
            <p style={{
              fontSize: '0.95rem',
              color: '#e0e7ff',
              fontStyle: 'italic',
              lineHeight: 1.6,
              margin: 0,
            }}>
              &ldquo;{quote}&rdquo;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
