import { useApp } from '../../context/AppContext'
import { useLocale } from '../../context/LocaleContext'
import MobileLayout from '../../components/layout/MobileLayout'
import { patientNavItems } from '../../data/navItems'

const severityMap = {
  emergency: { badge: 'high', icon: '' },
  risk: { badge: 'moderate', icon: '' },
  sync: { badge: 'online', icon: '' },
  info: { badge: 'low', icon: 'ℹ️' },
}

export default function Alerts() {
  const { notifications, connectivity } = useApp()
  const { t } = useLocale()

  // Default demo alerts if no real WebSocket alerts are present
  const displayAlerts = notifications.length > 0 ? notifications : [
    {
      id: 1,
      type: 'info',
      title: t('PATIENT_ALERTS_WELCOME_TITLE'),
      message: t('PATIENT_ALERTS_WELCOME_MSG'),
      time: t('JUST_NOW'),
      read: true
    },
    {
      id: 2,
      type: 'sync',
      title: t('PATIENT_ALERTS_SYNC_TITLE'),
      message: t('PATIENT_ALERTS_SYNC_MSG'),
      time: '1 hour ago',
      read: true
    }
  ]

  return (
    <MobileLayout
      title={t('PATIENT_ALERTS_TITLE')}
      status={connectivity}
      navItems={patientNavItems}
    >
      <div className="animate-fade-in">
        <div className="card">
          <h3 className="text-gradient">{t('PATIENT_ALERTS_NOTIFICATIONS')}</h3>
          <div className="list" style={{ marginTop: '1rem' }}>
            {displayAlerts.map((alert, i) => {
              const sev = severityMap[alert.type] || severityMap.info
              return (
                <div
                  key={alert.id}
                  className={`list-item stagger ${alert.read ? '' : 'alert'}`}
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span>{sev.icon}</span>
                      <strong>{alert.title}</strong>
                    </div>
                    <p className="muted" style={{ fontSize: '0.9rem', margin: '0.25rem 0' }}>{alert.message}</p>
                    <span className="muted" style={{ fontSize: '0.8rem' }}>{alert.time}</span>
                  </div>
                  <span className={`badge badge--${sev.badge}`} style={{ alignSelf: 'flex-start' }}>
                    {alert.type}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </MobileLayout>
  )
}
