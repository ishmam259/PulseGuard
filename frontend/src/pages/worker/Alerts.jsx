import { useState, useEffect } from 'react'
import MobileLayout from '../../components/layout/MobileLayout'
import { useApp } from '../../context/AppContext'
import * as api from '../../services/api'

const workerNavItems = [
  { label: 'Home', to: '/worker/dashboard', icon: '' },
  { label: 'Patients', to: '/worker/patients', icon: '' },
  { label: 'AI', to: '/worker/ai-analysis', icon: '' },
  { label: 'Sync', to: '/worker/sync', icon: '' },
  { label: 'Profile', to: '/worker/profile', icon: '' },
]

export default function WorkerAlerts() {
  const { connectivity } = useApp()
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
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
      title="Alerts Center"
      status={connectivity}
      navItems={workerNavItems}
    >
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Active Alerts */}
        <section className="card">
          <div className="section-header" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="animate-pulse" style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-danger)' }}></span>
              Active Emergency SOS
            </h3>
            <span className="badge badge--high" style={{ padding: '4px 10px' }}>
              {activeAlerts.length} Active
            </span>
          </div>

          {loading ? (
            <p className="muted text-center animate-pulse" style={{ padding: '2rem 0' }}>Loading alerts...</p>
          ) : activeAlerts.length === 0 ? (
            <div className="text-center" style={{ padding: '2rem 0' }}>
              <p className="muted">🎉 All quiet. No pending emergency alerts.</p>
            </div>
          ) : (
            <div className="list stagger">
              {activeAlerts.map((alert) => (
                <div
                  className="list-item"
                  key={alert.id}
                  style={{
                    borderLeft: '4px solid var(--color-danger)',
                    backgroundColor: 'rgba(239, 68, 68, 0.05)',
                    padding: '1.25rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ color: '#fff', fontSize: '1.1rem', margin: 0 }}>{alert.patient_name}</h4>
                      <p className="muted" style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                        {alert.village || 'No village recorded'} • Week {alert.gestational_week || '—'}
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
                      Triggered: {new Date(alert.created_at).toLocaleString()}
                    </span>
                  </div>

                  {alert.latitude && alert.longitude && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--color-primary-light)' }}>📍 Location Shared:</span>
                      <a
                        href={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--color-secondary)', textDecoration: 'underline', fontWeight: 'bold' }}
                      >
                        Open in Google Maps ({Number(alert.latitude).toFixed(5)}, {Number(alert.longitude).toFixed(5)})
                      </a>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                    <button
                      className="btn btn--primary"
                      style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', color: '#fff' }}
                      onClick={() => handleResolve(alert.id, 'resolved')}
                    >
                      Mark Resolved
                    </button>
                    <button
                      className="btn btn--secondary"
                      style={{ flex: 1, padding: '10px' }}
                      onClick={() => handleResolve(alert.id, 'dismissed')}
                    >
                      Dismiss
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
            <h3>Resolved Alerts History</h3>
            <span className="muted">{resolvedAlerts.length} total</span>
          </div>

          {loading ? null : resolvedAlerts.length === 0 ? (
            <p className="muted text-center" style={{ padding: '1rem 0' }}>No history of resolved alerts.</p>
          ) : (
            <div className="list stagger">
              {resolvedAlerts.map((alert) => (
                <div
                  className="list-item"
                  key={alert.id}
                  style={{
                    opacity: 0.75,
                    borderLeft: '4px solid var(--color-border)',
                    padding: '12px 16px',
                    borderRadius: '6px',
                    marginBottom: '8px'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ color: '#fff' }}>{alert.patient_name}</strong>
                      <span className={`badge badge--${alert.status === 'resolved' ? 'online' : 'offline'}`} style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                        {alert.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="muted" style={{ fontSize: '0.85rem', margin: '4px 0' }}>
                      {alert.message}
                    </p>
                    <span className="muted" style={{ fontSize: '0.75rem' }}>
                      Resolved: {new Date(alert.resolved_at || alert.created_at).toLocaleString()}
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
