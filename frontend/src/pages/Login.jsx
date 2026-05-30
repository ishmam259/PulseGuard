import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useLocale } from '../context/LocaleContext'

const dashboardRoutes = {
  patient: '/patient/dashboard',
  worker: '/worker/dashboard',
  admin: '/admin',
}

export default function Login() {
  const { role } = useParams()
  const navigate = useNavigate()
  const { login } = useApp()
  const { t } = useLocale()

  const roleLabels = {
    patient: t('ROLE_PATIENT'),
    worker: t('ROLE_WORKER'),
    admin: t('ROLE_ADMIN'),
  }
  const roleLabel = roleLabels[role] || t('ROLE_DEFAULT')
  const dashRoute = dashboardRoutes[role] || '/patient/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError(t('LOGIN_ERROR_EMPTY_FIELDS'))
      return
    }
    setSubmitting(true)
    try {
      const result = await login(email, password, role)
      if (result.ok) {
        navigate(dashRoute, { replace: true })
      } else {
        setError(result.error || t('LOGIN_ERROR_INVALID'))
      }
    } catch {
      setError(t('ERROR_CONNECTION_FAILED'))
    }
    setSubmitting(false)
  }

  return (
    <div className="onboarding-container animate-fade-in">
      <div className="onboarding-form-pane">
        <div style={{ marginBottom: '2rem' }}>
          <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
            <img src="/assets/icons/logo-icon.svg" alt={t('ALT_LOGO')} style={{ height: '32px', width: '32px' }} />
            <span className="logo-text" style={{ fontSize: '20px', fontWeight: '800', color: '#FFFFFF' }}>{t('BRAND_NAME')}</span>
          </div>

          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#FFFFFF', marginBottom: '0.5rem' }}>
            {t('LOGIN_HEADING')}
          </h2>
          <p className="muted">{t('LOGIN_SUBHEADING', { role: roleLabel })}</p>
        </div>

        {error && (
          <div className="badge badge--offline" style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', width: '100%', justifyContent: 'center', borderRadius: 'var(--radius-md)' }}>
            {t('ERROR_PREFIX')}: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div className="form-grid">
            <label>
              {t('LABEL_EMAIL')}
              <div className="input-wrapper">
                <img src="/assets/icons/email.svg" alt={t('ALT_EMAIL_ICON')} className="input-icon" />
                <input
                  type="email"
                  className="input"
                  placeholder={t('PLACEHOLDER_EMAIL')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>
            </label>
            <label>
              {t('LABEL_PASSWORD')}
              <div className="input-wrapper">
                <input
                  type="password"
                  className="input"
                  placeholder={t('PLACEHOLDER_PASSWORD')}
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
            {submitting ? t('LOGIN_BTN_SUBMITTING') : t('LOGIN_BTN')}
          </button>
        </form>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', fontSize: '13px', width: '100%' }}>
          <Link to={`/register/${role}`} className="link">
            {t('LINK_CREATE_ACCOUNT')}
          </Link>
          <Link to="/role" className="link" style={{ color: 'var(--color-muted)' }}>
            {t('LINK_CHANGE_ROLE')}
          </Link>
        </div>
      </div>

      <div className="onboarding-image-pane">
        <img src="/assets/images/onboarding-img.png" alt={t('ALT_HEALTHCARE_ILLUSTRATION')} />
      </div>
    </div>
  )
}
