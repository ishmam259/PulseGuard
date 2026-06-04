import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import $ from '../config/strings'

// Removed static roleLabels in favor of dynamic lookup within component

const dashboardRoutes = {
  patient: '/patient/dashboard',
  worker: '/worker/dashboard',
  admin: '/admin',
}

export default function Login() {
  const { role } = useParams()
  const navigate = useNavigate()
  const { login, locale, setLocale, theme, toggleTheme } = useApp()
  const roleLabels = {
    patient: $('ROLE_PATIENT_TITLE', locale),
    worker: $('ROLE_WORKER_TITLE', locale),
    admin: $('ROLE_ADMIN_TITLE', locale),
  }
  const roleLabel = roleLabels[role] || 'User'
  const dashRoute = dashboardRoutes[role] || '/patient/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Please enter email and password')
      return
    }
    setSubmitting(true)
    try {
      const result = await login(email, password, role)
      if (result.ok) {
        navigate(dashRoute, { replace: true })
      } else {
        setError(result.error || 'Invalid email or password')
      }
    } catch {
      setError('Connection failed. Please try again.')
    }
    setSubmitting(false)
  }

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
          <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
            <img src="/assets/icons/logo-icon_transparent.svg" alt="logo" style={{ height: '32px', width: '32px' }} />
            <span className="logo-text" style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-primary)' }}>PulseGuard</span>
          </div>

          <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-text)', marginBottom: '0.5rem' }}>
            {$('LOGIN_HEADING', locale)}
          </h2>
          <p className="muted">{$('LOGIN_SUBHEADING_PREFIX', locale)} <strong>{roleLabel}</strong> {$('LOGIN_SUBHEADING_SUFFIX', locale)}</p>
        </div>

        {error && (
          <div className="onboarding-error-alert animate-fade-in">
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="var(--color-danger)" 
              strokeWidth="2.2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="error-icon"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span className="error-text">{$('LOGIN_ERR_PREFIX', locale)} {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div className="form-grid">
            <label>
              {$('LOGIN_LABEL_EMAIL', locale)}
              <div className="input-wrapper">
                <img src="/assets/icons/email.svg" alt="email" className="input-icon" />
                <input
                  type="email"
                  className="input"
                  placeholder={$('LOGIN_PH_EMAIL', locale)}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>
            </label>
            <label>
              {$('LOGIN_LABEL_PASSWORD', locale)}
              <div className="input-wrapper">
                <input
                  type="password"
                  className="input"
                  placeholder={$('LOGIN_PH_PASSWORD', locale)}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>
            </label>
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--large"
            disabled={submitting}
            style={{ marginTop: '1.5rem' }}
          >
            {submitting ? $('LOGIN_BTN_LOADING', locale) : $('LOGIN_BTN', locale)}
          </button>
        </form>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', fontSize: '13px', width: '100%' }}>
          <Link to={`/register/${role}`} className="link">
            {$('LOGIN_LINK_REGISTER', locale)}
          </Link>
          <Link to="/role" className="link" style={{ color: 'var(--color-muted)' }}>
            {$('LOGIN_LINK_CHANGE_ROLE', locale)}
          </Link>
        </div>
      </div>

      <div className="onboarding-image-pane">
        <img src={theme === 'dark' ? "/assets/images/onboarding-img.png" : "/assets/images/onboarding-img_light_mode.png"} alt="Healthcare Illustration" />
      </div>
    </div>
  )
}
