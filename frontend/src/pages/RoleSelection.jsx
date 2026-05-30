import { Link } from 'react-router-dom'
import { useLocale } from '../context/LocaleContext'

export default function RoleSelection() {
  const { t } = useLocale()

  const roles = [
    {
      icon: '',
      title: t('ROLE_PATIENT'),
      desc: t('ROLE_DESC_PATIENT'),
      to: '/login/patient',
    },
    {
      icon: '',
      title: t('ROLE_WORKER'),
      desc: t('ROLE_DESC_WORKER'),
      to: '/login/worker',
    },
    {
      icon: '',
      title: t('ROLE_ADMIN'),
      desc: t('ROLE_DESC_ADMIN'),
      to: '/login/admin',
    },
  ]
  return (
    <section className="page animate-fade-in" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', marginBottom: '2rem' }}>
          <img src="/assets/icons/logo-icon.svg" alt={t('ALT_LOGO')} style={{ height: '36px', width: '36px' }} />
          <span className="logo-text" style={{ fontSize: '24px', fontWeight: '800', color: '#FFFFFF' }}>{t('BRAND_NAME')}</span>
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#FFFFFF', marginBottom: '0.5rem' }}>
          {t('ROLE_SELECTION_HEADING')}
        </h1>
        <p className="muted">{t('ROLE_SELECTION_SUBHEADING')}</p>
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
            <span className="link" style={{ fontSize: '13px', fontWeight: '600', marginTop: '1rem', display: 'inline-block' }}>{t('ROLE_CARD_CTA')}</span>
          </Link>
        ))}
      </div>

      <div style={{ textAlign: 'center' }}>
        <Link to="/" className="link" style={{ color: 'var(--color-muted)' }}>
          {t('BACK_TO_WELCOME')}
        </Link>
      </div>
    </section>
  )
}
