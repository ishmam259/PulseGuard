import { useLocale } from '../../context/LocaleContext'
import AdminLayout from '../../components/layout/AdminLayout'
import { useNavigate } from 'react-router-dom'

export default function Settings() {
  const { t } = useLocale()
  const navigate = useNavigate()
  
  const settingsCards = [
    {
      id: 'set-1',
      icon: '',
      title: t('SETTINGS_USER_MANAGEMENT'),
      description: t('SETTINGS_USER_MANAGEMENT_DESC'),
      buttonText: t('SETTINGS_MANAGE_USERS'),
      buttonClass: 'btn--primary',
      path: '/admin/users'
    },
    {
      id: 'set-2',
      icon: '',
      title: t('SETTINGS_AI_CONFIG'),
      description: t('SETTINGS_AI_CONFIG_DESC'),
      buttonText: t('SETTINGS_CONFIGURE_AI'),
      buttonClass: 'btn--primary',
    },
    {
      id: 'set-3',
      icon: '',
      title: t('SETTINGS_OFFLINE_SYNC'),
      description: t('SETTINGS_OFFLINE_SYNC_DESC'),
      buttonText: t('SETTINGS_UPDATE'),
      buttonClass: 'btn--secondary',
    },
    {
      id: 'set-4',
      icon: '',
      title: t('SETTINGS_LANGUAGE'),
      description: t('SETTINGS_LANGUAGE_DESC'),
      buttonText: t('SETTINGS_MANAGE_LANGUAGES'),
      buttonClass: 'btn--secondary',
    },
  ]
  
  const handleAction = (card) => {
    if (card.path) {
      navigate(card.path)
    } else {
      alert(t('SETTINGS_COMING_SOON', { title: card.title }))
    }
  }

  return (
    <AdminLayout title={t('SETTINGS_TITLE')}>
      <section className="grid two stagger">
        {settingsCards.map((card, i) => (
          <div className="card animate-fade-in" key={card.id} style={{ animationDelay: `${i * 80}ms` }}>
            <div style={{ fontSize: '32px', marginBottom: 'var(--spacing-3)' }}>{card.icon}</div>
            <h3>{card.title}</h3>
            <p className="muted" style={{ marginBottom: 'var(--spacing-4)' }}>{card.description}</p>
            <button
              className={`btn ${card.buttonClass}`}
              type="button"
              onClick={() => handleAction(card)}
            >
              {card.buttonText}
            </button>
          </div>
        ))}
      </section>

      {/* System Info */}
      <section className="card animate-fade-in" style={{ animationDelay: '320ms', marginTop: 'var(--spacing-5)' }}>
        <h3>{t('SETTINGS_SYSTEM_INFO')}</h3>
        <div className="summary-grid" style={{ marginTop: 'var(--spacing-4)' }}>
          <div>
            <p className="muted">{t('SETTINGS_VERSION')}</p>
            <strong>{t('SETTINGS_VERSION_VALUE')}</strong>
          </div>
          <div>
            <p className="muted">{t('SETTINGS_STACK')}</p>
            <strong>{t('SETTINGS_STACK_VALUE')}</strong>
          </div>
          <div>
            <p className="muted">{t('SETTINGS_AI_MODELS')}</p>
            <strong>{t('SETTINGS_AI_MODELS_VALUE')}</strong>
          </div>
          <div>
            <p className="muted">{t('SETTINGS_DATABASE')}</p>
            <strong>{t('SETTINGS_DATABASE_VALUE')}</strong>
          </div>
        </div>
      </section>
    </AdminLayout>
  )
}
