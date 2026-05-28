import { useApp } from '../../context/AppContext'
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

  // Default demo alerts if no real WebSocket alerts are present
  const displayAlerts = notifications.length > 0 ? notifications : [
    {
      id: 1,
      type: 'info',
      title: 'Welcome to PulseGuard',
      message: 'Monitor your blood pressure daily and stay connected with your healthcare worker.',
      time: 'Just now',
      read: true
    },
    {
      id: 2,
      type: 'sync',
      title: 'Sync Complete',
      message: 'All your offline health logs have been safely backed up to the server.',
      time: '1 hour ago',
      read: true
    }
  ]

  return (
    <MobileLayout
      title="Alerts"
      status={connectivity}
      navItems={patientNavItems}
    >
      <div className="animate-fade-in">
        <div className="card">
          <h3 className="text-gradient">Notifications</h3>
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
