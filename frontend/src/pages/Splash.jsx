import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import $ from '../config/strings'

export default function Splash() {
  const { theme, toggleTheme, locale, setLocale } = useApp()
  return (
    <div className="onboarding-container animate-fade-in">
      <button
        type="button"
        className="icon-btn"
        onClick={() => setLocale(prev => (prev === 'en' ? 'bn' : 'en'))}
        style={{
          position: 'fixed',
          top: '1.5rem',
          right: '4.5rem',
          zIndex: 1000,
          fontSize: '12px',
          width: 'auto',
          padding: '0 10px',
        }}
        title="Switch language"
      >
        {$('LANG_TOGGLE', locale)}
      </button>
      <button
        type="button"
        className="icon-btn theme-toggle-btn"
        onClick={toggleTheme}
        style={{
          position: 'fixed',
          top: '1.5rem',
          right: '1.5rem',
          zIndex: 1000,
        }}
        title="Toggle theme"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
      <div className="onboarding-form-pane">
        <div style={{ marginBottom: '2rem' }}>
          <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2.5rem' }}>
            <img src="/assets/icons/logo-icon_transparent.svg" alt="logo" style={{ height: '32px', width: '32px' }} />
            <span className="logo-text" style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-primary)' }}>PulseGuard</span>
          </div>
          
          <h1 style={{ fontSize: '38px', fontWeight: '800', lineHeight: '1.2', marginBottom: '1rem', color: 'var(--color-text)' }}>
            {$('SPLASH_HEADLINE', locale)}
          </h1>
          <p className="muted" style={{ fontSize: '15px', lineHeight: '1.6', marginBottom: '2.5rem' }}>
            {$('SPLASH_SUBLINE', locale)}
          </p>
        </div>

        <div className="button-row" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link to="/role" className="btn btn--primary btn--large" style={{ textAlign: 'center' }}>
            {$('SPLASH_CTA', locale)}
          </Link>
        </div>

        {/* Safety Disclaimer */}
        <div style={{
          marginTop: '2.5rem',
          padding: '1.25rem 1.5rem',
          borderRadius: '12px',
          background: 'var(--color-surface)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(242, 78, 67, 0.25)',
          borderLeft: '4px solid var(--color-danger)',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-start',
        }}>
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="var(--color-danger)" 
            strokeWidth="2.2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            style={{ 
              minWidth: '24px', 
              marginTop: '2px',
              filter: 'drop-shadow(0 0 6px rgba(242, 78, 67, 0.5))' 
            }}
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <h4 style={{ 
              fontWeight: 700, 
              fontSize: '16px', 
              color: 'var(--color-text)', 
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              letterSpacing: '0.3px'
            }}>
              {$('SPLASH_DISCLAIMER_TITLE', locale)}
            </h4>
            <p style={{ 
              fontSize: '14px', 
              color: 'var(--color-text-secondary)', 
              lineHeight: '1.6', 
              margin: 0 
            }}>
              {$('SPLASH_DISCLAIMER_BODY', locale)}
            </p>
          </div>
        </div>

        <p className="muted" style={{ marginTop: '1.25rem', fontSize: '12px' }} suppressHydrationWarning>
          &copy; {new Date().getFullYear()} PulseGuard AI. All rights reserved.
        </p>
      </div>

      <div className="onboarding-image-pane">
        <img src={theme === 'dark' ? "/assets/images/onboarding-img.png" : "/assets/images/onboarding-img_light_mode.png"} alt="Healthcare Onboarding Illustration" />
      </div>
    </div>
  )
}
