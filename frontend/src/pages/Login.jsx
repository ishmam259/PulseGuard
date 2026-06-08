import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import $ from '../config/strings'
import { Mail, Lock, ArrowRight, Sun, Moon, HeartPulse, ShieldAlert } from 'lucide-react'

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

  const t = (en, bn) => (locale === 'en' ? en : bn)

  return (
    <main className="auth-page">
      {/* Right-side pink gradient wash */}
      <div className="auth-page__gradient-wash" />

      {/* Top right controls */}
      <div className="auth-page__controls">
        <button
          type="button"
          onClick={() => setLocale(prev => (prev === 'en' ? 'bn' : 'en'))}
          className="auth-page__lang-btn"
        >
          {locale === 'en' ? 'বাংলা' : 'English'}
        </button>
        <button
          type="button"
          onClick={toggleTheme}
          className="auth-page__theme-btn"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun style={{ height: 16, width: 16 }} /> : <Moon style={{ height: 16, width: 16 }} />}
        </button>
      </div>

      {/* Main content */}
      <section className="auth-page__content">
        <div className="auth-page__inner">
          
          {/* Logo */}
          <Link to="/" className="auth-page__logo">
            <span className="auth-page__logo-icon">
              <HeartPulse strokeWidth={2.5} style={{ height: 20, width: 20, color: 'var(--color-surface)' }} />
            </span>
            <span className="auth-page__logo-text">PulseGuard</span>
          </Link>

          {/* Heading */}
          <div className="auth-page__heading">
            <h1 className="auth-page__title">
              {t("Welcome", "স্বাগতম")}{" "}
              <em className="auth-page__title-accent">{t("Back", "ফিরে")}</em>
            </h1>
            <p className="auth-page__subtitle">
              {$('LOGIN_SUBHEADING_PREFIX', locale)}{" "}
              <strong>{roleLabel}</strong>{" "}
              {$('LOGIN_SUBHEADING_SUFFIX', locale)}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="auth-page__error">
              <ShieldAlert style={{ height: 18, width: 18, flexShrink: 0, marginTop: 1 }} />
              <span>{$('LOGIN_ERR_PREFIX', locale)} {error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-page__form">
            <div className="auth-page__field">
              <label className="auth-page__label">
                {$('LOGIN_LABEL_EMAIL', locale)}
              </label>
              <div className="auth-page__input-wrap">
                <Mail className="auth-page__input-icon" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={$('LOGIN_PH_EMAIL', locale)}
                  disabled={submitting}
                  className="auth-page__input"
                />
              </div>
            </div>

            <div className="auth-page__field">
              <label className="auth-page__label">
                {$('LOGIN_LABEL_PASSWORD', locale)}
              </label>
              <div className="auth-page__input-wrap">
                <Lock className="auth-page__input-icon" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={$('LOGIN_PH_PASSWORD', locale)}
                  disabled={submitting}
                  className="auth-page__input"
                />
              </div>
            </div>

            <button
              type="submit"
              className="auth-page__submit-btn"
              disabled={submitting}
            >
              <span>{submitting ? $('LOGIN_BTN_LOADING', locale) : $('LOGIN_BTN', locale)}</span>
              <ArrowRight style={{ height: 16, width: 16 }} />
            </button>
          </form>

          {/* Footer links */}
          <div className="auth-page__footer">
            <Link to={`/register/${role}`} className="auth-page__footer-link auth-page__footer-link--primary">
              {$('LOGIN_LINK_REGISTER', locale)}
            </Link>
            <Link to="/role" className="auth-page__footer-link auth-page__footer-link--muted">
              {$('LOGIN_LINK_CHANGE_ROLE', locale)}
            </Link>
          </div>

        </div>
      </section>
    </main>
  )
}
