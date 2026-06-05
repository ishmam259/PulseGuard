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

      {/* Main Sign In content */}
      <section className="relative z-10 mx-auto flex w-full max-w-lg items-center px-6 py-16 lg:px-10" style={{ maxWidth: '32rem', margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ width: '100%' }}>
          
          {/* Logo brand */}
          <Link to="/" className="group flex items-center gap-2.5" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '40px' }}>
            <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-glow)] transition-transform group-hover:scale-105" style={{ display: 'grid', placeItems: 'center', width: '36px', height: '36px', borderRadius: '12px', backgroundColor: 'var(--color-primary)' }}>
              <HeartPulse className="h-5 w-5" strokeWidth={2.5} style={{ color: 'var(--color-surface)' }} />
            </span>
            <span className="text-lg font-semibold tracking-tight" style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>PulseGuard</span>
          </Link>

          <div>
            <h2 className="font-display text-5xl leading-[1.05] tracking-tight" style={{ fontSize: '3rem', fontWeight: '700', letterSpacing: '-0.02em', lineHeight: '1.1' }}>
              {t("Welcome", "স্বাগতম")}{" "}
              <span className="italic text-gradient-primary">{t("Back", "ফিরে")}</span>
            </h2>
            <p className="muted" style={{ marginTop: '16px', fontSize: '15px' }}>
              {$('LOGIN_SUBHEADING_PREFIX', locale)} <strong style={{ color: 'var(--color-text)' }}>{roleLabel}</strong> {$('LOGIN_SUBHEADING_SUFFIX', locale)}
            </p>
          </div>

          {error && (
            <div style={{ borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.2)', backgroundColor: 'var(--color-danger-dim)', padding: '16px 20px', fontSize: '13px', color: 'var(--color-danger-light)', display: 'flex', alignItems: 'start', gap: '12px', marginTop: '24px' }}>
              <ShieldAlert className="h-5 w-5 shrink-0" style={{ marginTop: '2px' }} />
              <strong>{$('LOGIN_ERR_PREFIX', locale)} {error}</strong>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ width: '100%', marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-muted)' }}>
                {$('LOGIN_LABEL_EMAIL', locale)}
              </label>
              <div className="relative" style={{ position: 'relative', marginTop: '8px' }}>
                <Mail className="pointer-events-none absolute" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', height: '16px', width: '16px', color: 'var(--color-muted)', pointerEvents: 'none' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={$('LOGIN_PH_EMAIL', locale)}
                  disabled={submitting}
                  style={{
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
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-muted)' }}>
                {$('LOGIN_LABEL_PASSWORD', locale)}
              </label>
              <div className="relative" style={{ position: 'relative', marginTop: '8px' }}>
                <Lock className="pointer-events-none absolute" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', height: '16px', width: '16px', color: 'var(--color-muted)', pointerEvents: 'none' }} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={$('LOGIN_PH_PASSWORD', locale)}
                  disabled={submitting}
                  style={{
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
                  }}
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
              <span className="relative" style={{ zIndex: 1 }}>{submitting ? $('LOGIN_BTN_LOADING', locale) : $('LOGIN_BTN', locale)}</span>
              <ArrowRight className="relative h-4 w-4" style={{ zIndex: 1 }} />
            </button>
          </form>

          <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'space-between', fontSize: '13px', width: '100%' }}>
            <Link to={`/register/${role}`} className="link" style={{ fontWeight: '600', color: 'var(--color-primary)', textDecoration: 'none' }}>
              {$('LOGIN_LINK_REGISTER', locale)}
            </Link>
            <Link to="/role" className="link" style={{ color: 'var(--color-muted)', textDecoration: 'none' }}>
              {$('LOGIN_LINK_CHANGE_ROLE', locale)}
            </Link>
          </div>

        </div>
      </section>
    </main>
  )
}
