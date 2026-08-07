'use client';
import { useEffect, useRef, useState } from 'react';

export default function InitialAppLoader() {
  const [mounted, setMounted] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Check sessionStorage to show once per tab session
    const hasLoaded = sessionStorage.getItem('medguardian_intro_shown');
    if (hasLoaded) {
      setMounted(false);
      return;
    }

    // Auto fade out after 1.8 seconds
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setMounted(false);
        sessionStorage.setItem('medguardian_intro_shown', 'true');
      }, 600);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  // Procedural Constellation Intro Canvas
  useEffect(() => {
    if (!mounted || fadeOut) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const stars = Array.from({ length: 70 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 1 + Math.random() * 2,
      alpha: 0.2 + Math.random() * 0.7,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
    }));

    // Constellations centered near center screen
    const centerX = width / 2;
    const centerY = height / 2;

    const lines: Array<{ x1: number; y1: number; x2: number; y2: number; alpha: number }> = [];

    stars.forEach(s1 => {
      stars.forEach(s2 => {
        if (s1 !== s2) {
          const d = Math.hypot(s1.x - s2.x, s1.y - s2.y);
          if (d < 140 && Math.hypot(s1.x - centerX, s1.y - centerY) < 320) {
            lines.push({
              x1: s1.x,
              y1: s1.y,
              x2: s2.x,
              y2: s2.y,
              alpha: 0.15 + Math.random() * 0.35,
            });
          }
        }
      });
    });

    const loop = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw lines
      lines.forEach(l => {
        ctx.strokeStyle = `rgba(167, 139, 250, ${l.alpha})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(l.x1, l.y1);
        ctx.lineTo(l.x2, l.y2);
        ctx.stroke();
      });

      // Draw stars
      stars.forEach(s => {
        s.x += s.vx;
        s.y += s.vy;
        ctx.fillStyle = `rgba(224, 231, 255, ${s.alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animId);
  }, [mounted, fadeOut]);

  if (!mounted) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: '#070b14',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fadeOut ? 0 : 1,
        transform: fadeOut ? 'scale(1.04)' : 'scale(1)',
        pointerEvents: fadeOut ? 'none' : 'auto',
        transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
      }}
    >
      {/* Background Canvas */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

      {/* Central Nebula Glow */}
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, rgba(99,102,241,0.12) 50%, transparent 75%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      {/* Intro Branding Container */}
      <div
        className="animate-fade-up"
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Pulsing Logo */}
        <div style={{ marginBottom: 24, position: 'relative' }}>
          <img
            src="/logo.png"
            alt="MedGuardian Logo"
            style={{
              height: 96,
              width: 'auto',
              filter: 'drop-shadow(0 0 30px rgba(167, 139, 250, 0.9)) drop-shadow(0 0 60px rgba(99, 102, 241, 0.6))',
              animation: 'brand-glow-pulse 1.8s ease-in-out infinite',
            }}
          />
        </div>

        {/* Title */}
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em', color: '#ffffff' }}>
          Med<span className="gradient-text">Guardian</span>
        </h1>

        {/* Tagline */}
        <p style={{
          color: 'var(--text-accent)',
          fontSize: '0.95rem',
          fontWeight: 500,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 32,
        }}>
          AI Multi-Agent Medical Intelligence
        </p>

        {/* Subtitle pulse loader */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          <span className="animate-spin" style={{
            width: 14,
            height: 14,
            border: '2px solid rgba(167, 139, 250, 0.3)',
            borderTopColor: 'var(--accent-purple)',
            borderRadius: '50%',
            display: 'inline-block',
          }} />
          Initializing system...
        </div>
      </div>
    </div>
  );
}
