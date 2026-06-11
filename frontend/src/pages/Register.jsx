import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import { useApp } from '../context/AppContext'
import $ from '../config/strings'
import { User, Mail, Phone, Lock, ArrowRight, Sun, Moon, HeartPulse, ShieldAlert } from 'lucide-react'

const dashboardRoutes = {
  patient: '/patient/dashboard',
  worker: '/worker/dashboard',
  admin: '/admin',
}

export default function Register() {
  const { role } = useParams()
  const navigate = useNavigate()
  const { register, loginWithGoogle, locale, setLocale, theme, toggleTheme } = useApp()

  const roleLabels = {
    patient: $('ROLE_PATIENT_TITLE', locale),
    worker: $('ROLE_WORKER_TITLE', locale),
    admin: $('ROLE_ADMIN_TITLE', locale),
  }
  const roleLabel = roleLabels[role] || 'User'

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    scope: 'openid email profile',
    onSuccess: async (tokenResponse) => {
      setError('')
      try {
        const result = await loginWithGoogle(tokenResponse.access_token, role)
        if (result.ok) {
          const dashRoute = dashboardRoutes[result.user?.role] || dashboardRoutes[role] || '/patient/dashboard'
          navigate(dashRoute, { replace: true })
        } else {
          setError(result.error || 'Google sign-in failed')
        }
      } catch {
        setError('Google sign-in failed. Please try again.')
      }
    },
    onError: () => setError('Google sign-in failed'),
  })

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
              {t("Create", "অ্যাকাউন্ট")}{" "}
              <em className="auth-page__title-accent">{t("Account", "তৈরি")}</em>
            </h1>
            <p className="auth-page__subtitle">
              {$('REGISTER_SUBHEADING_PREFIX', locale)}{" "}
              <strong>{roleLabel}</strong>{" "}
              {$('REGISTER_SUBHEADING_SUFFIX', locale)}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="auth-page__error">
              <ShieldAlert style={{ height: 18, width: 18, flexShrink: 0, marginTop: 1 }} />
              <span>{$('REGISTER_ERR_PREFIX', locale)} {error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-page__form">
            <div className="auth-page__field">
              <label className="auth-page__label">
                {$('REGISTER_LABEL_NAME', locale)}
              </label>
              <div className="auth-page__input-wrap">
                <User className="auth-page__input-icon" />
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange('name')}
                  placeholder={$('REGISTER_PH_NAME', locale)}
                  disabled={submitting}
                  className="auth-page__input"
                />
              </div>
            </div>

            <div className="auth-page__field">
              <label className="auth-page__label">
                {$('REGISTER_LABEL_EMAIL', locale)}
              </label>
              <div className="auth-page__input-wrap">
                <Mail className="auth-page__input-icon" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange('email')}
                  placeholder={$('REGISTER_PH_EMAIL', locale)}
                  disabled={submitting}
                  className="auth-page__input"
                />
              </div>
            </div>

            <div className="auth-page__field">
              <label className="auth-page__label">
                {$('REGISTER_LABEL_PHONE', locale)}
              </label>
              <div className="auth-page__input-wrap">
                <Phone className="auth-page__input-icon" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={handleChange('phone')}
                  placeholder={$('REGISTER_PH_PHONE', locale)}
                  disabled={submitting}
                  className="auth-page__input"
                />
              </div>
            </div>

            <div className="auth-page__field">
              <label className="auth-page__label">
                {$('REGISTER_LABEL_PASSWORD', locale)}
              </label>
              <div className="auth-page__input-wrap">
                <Lock className="auth-page__input-icon" />
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={handleChange('password')}
                  placeholder={$('REGISTER_PH_PASSWORD', locale)}
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
              <span>{submitting ? $('REGISTER_BTN_LOADING', locale) : $('REGISTER_BTN', locale)}</span>
              <ArrowRight style={{ height: 16, width: 16 }} />
            </button>
          </form>

          {/* Google Sign-In */}
          <div className="auth-page__divider"><span>or</span></div>
          <div className="auth-page__google-custom-wrap" onClick={googleLogin} style={{ cursor: 'pointer' }}>
            <div className="auth-page__google-custom-btn">
              <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span>{t("Sign up with Google", "গুগল দিয়ে সাইন-আপ")}</span>
            </div>
          </div>

          {/* Footer links */}
          <div className="auth-page__footer">
            <span className="auth-page__footer-text">{$('REGISTER_ALREADY_HAVE', locale)}</span>
            <Link to={`/login/${role}`} className="auth-page__footer-link auth-page__footer-link--primary">
              {$('REGISTER_LINK_SIGNIN', locale)}
            </Link>
          </div>

        </div>
      </section>
    </main>
  )
}
