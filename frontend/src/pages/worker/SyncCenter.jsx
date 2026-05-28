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

export default function SyncCenter() {
  const { connectivity } = useApp()
  const [conflicts, setConflicts] = useState(undefined)
  const [loading, setLoading] = useState(true)
  const [resolving, setResolving] = useState(null)

  useEffect(() => {
    loadConflicts()
  }, [])

  async function loadConflicts() {
    const data = await api.getConflicts()
    setConflicts(data)
    setLoading(false)
  }

  const resolveConflict = async (id, resolution) => {
    setResolving(id)
    const result = await api.resolveConflict(id, resolution)
    if (result.ok) {
      setConflicts(prev => prev.filter(c => c.id !== id))
    }
    setResolving(null)
  }

  return (
    <MobileLayout
      title="Sync Center"
      status={connectivity}
      banner={{
        tone: connectivity === 'online' ? 'online' : 'offline',
        title: 'Sync Status',
        message: connectivity === 'online' ? 'Connected to server' : 'Offline; data will sync when connected',
        action: { label: 'Refresh', onClick: loadConflicts },
      }}
      navItems={workerNavItems}
    >
      {/* Sync Stats */}
      <div className="sync-stats animate-fade-in">
        <div className="sync-stat">
          <p className="muted">Status</p>
          <div className="kpi" style={{ fontSize: '1.2rem' }}>
            {connectivity === 'online' ? 'Online' : 'Offline'}
          </div>
        </div>
        <div className="sync-stat">
          <p className="muted">Conflicts</p>
          <div className="kpi" style={{ color: '#ef4444' }}>
            {conflicts ? conflicts.length : 0}
          </div>
        </div>
      </div>

      {/* Sync Progress */}
      <section className="card animate-fade-in" style={{ animationDelay: '80ms' }}>
        <div className="card-row">
          <h3>Connection Status</h3>
          <span className={`badge badge--${connectivity}`}>
            {connectivity === 'online' && 'Online'}
            {connectivity === 'offline' && 'Offline'}
          </span>
        </div>
        <div className="progress">
          <div className="progress-bar" style={{ width: connectivity === 'online' ? '100%' : '0%' }} />
        </div>
        <p className="muted">
          {connectivity === 'online' ? 'All data synced' : 'Waiting for connection...'}
        </p>
      </section>

      {/* Conflicts */}
      <section className="card conflict-card animate-fade-in" style={{ animationDelay: '160ms' }}>
        <h3>Conflicts ({conflicts ? conflicts.length : 0})</h3>
        {loading ? (
          <p className="muted" style={{ textAlign: 'center', padding: '1rem 0' }}>Loading conflicts…</p>
        ) : !conflicts || conflicts.length === 0 ? (
          <p className="muted" style={{ textAlign: 'center', padding: '1rem 0' }}>No conflicts; all data is in sync</p>
        ) : (
          <div className="list">
            {conflicts.map((conflict) => (
              <div key={conflict.id} style={{ marginBottom: 'var(--spacing-4)' }}>
                <div className="list-item" style={{ marginBottom: 'var(--spacing-2)' }}>
                  <div>
                    <strong>{conflict.patient_name || 'Patient'}</strong>
                    <p className="muted">{conflict.record_type} • {new Date(conflict.created_at).toLocaleString()}</p>
                  </div>
                  <span className="badge badge--high">Conflict</span>
                </div>
                <div className="diff-view">
                  <div className="diff-side">
                    <h4>Local</h4>
                    <pre style={{ fontSize: '0.75rem', color: '#f59e0b', whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(conflict.local_payload, null, 2)}
                    </pre>
                  </div>
                  <div className="diff-side">
                    <h4>Server</h4>
                    <pre style={{ fontSize: '0.75rem', color: '#14b8a6', whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(conflict.server_payload, null, 2)}
                    </pre>
                  </div>
                </div>
                <div className="button-row">
                  <button
                    className="btn btn--secondary"
                    type="button"
                    disabled={resolving === conflict.id}
                    onClick={() => resolveConflict(conflict.id, 'keep_local')}
                  >
                    Keep Local
                  </button>
                  <button
                    className="btn btn--secondary"
                    type="button"
                    disabled={resolving === conflict.id}
                    onClick={() => resolveConflict(conflict.id, 'keep_server')}
                  >
                    Keep Server
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </MobileLayout>
  )
}
