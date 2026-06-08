import { useApp } from '../../context/AppContext'
import MobileLayout from '../../components/layout/MobileLayout'
import { patientNavItems } from '../../data/navItems'
import $ from '../../config/strings'

const severityMap = {
  emergency: { badge: 'high' },
  risk: { badge: 'moderate' },
  sync: { badge: 'online' },
  info: { badge: 'low' },
}

export default function Alerts() {
  const { notifications, connectivity, locale } = useApp()

  // Default demo alerts if no real WebSocket alerts are present
  const displayAlerts = notifications.length > 0 ? notifications : [
    {
      id: 1,
      type: 'info',
      title: $('ALERTS_WELCOME_TITLE', locale),
      message: $('ALERTS_WELCOME_MSG', locale),
      time: $('ALERTS_TIME_NOW', locale),
      read: true
    },
    {
      id: 2,
      type: 'sync',
      title: $('ALERTS_SYNC_TITLE', locale),
      message: $('ALERTS_SYNC_MSG', locale),
      time: $('ALERTS_TIME_1H', locale),
      read: true
    }
  ]

  return (
    <MobileLayout
      title={$('PAGE_TITLE_ALERTS', locale)}
      status={connectivity}
      navItems={patientNavItems(locale)}
    >
      <div className="animate-fade-in">
        <div className="glass" style={{ position: 'relative', overflow: 'hidden', borderRadius: '24px', padding: '32px' }}>
          {/* Left accent bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '4px', background: 'var(--gradient-primary)' }} />
          
          <h3 className="font-display" style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0 0 24px 0' }}>{$('ALERTS_HEADING', locale)}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {displayAlerts.map((alert, i) => {
              const sev = severityMap[alert.type] || severityMap.info
              return (
                <div
                  key={alert.id}
                  className={`stagger ${alert.read ? '' : 'alert'}`}
                  style={{
                    animationDelay: `${i * 0.08}s`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px',
                    borderRadius: '16px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'color-mix(in oklab, var(--color-surface) 60%, transparent)',
                    backdropFilter: 'blur(8px)',
                    transition: 'transform 0.25s, box-shadow 0.25s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-elevated)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div style={{ flex: 1, marginRight: '16px' }}>
                    <strong style={{ display: 'block', fontSize: '16px', color: 'var(--color-text)', marginBottom: '4px' }}>{alert.title}</strong>
                    <p className="muted" style={{ fontSize: '13px', margin: '4px 0' }}>{alert.message}</p>
                    <span className="muted" style={{ fontSize: '11px', display: 'block', marginTop: '6px' }}>{alert.time}</span>
                  </div>
                  <span className={`badge badge--${sev.badge}`} style={{ alignSelf: 'center', textTransform: 'uppercase', fontSize: '10px', fontWeight: '700' }}>
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
