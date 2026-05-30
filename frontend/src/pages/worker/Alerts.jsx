import { useState, useEffect } from 'react'
import MobileLayout from '../../components/layout/MobileLayout'
import { useApp } from '../../context/AppContext'
import { workerNavItems } from '../../data/navItems'
import * as api from '../../services/api'
import $ from '../../config/strings'

export default function WorkerAlerts() {
  const { connectivity, locale } = useApp()
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAlerts() {
      try {
        const data = await api.getAlerts()
        setAlerts(data)
      } catch (err) {
        console.error('Failed to load alerts:', err)
      } finally {
        setLoading(false)
      }
    }
    loadAlerts()
  }, [])

  const handleResolve = async (id, status) => {
    try {
      const result = await api.resolveAlert(id, status)
      if (result.ok) {
        // Update local state
        setAlerts((prev) =>
          prev.map((alert) => (alert.id === id ? { ...alert, ...result.alert } : alert))
        )
      } else {
        alert('Failed to update alert: ' + (result.error || 'Unknown error'))
      }
    } catch (err) {
      console.error('Resolve error:', err)
    }
  }

  const activeAlerts = alerts.filter((a) => a.status === 'pending')
  const resolvedAlerts = alerts.filter((a) => a.status !== 'pending')

  return (
    <MobileLayout
      title={$('W_PAGE_TITLE_ALERTS', locale)}
      status={connectivity}
      navItems={workerNavItems(locale)}
    >
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Active Alerts */}
        <section className="card">
          <div className="section-header" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="animate-pulse" style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-danger)' }}></span>
              {$('W_ALERTS_ACTIVE_HEADING', locale)}
            </h3>
            <span className="badge badge--high" style={{ padding: '4px 10px' }}>
              {activeAlerts.length} {$('W_ALERTS_ACTIVE_BADGE_SUFFIX', locale)}
            </span>
          </div>

          {loading ? (
            <p className="muted text-center animate-pulse" style={{ padding: '2rem 0' }}>{$('W_ALERTS_LOADING', locale)}</p>
          ) : activeAlerts.length === 0 ? (
            <div className="text-center" style={{ padding: '2rem 0' }}>
              <p className="muted">{$('W_ALERTS_ALL_QUIET', locale)}</p>
            </div>
          ) : (
            <div className="list stagger">
              {activeAlerts.map((alert) => (
                <div
                  className="list-item sos-alert-card"
                  key={alert.id}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ color: '#fff', fontSize: '1.1rem', margin: 0 }}>{alert.patient_name}</h4>
                      <p className="muted" style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                        {alert.village || 'No village recorded'} • {$('W_PATIENTS_WEEK_PREFIX', locale)} {alert.gestational_week || '-'}
                      </p>
                    </div>
                    {alert.risk_level && (
                      <span className={`badge badge--${alert.risk_level}`}>
                        {alert.risk_level.toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div style={{ padding: '8px 12px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '6px' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#ff8a8a', fontStyle: 'italic' }}>
                      "{alert.message}"
                    </p>
                    <span className="muted" style={{ fontSize: '0.75rem', display: 'block', marginTop: '4px' }}>
                      {$('W_ALERTS_TRIGGERED_PREFIX', locale)} {new Date(alert.created_at).toLocaleString()}
                    </span>
                  </div>

                  {alert.latitude && alert.longitude && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--color-primary-light)' }}>{$('W_ALERTS_LOCATION_LABEL', locale)}</span>
                      <a
                        href={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--color-secondary)', textDecoration: 'underline', fontWeight: 'bold' }}
                      >
                        {$('W_ALERTS_MAP_LINK', locale)} ({Number(alert.latitude).toFixed(5)}, {Number(alert.longitude).toFixed(5)})
                      </a>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                    <button
                      type="button"
                      className="btn btn--primary"
                      style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', color: '#fff' }}
                      onClick={() => handleResolve(alert.id, 'resolved')}
                    >
                      {$('W_ALERTS_BTN_RESOLVE', locale)}
                    </button>
                    <button
                      type="button"
                      className="btn btn--secondary"
                      style={{ flex: 1, padding: '10px' }}
                      onClick={() => handleResolve(alert.id, 'dismissed')}
                    >
                      {$('W_ALERTS_BTN_DISMISS', locale)}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Historical Resolved Alerts */}
        <section className="card">
          <div className="section-header" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
            <h3>{$('W_ALERTS_HISTORY_HEADING', locale)}</h3>
            <span className="muted">{resolvedAlerts.length} total</span>
          </div>

          {loading ? null : resolvedAlerts.length === 0 ? (
            <p className="muted text-center" style={{ padding: '1rem 0' }}>{$('W_ALERTS_HISTORY_EMPTY', locale)}</p>
          ) : (
            <div className="list stagger">
              {resolvedAlerts.map((alert) => (
                <div
                  className="list-item"
                  key={alert.id}
                  style={{
                    opacity: 0.75,
                    boxShadow: 'inset 3px 0 0 var(--color-border)',
                    padding: '12px 16px',
                    borderRadius: '6px',
                    marginBottom: '8px'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ color: '#fff' }}>{alert.patient_name}</strong>
                      <span className={`badge badge--${alert.status === 'resolved' ? 'online' : 'offline'}`} style={{ fontSize: '0.75rem', padding: '2px 6px' }}>
                        {alert.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="muted" style={{ fontSize: '0.85rem', margin: '4px 0' }}>
                      {alert.message}
                    </p>
                    <span className="muted" style={{ fontSize: '0.75rem' }}>
                      {$('W_ALERTS_RESOLVED_PREFIX', locale)} {new Date(alert.resolved_at || alert.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </MobileLayout>
  )
}
