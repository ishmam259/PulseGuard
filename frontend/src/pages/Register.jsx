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

export default function Register() {
  const { role } = useParams()
  const navigate = useNavigate()
  const { register, locale } = useApp()
  const roleLabels = {
    patient: $('ROLE_PATIENT_TITLE', locale),
    worker: $('ROLE_WORKER_TITLE', locale),
    admin: $('ROLE_ADMIN_TITLE', locale),
  }
  const roleLabel = roleLabels[role] || 'User'

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
      setError('Please fill in all required fields')
      return
    }

    const trimmedName = form.name.trim()
    if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
      setError('Name must contain only letters and spaces')
      return
    }

    if (form.phone && form.phone.trim() !== '') {
      const phoneDigits = form.phone.trim()
      if (!/^\d{11}$/.test(phoneDigits)) {
        setError('Phone number must be exactly 11 digits')
        return
      }
    }

    setSubmitting(true)
    try {
      const result = await register({ ...form, name: trimmedName, role })
      if (result.ok) {
        const dashRoute = dashboardRoutes[role] || '/patient/dashboard'
        navigate(dashRoute, { replace: true })
      } else {
        setError(result.error || 'Registration failed')
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
            {$('REGISTER_HEADING', locale)}
          </h2>
          <p className="muted">{$('REGISTER_SUBHEADING_PREFIX', locale)} <strong>{roleLabel}</strong> {$('REGISTER_SUBHEADING_SUFFIX', locale)}</p>
        </div>

        {error && (
          <div className="badge badge--offline" style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', width: '100%', justifyContent: 'center', borderRadius: 'var(--radius-md)' }}>
            {$('REGISTER_ERR_PREFIX', locale)} {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div className="form-grid">
            <label>
              {$('REGISTER_LABEL_NAME', locale)}
              <div className="input-wrapper">
                <img src="/assets/icons/user.svg" alt="user" className="input-icon" />
                <input
                  type="text"
                  className="input"
                  placeholder={$('REGISTER_PH_NAME', locale)}
                  value={form.name}
                  onChange={handleChange('name')}
                  disabled={submitting}
                  required
                />
              </div>
            </label>
            <label>
              {$('REGISTER_LABEL_EMAIL', locale)}
              <div className="input-wrapper">
                <img src="/assets/icons/email.svg" alt="email" className="input-icon" />
                <input
                  type="email"
                  className="input"
                  placeholder={$('REGISTER_PH_EMAIL', locale)}
                  value={form.email}
                  onChange={handleChange('email')}
                  disabled={submitting}
                  required
                />
              </div>
            </label>
            <label>
              {$('REGISTER_LABEL_PHONE', locale)}
              <div className="input-wrapper">
                <img src="/assets/icons/user.svg" alt="phone" className="input-icon" style={{ filter: 'opacity(0.5)' }} />
                <input
                  type="tel"
                  className="input"
                  placeholder={$('REGISTER_PH_PHONE', locale)}
                  value={form.phone}
                  onChange={handleChange('phone')}
                  disabled={submitting}
                />
              </div>
            </label>
            <label>
              {$('REGISTER_LABEL_PASSWORD', locale)}
              <div className="input-wrapper">
                <input
                  type="password"
                  className="input"
                  placeholder={$('REGISTER_PH_PASSWORD', locale)}
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
            {submitting ? $('REGISTER_BTN_LOADING', locale) : $('REGISTER_BTN', locale)}
          </button>
        </form>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', fontSize: '13px', width: '100%' }}>
          <span className="muted">{$('REGISTER_ALREADY_HAVE', locale)}</span>
          <Link to={`/login/${role}`} className="link">
            {$('REGISTER_LINK_SIGNIN', locale)}
          </Link>
        </div>
      </div>

      <div className="onboarding-image-pane">
        <img src="/assets/images/register-img.png" alt="Healthcare Illustration" />
      </div>
    </div>
  )
}
