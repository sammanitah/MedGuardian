'use client';
import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  twinkleSpeed: number;
  vx: number;
  vy: number;
  highlightEndTime?: number;
}

interface Constellation {
  stars: Star[];
  progress: number; // 0 -> 1 (fade in), 1 -> 2 (hold), 2 -> 3 (fade out)
  duration: number;
}

interface Particle {
  x: number;
  y: number;
  targetX?: number;
  targetY?: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  maxLife: number;
  life: number;
  color: string;
}

export default function StarfieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

    // Create stars
    const STAR_COUNT = Math.floor(Math.min(width, height) / 12);
    const stars: Star[] = Array.from({ length: STAR_COUNT }, () => {
      const alpha = 0.15 + Math.random() * 0.45;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 0.8 + Math.random() * 1.4,
        baseAlpha: alpha,
        alpha: alpha,
        twinkleSpeed: 0.005 + Math.random() * 0.015,
        vx: (Math.random() - 0.5) * 0.1,
        vy: (Math.random() - 0.5) * 0.1,
      };
    });

    const constellations: Constellation[] = [];
    const particles: Particle[] = [];

    // Helper to spawn a procedural constellation
    const spawnConstellation = () => {
      if (constellations.length >= 3) return;
      const count = 3 + Math.floor(Math.random() * 3); // 3 to 5 stars
      const centerStar = stars[Math.floor(Math.random() * stars.length)];
      if (!centerStar) return;

      // Find nearby stars within 220px
      const nearby = stars
        .filter(s => s !== centerStar)
        .map(s => ({ star: s, dist: Math.hypot(s.x - centerStar.x, s.y - centerStar.y) }))
        .filter(item => item.dist > 30 && item.dist < 220)
        .sort((a, b) => a.dist - b.dist)
        .slice(0, count - 1)
        .map(item => item.star);

      if (nearby.length >= 2) {
        constellations.push({
          stars: [centerStar, ...nearby],
          progress: 0,
          duration: 3 + Math.random() * 2, // total lifetime seconds
        });
      }
    };

    // Periodically spawn constellations
    const constellationTimer = setInterval(spawnConstellation, 2500);

    // Event handler for logo hover: brighten top-left stars and emit particles
    const handleLogoHover = () => {
      // Top-left area coordinates
      const logoX = 90;
      const logoY = 32;

      // Brighten nearby stars
      stars.forEach(s => {
        const d = Math.hypot(s.x - logoX, s.y - logoY);
        if (d < 300) {
          s.highlightEndTime = Date.now() + 900;
        }
      });

      // Emit tiny drifting outward particles
      for (let i = 0; i < 14; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.5 + Math.random() * 1.5;
        particles.push({
          x: logoX + (Math.random() - 0.5) * 40,
          y: logoY + (Math.random() - 0.5) * 20,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 1 + Math.random() * 1.5,
          alpha: 0.9,
          maxLife: 45 + Math.random() * 25,
          life: 0,
          color: Math.random() > 0.4 ? '#a78bfa' : '#6366f1',
        });
      }
    };

    // Event handler for Analyze button click: particles stream toward logo!
    const handleAnalyzeClick = (e: Event) => {
      const customEvent = e as CustomEvent<{ x?: number; y?: number }>;
      const startX = customEvent.detail?.x ?? width / 2;
      const startY = customEvent.detail?.y ?? height / 2;
      const targetX = 90;
      const targetY = 32;

      for (let i = 0; i < 24; i++) {
        particles.push({
          x: startX + (Math.random() - 0.5) * 40,
          y: startY + (Math.random() - 0.5) * 40,
          targetX,
          targetY,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          radius: 1.2 + Math.random() * 1.8,
          alpha: 1.0,
          maxLife: 35,
          life: 0,
          color: '#a78bfa',
        });
      }
    };

    window.addEventListener('medguardian:logo-hover', handleLogoHover);
    window.addEventListener('medguardian:analyze-click', handleAnalyzeClick);

    // Animation Loop
    let lastTime = performance.now();

    const loop = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      // 1. Render Stars
      stars.forEach(s => {
        // Drifting
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < 0) s.x = width;
        if (s.x > width) s.x = 0;
        if (s.y < 0) s.y = height;
        if (s.y > height) s.y = 0;

        // Twinkle
        s.alpha += Math.sin(now * s.twinkleSpeed) * 0.003;
        let currentAlpha = Math.max(0.1, Math.min(0.85, s.alpha));

        // Highlight boost
        if (s.highlightEndTime && s.highlightEndTime > Date.now()) {
          currentAlpha = Math.min(1.0, currentAlpha + 0.5);
        }

        ctx.fillStyle = `rgba(224, 231, 255, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Render Constellations
      for (let i = constellations.length - 1; i >= 0; i--) {
        const c = constellations[i];
        c.progress += delta / (c.duration / 3); // 3 stages: in, hold, out

        let lineAlpha = 0;
        if (c.progress < 1) {
          lineAlpha = c.progress * 0.35; // Fade in
        } else if (c.progress < 2) {
          lineAlpha = 0.35; // Hold
        } else if (c.progress < 3) {
          lineAlpha = (3 - c.progress) * 0.35; // Fade out
        } else {
          constellations.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = `rgba(167, 139, 250, ${lineAlpha})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        for (let j = 0; j < c.stars.length - 1; j++) {
          ctx.moveTo(c.stars[j].x, c.stars[j].y);
          ctx.lineTo(c.stars[j + 1].x, c.stars[j + 1].y);
        }
        ctx.stroke();

        // Subtle glow on constellation nodes
        c.stars.forEach(s => {
          ctx.fillStyle = `rgba(196, 181, 253, ${lineAlpha * 1.5})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius + 1, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 3. Render Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;

        if (p.targetX !== undefined && p.targetY !== undefined) {
          // Suction towards target (Logo)
          const dx = p.targetX - p.x;
          const dy = p.targetY - p.y;
          p.x += dx * 0.12;
          p.y += dy * 0.12;
        } else {
          p.x += p.vx;
          p.y += p.vy;
        }

        const lifeRatio = p.life / p.maxLife;
        const currentAlpha = p.alpha * (1 - lifeRatio);

        if (p.life >= p.maxLife || currentAlpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = currentAlpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(constellationTimer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('medguardian:logo-hover', handleLogoHover);
      window.removeEventListener('medguardian:analyze-click', handleAnalyzeClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
