import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import $ from '../config/strings'
import { ArrowLeft, ArrowRight, HeartPulse, Stethoscope, ShieldCheck, Sun, Moon } from 'lucide-react'

export default function RoleSelection() {
  const { theme, toggleTheme, locale, setLocale } = useApp()

  const t = (en, bn) => (locale === 'en' ? en : bn)

  const roles = [
    {
      icon: HeartPulse,
      title: $('ROLE_PATIENT_TITLE', locale),
      desc: $('ROLE_PATIENT_DESC', locale),
      to: '/login/patient',
    },
    {
      icon: Stethoscope,
      title: $('ROLE_WORKER_TITLE', locale),
      desc: $('ROLE_WORKER_DESC', locale),
      to: '/login/worker',
    },
    {
      icon: ShieldCheck,
      title: $('ROLE_ADMIN_TITLE', locale),
      desc: $('ROLE_ADMIN_DESC', locale),
      to: '/login/admin',
    },
  ]

  return (
    <main className="bg-hero relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Background ambient accents */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/20 blur-3xl" style={{ position: 'absolute', top: '-160px', right: '-160px', width: '500px', height: '500px', borderRadius: '50%', backgroundColor: 'color-mix(in oklab, var(--color-primary) 20%, transparent)', filter: 'blur(80px)' }} />
      <div className="pointer-events-none absolute top-1/2 -left-40 h-[400px] w-[400px] rounded-full bg-accent/40 blur-3xl" style={{ position: 'absolute', top: '50%', left: '-160px', width: '400px', height: '400px', borderRadius: '50%', backgroundColor: 'color-mix(in oklab, var(--color-accent) 40%, transparent)', filter: 'blur(80px)' }} />

      {/* Top bar controls */}
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        <Link to="/" className="group flex items-center gap-2.5" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-glow)] transition-transform group-hover:scale-105" style={{ display: 'grid', placeItems: 'center', width: '36px', height: '36px', borderRadius: '12px', backgroundColor: 'var(--color-primary)' }}>
            <HeartPulse className="h-5 w-5" strokeWidth={2.5} style={{ color: 'var(--color-surface)' }} />
          </span>
          <span className="text-lg font-semibold tracking-tight" style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>PulseGuard</span>
        </Link>

        <div className="flex items-center gap-2" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setLocale((l) => (l === "en" ? "bn" : "en"))}
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
            onClick={toggleTheme}
            aria-label="Toggle theme"
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
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Main Role Selection Area */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-8 pb-20 lg:px-10" style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px 80px' }}>
        <div className="mx-auto max-w-2xl text-center" style={{ maxWidth: '42rem', margin: '0 auto', textAlign: 'center' }}>
          <h2 className="font-display text-5xl leading-[1.05] tracking-tight md:text-6xl" style={{ fontSize: '3rem', fontWeight: '700', letterSpacing: '-0.02em', lineHeight: '1.1' }}>
            {t("Choose Your", "নির্বাচন করুন")}{" "}
            <span className="italic text-gradient-primary">{t("Role", "ভূমিকা")}</span>
          </h2>
          <p className="muted" style={{ marginTop: '16px', fontSize: '16px', lineHeight: '1.6' }}>
            {$('ROLE_SUBHEADING', locale)}
          </p>
        </div>

        <div className="grid three" style={{ gap: '24px', marginTop: '56px' }}>
          {roles.map((r) => (
            <Link
              key={r.title}
              to={r.to}
              className="card role-card"
              style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '32px',
                border: '1px solid color-mix(in oklab, var(--color-primary) 6%, transparent)',
                backgroundColor: 'var(--color-surface)',
                padding: '32px',
                textDecoration: 'none',
                display: 'block',
                transition: 'all var(--duration-normal)',
                boxShadow: '0 4px 24px -2px rgba(0, 0, 0, 0.01)'
              }}
            >
              <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary" style={{ display: 'grid', height: '48px', width: '48px', placeItems: 'center', borderRadius: '50%', backgroundColor: 'color-mix(in oklab, var(--color-primary) 8%, transparent)', color: 'var(--color-primary)' }}>
                <r.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display" style={{ fontSize: '1.48rem', fontWeight: '750', color: 'var(--color-text)', marginTop: '24px' }}>{r.title}</h3>
              <p className="muted" style={{ fontSize: '13.5px', marginTop: '12px', lineHeight: '1.6', color: 'var(--color-text-secondary)' }}>{r.desc}</p>
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--color-primary)', marginTop: '32px' }}>
                {$('ROLE_CONTINUE', locale).replace(' →', '')}
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>

        <div style={{ marginTop: '56px', textAlign: 'center' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              color: 'var(--color-muted)',
              textDecoration: 'none',
              transition: 'color var(--duration-fast)'
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{$('ROLE_BACK', locale)}</span>
          </Link>
        </div>
      </section>
    </main>
  )
}
