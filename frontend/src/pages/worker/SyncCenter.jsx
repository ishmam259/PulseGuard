import { useState, useEffect } from 'react'
import MobileLayout from '../../components/layout/MobileLayout'
import { useApp } from '../../context/AppContext'
import * as api from '../../services/api'
import { useLocale } from '../../context/LocaleContext'

export default function SyncCenter() {
  const { connectivity } = useApp()
  const { t } = useLocale()
  const [conflicts, setConflicts] = useState(undefined)
  const [loading, setLoading] = useState(true)
  const [resolving, setResolving] = useState(null)

  const workerNavItems = [
    { label: t('NAV_HOME'), to: '/worker/dashboard', icon: '' },
    { label: t('NAV_PATIENTS'), to: '/worker/patients', icon: '' },
    { label: t('NAV_AI'), to: '/worker/ai-analysis', icon: '' },
    { label: t('NAV_SYNC'), to: '/worker/sync', icon: '' },
    { label: t('NAV_PROFILE'), to: '/worker/profile', icon: '' },
  ]

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
      title={t('SYNC_PAGE_TITLE')}
      status={connectivity}
      banner={{
        tone: connectivity === 'online' ? 'online' : 'offline',
        title: t('SYNC_BANNER_TITLE'),
        message: connectivity === 'online' ? t('SYNC_CONNECTED') : t('SYNC_OFFLINE_MSG'),
        action: { label: t('SYNC_REFRESH'), onClick: loadConflicts },
      }}
      navItems={workerNavItems}
    >
      {/* Sync Stats */}
      <div className="sync-stats animate-fade-in">
        <div className="sync-stat">
          <p className="muted">{t('STATUS')}</p>
          <div className="kpi" style={{ fontSize: '1.2rem' }}>
            {connectivity === 'online' ? t('ONLINE') : t('OFFLINE')}
          </div>
        </div>
        <div className="sync-stat">
          <p className="muted">{t('SYNC_CONFLICTS_LABEL')}</p>
          <div className="kpi" style={{ color: '#ef4444' }}>
            {conflicts ? conflicts.length : 0}
          </div>
        </div>
      </div>

      {/* Sync Progress */}
      <section className="card animate-fade-in" style={{ animationDelay: '80ms' }}>
        <div className="card-row">
          <h3>{t('SYNC_CONNECTION_STATUS')}</h3>
          <span className={`badge badge--${connectivity}`}>
            {connectivity === 'online' && t('ONLINE')}
            {connectivity === 'offline' && t('OFFLINE')}
          </span>
        </div>
        <div className="progress">
          <div className="progress-bar" style={{ width: connectivity === 'online' ? '100%' : '0%' }} />
        </div>
        <p className="muted">
          {connectivity === 'online' ? t('SYNC_ALL_SYNCED') : t('SYNC_WAITING_CONNECTION')}
        </p>
      </section>

      {/* Conflicts */}
      <section className="card conflict-card animate-fade-in" style={{ animationDelay: '160ms' }}>
        <h3>{t('SYNC_CONFLICTS_LABEL')} ({conflicts ? conflicts.length : 0})</h3>
        {loading ? (
          <p className="muted" style={{ textAlign: 'center', padding: '1rem 0' }}>{t('SYNC_LOADING_CONFLICTS')}</p>
        ) : !conflicts || conflicts.length === 0 ? (
          <p className="muted" style={{ textAlign: 'center', padding: '1rem 0' }}>{t('SYNC_NO_CONFLICTS')}</p>
        ) : (
          <div className="list">
            {conflicts.map((conflict) => (
              <div key={conflict.id} style={{ marginBottom: 'var(--spacing-4)' }}>
                <div className="list-item" style={{ marginBottom: 'var(--spacing-2)' }}>
                  <div>
                    <strong>{conflict.patient_name || t('SYNC_PATIENT_FALLBACK')}</strong>
                    <p className="muted">{conflict.record_type} • {new Date(conflict.created_at).toLocaleString()}</p>
                  </div>
                  <span className="badge badge--high">{t('SYNC_CONFLICT_BADGE')}</span>
                </div>
                <div className="diff-view">
                  <div className="diff-side">
                    <h4>{t('SYNC_LOCAL')}</h4>
                    <pre style={{ fontSize: '0.75rem', color: '#f59e0b', whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(conflict.local_payload, null, 2)}
                    </pre>
                  </div>
                  <div className="diff-side">
                    <h4>{t('SYNC_SERVER')}</h4>
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
                    {t('SYNC_KEEP_LOCAL')}
                  </button>
                  <button
                    className="btn btn--secondary"
                    type="button"
                    disabled={resolving === conflict.id}
                    onClick={() => resolveConflict(conflict.id, 'keep_server')}
                  >
                    {t('SYNC_KEEP_SERVER')}
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
