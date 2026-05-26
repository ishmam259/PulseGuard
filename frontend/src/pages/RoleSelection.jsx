import { Link } from 'react-router-dom'

const roles = [
  {
    icon: '',
    title: 'Patient / Mother',
    desc: 'Log health data, check pregnancy vitals, and consult the AI assistant offline.',
    to: '/login/patient',
  },
  {
    icon: '',
    title: 'Health Worker',
    desc: 'Register mothers, monitor local vitals, and review AI risk analysis in villages.',
    to: '/login/worker',
  },
  {
    icon: '',
    title: 'Administrator',
    desc: 'Manage clinical assignments, inspect system analytics, and view regional summaries.',
    to: '/login/admin',
  },
]

export default function RoleSelection() {
  return (
    <section className="page animate-fade-in" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', marginBottom: '2rem' }}>
          <img src="/assets/icons/logo-icon.svg" alt="logo" style={{ height: '36px', width: '36px' }} />
          <span className="logo-text" style={{ fontSize: '24px', fontWeight: '800', color: '#FFFFFF' }}>PulseGuard</span>
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#FFFFFF', marginBottom: '0.5rem' }}>
          Choose Your Role
        </h1>
        <p className="muted">Select how you want to log in to the PulseGuard platform</p>
      </div>

      <div className="grid three" style={{ marginBottom: '3rem' }}>
        {roles.map((role, i) => (
          <Link
            key={role.title}
            to={role.to}
            className="card role-card stagger"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="role-icon">{role.icon}</div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#FFFFFF' }}>{role.title}</h3>
            <p className="muted" style={{ fontSize: '13px', lineHeight: '1.5' }}>{role.desc}</p>
            <span className="link" style={{ fontSize: '13px', fontWeight: '600', marginTop: '1rem', display: 'inline-block' }}>Continue →</span>
          </Link>
        ))}
      </div>

      <div style={{ textAlign: 'center' }}>
        <Link to="/" className="link" style={{ color: 'var(--color-muted)' }}>
          ← Back to Welcome Screen
        </Link>
      </div>
    </section>
  )
}
