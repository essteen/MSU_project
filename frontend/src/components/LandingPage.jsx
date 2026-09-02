import React from 'react';

export default function LandingPage({ onLogin, onSignUp }) {
  return (
    <section className="landing-hero">
      <div className="landing-copy">
        <p className="eyebrow landing-fade" style={{ animationDelay: '0.05s' }}>Shared living, sorted</p>
        <h1 className="landing-fade" style={{ animationDelay: '0.2s' }}>Welcome to Homely</h1>
        <p className="landing-subtitle landing-fade" style={{ animationDelay: '0.4s' }}>
          Keep track of your household&apos;s wishlist, purchases, and shared expenses
          all in one place. Log in or create an account to get started.
        </p>
        <div className="landing-actions landing-fade" style={{ animationDelay: '0.6s' }}>
          <button type="button" className="auth-button primary" onClick={onSignUp}>
            Sign up
          </button>
          <button type="button" className="auth-button" onClick={onLogin}>
            Log in
          </button>
        </div>
      </div>

      <div className="landing-illustration landing-fade" style={{ animationDelay: '0.3s' }} aria-hidden="true">
        <svg viewBox="0 0 320 260" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="160" cy="235" rx="120" ry="14" fill="var(--color-shadow)" />
          <path d="M60 140 L160 60 L260 140 V220 H60 Z" fill="var(--color-ice)" stroke="var(--color-midnight-green)" strokeWidth="4" strokeLinejoin="round" />
          <path d="M40 150 L160 50 L280 150" fill="none" stroke="var(--color-midnight-green)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="140" y="160" width="40" height="60" rx="4" fill="var(--color-midnight-green)" />
          <rect x="80" y="150" width="34" height="34" rx="4" fill="var(--color-sky-blue)" />
          <rect x="206" y="150" width="34" height="34" rx="4" fill="var(--color-tea-rose)" />
          <rect x="150" y="30" width="14" height="30" fill="var(--color-midnight-green)" />
        </svg>
      </div>
    </section>
  );
}
