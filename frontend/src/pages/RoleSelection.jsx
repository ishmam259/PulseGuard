import { Link } from 'react-router-dom'
import $ from '../config/strings'

export default function RoleSelection() {
  const locale = localStorage.getItem('pg_locale') || 'en'

  const roles = [
    {
      icon: '',
      title: $('ROLE_PATIENT_TITLE', locale),
      desc: $('ROLE_PATIENT_DESC', locale),
      to: '/login/patient',
    },
    {
      icon: '',
      title: $('ROLE_WORKER_TITLE', locale),
      desc: $('ROLE_WORKER_DESC', locale),
      to: '/login/worker',
    },
    {
      icon: '',
      title: $('ROLE_ADMIN_TITLE', locale),
      desc: $('ROLE_ADMIN_DESC', locale),
      to: '/login/admin',
    },
  ]

  return (
    <section className="page animate-fade-in" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', marginBottom: '2rem' }}>
          <img src="/assets/icons/logo-icon.svg" alt="logo" style={{ height: '36px', width: '36px' }} />
          <span className="logo-text" style={{ fontSize: '24px', fontWeight: '800', color: '#FFFFFF' }}>PulseGuard</span>
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#FFFFFF', marginBottom: '0.5rem' }}>
          {$('ROLE_HEADING', locale)}
        </h1>
        <p className="muted">{$('ROLE_SUBHEADING', locale)}</p>
      </div>

      <div className="grid three" style={{ marginBottom: '3rem' }}>
        {roles.map((role, i) => (
          <Link
            key={role.to}
            to={role.to}
            className="card role-card stagger"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="role-icon">{role.icon}</div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#FFFFFF' }}>{role.title}</h3>
            <p className="muted" style={{ fontSize: '13px', lineHeight: '1.5' }}>{role.desc}</p>
            <span className="link" style={{ fontSize: '13px', fontWeight: '600', marginTop: '1rem', display: 'inline-block' }}>{$('ROLE_CONTINUE', locale)}</span>
          </Link>
        ))}
      </div>

      <div style={{ textAlign: 'center' }}>
        <Link to="/" className="link" style={{ color: 'var(--color-muted)' }}>
          {$('ROLE_BACK', locale)}
        </Link>
      </div>
    </section>
  )
}
