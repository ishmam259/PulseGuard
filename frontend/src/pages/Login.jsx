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
  const { login, locale } = useApp()
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
      <div className="onboarding-form-pane">
        <div style={{ marginBottom: '2rem' }}>
          <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
            <img src="/assets/icons/logo-icon.svg" alt="logo" style={{ height: '32px', width: '32px' }} />
            <span className="logo-text" style={{ fontSize: '20px', fontWeight: '800', color: '#FFFFFF' }}>PulseGuard</span>
          </div>

          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#FFFFFF', marginBottom: '0.5rem' }}>
            {$('LOGIN_HEADING', locale)}
          </h2>
          <p className="muted">{$('LOGIN_SUBHEADING_PREFIX', locale)} <strong>{roleLabel}</strong> {$('LOGIN_SUBHEADING_SUFFIX', locale)}</p>
        </div>

        {error && (
          <div className="badge badge--offline" style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', width: '100%', justifyContent: 'center', borderRadius: 'var(--radius-md)' }}>
            {$('LOGIN_ERR_PREFIX', locale)} {error}
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
        <img src="/assets/images/onboarding-img.png" alt="Healthcare Illustration" />
      </div>
    </div>
  )
}
