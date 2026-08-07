'use client';
import Link from 'next/link';
import { Zap } from 'lucide-react';
import { useCallback } from 'react';

export default function Navbar() {
  const handleLogoHover = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('medguardian:logo-hover'));
    }
  }, []);

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(7, 11, 20, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 64,
        }}
      >
        {/* Brand Logo & Name */}
        <Link
          href="/"
          className="brand-logo-container"
          onMouseEnter={handleLogoHover}
        >
          <img
            src="/logo.png"
            alt="MedGuardian Logo"
            className="brand-logo-img"
          />
          <span className="brand-text">MedGuardian</span>
        </Link>

        {/* Action button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link
            href="/analyze"
            className="btn btn-primary"
            style={{ padding: '8px 20px', fontSize: '0.85rem' }}
          >
            <Zap size={14} />
            Analyse Document
          </Link>
        </div>
      </div>
    </nav>
  );
}
