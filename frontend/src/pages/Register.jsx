import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useLocale } from '../context/LocaleContext'

const dashboardRoutes = {
  patient: '/patient/dashboard',
  worker: '/worker/dashboard',
  admin: '/admin',
}

export default function Register() {
  const { role } = useParams()
  const navigate = useNavigate()
  const { register } = useApp()
  const { t } = useLocale()

  const roleLabels = {
    patient: t('ROLE_PATIENT'),
    worker: t('ROLE_WORKER'),
    admin: t('ROLE_ADMIN'),
  }
  const roleLabel = roleLabels[role] || t('ROLE_DEFAULT')

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.email || !form.password) {
      setError(t('REGISTER_ERROR_REQUIRED'))
      return
    }
    setSubmitting(true)
    try {
      const result = await register({ ...form, role })
      if (result.ok) {
        const dashRoute = dashboardRoutes[role] || '/patient/dashboard'
        navigate(dashRoute, { replace: true })
      } else {
        setError(result.error || t('REGISTER_ERROR_FAILED'))
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
            {t('REGISTER_HEADING')}
          </h2>
          <p className="muted">{t('REGISTER_SUBHEADING', { role: roleLabel })}</p>
        </div>

        {error && (
          <div className="badge badge--offline" style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', width: '100%', justifyContent: 'center', borderRadius: 'var(--radius-md)' }}>
            {t('ERROR_PREFIX')}: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div className="form-grid">
            <label>
              {t('LABEL_FULL_NAME')}
              <div className="input-wrapper">
                <img src="/assets/icons/user.svg" alt={t('ALT_USER_ICON')} className="input-icon" />
                <input
                  type="text"
                  className="input"
                  placeholder={t('PLACEHOLDER_FULL_NAME')}
                  value={form.name}
                  onChange={handleChange('name')}
                  disabled={submitting}
                  required
                />
              </div>
            </label>
            <label>
              {t('LABEL_EMAIL_REQUIRED')}
              <div className="input-wrapper">
                <img src="/assets/icons/email.svg" alt={t('ALT_EMAIL_ICON')} className="input-icon" />
                <input
                  type="email"
                  className="input"
                  placeholder={t('PLACEHOLDER_EMAIL')}
                  value={form.email}
                  onChange={handleChange('email')}
                  disabled={submitting}
                  required
                />
              </div>
            </label>
            <label>
              {t('LABEL_PHONE')}
              <div className="input-wrapper">
                <img src="/assets/icons/user.svg" alt={t('ALT_PHONE_ICON')} className="input-icon" style={{ filter: 'opacity(0.5)' }} />
                <input
                  type="tel"
                  className="input"
                  placeholder={t('PLACEHOLDER_PHONE')}
                  value={form.phone}
                  onChange={handleChange('phone')}
                  disabled={submitting}
                />
              </div>
            </label>
            <label>
              {t('LABEL_PASSWORD_REQUIRED')}
              <div className="input-wrapper">
                <input
                  type="password"
                  className="input"
                  placeholder={t('PLACEHOLDER_PASSWORD_CREATE')}
                  value={form.password}
                  onChange={handleChange('password')}
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
            {submitting ? t('REGISTER_BTN_SUBMITTING') : t('REGISTER_BTN')}
          </button>
        </form>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', fontSize: '13px', width: '100%' }}>
          <span className="muted">{t('REGISTER_EXISTING_ACCOUNT')}</span>
          <Link to={`/login/${role}`} className="link">
            {t('LINK_SIGN_IN')}
          </Link>
        </div>
      </div>

      <div className="onboarding-image-pane">
        <img src="/assets/images/register-img.png" alt={t('ALT_HEALTHCARE_ILLUSTRATION')} />
      </div>
    </div>
  )
}
