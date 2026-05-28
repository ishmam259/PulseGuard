import { Link } from 'react-router-dom'

export default function Splash() {
  return (
    <div className="onboarding-container animate-fade-in">
      <div className="onboarding-form-pane">
        <div style={{ marginBottom: '2rem' }}>
          <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2.5rem' }}>
            <img src="/assets/icons/logo-icon.svg" alt="logo" style={{ height: '32px', width: '32px' }} />
            <span className="logo-text" style={{ fontSize: '20px', fontWeight: '800', color: '#FFFFFF' }}>PulseGuard</span>
          </div>
          
          <h1 style={{ fontSize: '38px', fontWeight: '800', lineHeight: '1.2', marginBottom: '1rem', color: '#FFFFFF' }}>
            Offline-First AI Maternal Healthcare
          </h1>
          <p className="muted" style={{ fontSize: '15px', lineHeight: '1.6', marginBottom: '2.5rem' }}>
            AI-powered pregnancy risk monitoring, symptom checking, and automatic database syncing for rural health workers and mothers.
          </p>
        </div>

        <div className="button-row" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link to="/role" className="btn btn--primary btn--large" style={{ textAlign: 'center' }}>
            Get Started →
          </Link>
        </div>

        <p className="muted" style={{ marginTop: '4rem', fontSize: '12px' }} suppressHydrationWarning>
          &copy; {new Date().getFullYear()} PulseGuard AI. All rights reserved.
        </p>
      </div>

      <div className="onboarding-image-pane">
        <img src="/assets/images/onboarding-img.png" alt="Healthcare Onboarding Illustration" />
      </div>
    </div>
  )
}
