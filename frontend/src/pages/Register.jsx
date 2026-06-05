import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
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
  const { register, locale, setLocale, theme, toggleTheme } = useApp()
  
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

  const t = (en, bn) => (locale === 'en' ? en : bn)

  const inputWrapperStyle = {
    position: 'relative',
    marginTop: '8px'
  }

  const inputStyle = {
    height: '48px',
    width: '100%',
    borderRadius: '16px',
    border: '1px solid var(--color-border)',
    backgroundColor: 'color-mix(in oklab, var(--color-surface) 60%, transparent)',
    padding: '0 16px 0 44px',
    fontSize: '14px',
    outline: 'none',
    backdropFilter: 'blur(8px)',
    color: 'var(--color-text)',
    boxSizing: 'border-box'
  }

  const labelStyle = {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--color-muted)'
  }

  const iconStyle = {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    height: '16px',
    width: '16px',
    color: 'var(--color-muted)',
    pointerEvents: 'none'
  }

  return (
    <main className="bg-hero relative min-h-screen overflow-hidden bg-background text-foreground" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', justifyContent: 'center' }}>
      {/* Background ambient accents */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/20 blur-3xl" style={{ position: 'absolute', top: '-160px', right: '-160px', width: '500px', height: '500px', borderRadius: '50%', backgroundColor: 'color-mix(in oklab, var(--color-primary) 20%, transparent)', filter: 'blur(80px)' }} />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-accent/40 blur-3xl" style={{ position: 'absolute', bottom: '-160px', left: '-160px', width: '500px', height: '500px', borderRadius: '50%', backgroundColor: 'color-mix(in oklab, var(--color-accent) 40%, transparent)', filter: 'blur(80px)' }} />

      {/* Top right controls */}
      <div className="flex items-center gap-2" style={{ position: 'absolute', right: '24px', top: '24px', zIndex: 1000, display: 'flex', gap: '8px' }}>
        <button
          type="button"
          onClick={() => setLocale(prev => (prev === 'en' ? 'bn' : 'en'))}
          style={{
            borderRadius: '9999px',
            border: '1px solid var(--color-border)',
            backgroundColor: 'color-mix(in oklab, var(--color-surface) 60%, transparent)',
            padding: '6px 14px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            color: 'var(--color-text-secondary)',
            backdropFilter: 'blur(8px)'
          }}
        >
          {locale === 'en' ? 'বাংলা' : 'English'}
        </button>
        <button
          type="button"
          onClick={toggleTheme}
          style={{
            display: 'grid',
            placeItems: 'center',
            height: '32px',
            width: '32px',
            borderRadius: '50%',
            border: '1px solid var(--color-border)',
            backgroundColor: 'color-mix(in oklab, var(--color-surface) 60%, transparent)',
            cursor: 'pointer',
            color: 'var(--color-text)',
            backdropFilter: 'blur(8px)',
            padding: '0'
          }}
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      {/* Main Sign Up content */}
      <section className="relative z-10 mx-auto flex w-full max-w-lg items-center px-6 py-12 lg:px-10" style={{ maxWidth: '32rem', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ width: '100%' }}>
          
          {/* Logo brand */}
          <Link to="/" className="group flex items-center gap-2.5" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '32px' }}>
            <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-glow)] transition-transform group-hover:scale-105" style={{ display: 'grid', placeItems: 'center', width: '36px', height: '36px', borderRadius: '12px', backgroundColor: 'var(--color-primary)' }}>
              <HeartPulse className="h-5 w-5" strokeWidth={2.5} style={{ color: 'var(--color-surface)' }} />
            </span>
            <span className="text-lg font-semibold tracking-tight" style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>PulseGuard</span>
          </Link>

          <div>
            <h2 className="font-display text-5xl leading-[1.05] tracking-tight" style={{ fontSize: '2.8rem', fontWeight: '700', letterSpacing: '-0.02em', lineHeight: '1.1' }}>
              {t("Create Account", "অ্যাকাউন্ট তৈরি")}
            </h2>
            <p className="muted" style={{ marginTop: '12px', fontSize: '14.5px' }}>
              {$('REGISTER_SUBHEADING_PREFIX', locale)} <strong style={{ color: 'var(--color-text)' }}>{roleLabel}</strong> {$('REGISTER_SUBHEADING_SUFFIX', locale)}
            </p>
          </div>

          {error && (
            <div style={{ borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.2)', backgroundColor: 'var(--color-danger-dim)', padding: '16px 20px', fontSize: '13px', color: 'var(--color-danger-light)', display: 'flex', alignItems: 'start', gap: '12px', marginTop: '24px' }}>
              <ShieldAlert className="h-5 w-5 shrink-0" style={{ marginTop: '2px' }} />
              <strong>{$('REGISTER_ERR_PREFIX', locale)} {error}</strong>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ width: '100%', marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>
                {$('REGISTER_LABEL_NAME', locale)}
              </label>
              <div style={inputWrapperStyle}>
                <User style={iconStyle} />
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange('name')}
                  placeholder={$('REGISTER_PH_NAME', locale)}
                  disabled={submitting}
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>
                {$('REGISTER_LABEL_EMAIL', locale)}
              </label>
              <div style={inputWrapperStyle}>
                <Mail style={iconStyle} />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange('email')}
                  placeholder={$('REGISTER_PH_EMAIL', locale)}
                  disabled={submitting}
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>
                {$('REGISTER_LABEL_PHONE', locale)}
              </label>
              <div style={inputWrapperStyle}>
                <Phone style={iconStyle} />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={handleChange('phone')}
                  placeholder={$('REGISTER_PH_PHONE', locale)}
                  disabled={submitting}
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>
                {$('REGISTER_LABEL_PASSWORD', locale)}
              </label>
              <div style={inputWrapperStyle}>
                <Lock style={iconStyle} />
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={handleChange('password')}
                  placeholder={$('REGISTER_PH_PASSWORD', locale)}
                  disabled={submitting}
                  style={inputStyle}
                />
              </div>
            </div>

            <button
              type="submit"
              className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:-translate-y-0.5 active:translate-y-0"
              disabled={submitting}
              style={{
                position: 'relative',
                display: 'inline-flex',
                height: '48px',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                borderRadius: '16px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600',
                color: 'white',
                marginTop: '16px'
              }}
            >
              <span className="absolute inset-0 bg-[var(--gradient-primary)]" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--gradient-primary)', zIndex: 0 }} />
              <span className="relative" style={{ zIndex: 1 }}>{submitting ? $('REGISTER_BTN_LOADING', locale) : $('REGISTER_BTN', locale)}</span>
              <ArrowRight className="relative h-4 w-4" style={{ zIndex: 1 }} />
            </button>
          </form>

          <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'space-between', fontSize: '13px', width: '100%' }}>
            <span className="muted">{$('REGISTER_ALREADY_HAVE', locale)}</span>
            <Link to={`/login/${role}`} className="link" style={{ fontWeight: '600', color: 'var(--color-primary)', textDecoration: 'none' }}>
              {$('REGISTER_LINK_SIGNIN', locale)}
            </Link>
          </div>

        </div>
      </section>
    </main>
  )
}
