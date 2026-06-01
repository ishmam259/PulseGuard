import { useState, useEffect } from 'react'
import MobileLayout from '../../components/layout/MobileLayout'
import { useApp } from '../../context/AppContext'
import { workerNavItems } from '../../data/navItems'
import * as api from '../../services/api'
import $ from '../../config/strings'

export default function SyncCenter() {
  const { connectivity, locale } = useApp()
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
      title={$('W_PAGE_TITLE_SYNC', locale)}
      status={connectivity}
      banner={{
        tone: connectivity === 'online' ? 'online' : 'offline',
        title: $('W_SYNC_BANNER_TITLE', locale),
        message: connectivity === 'online'
          ? $('W_SYNC_BANNER_ONLINE', locale)
          : $('W_SYNC_BANNER_OFFLINE', locale),
        action: { label: $('W_SYNC_BANNER_REFRESH', locale), onClick: loadConflicts },
      }}
      navItems={workerNavItems(locale)}
    >
      {/* Sync Stats */}
      <div className="sync-stats animate-fade-in">
        <div className="sync-stat">
          <p className="muted">{$('W_SYNC_STAT_STATUS', locale)}</p>
          <div className="kpi" style={{ fontSize: '1.2rem' }}>
            {connectivity === 'online' ? $('W_SYNC_STATUS_ONLINE', locale) : $('W_SYNC_STATUS_OFFLINE', locale)}
          </div>
        </div>
        <div className="sync-stat">
          <p className="muted">{$('W_SYNC_STAT_CONFLICTS', locale)}</p>
          <div className="kpi" style={{ color: '#ef4444' }}>
            {conflicts ? conflicts.length : 0}
          </div>
        </div>
      </div>

      {/* Sync Progress */}
      <section className="card animate-fade-in" style={{ animationDelay: '80ms' }}>
        <div className="card-row">
          <h3>{$('W_SYNC_CONN_HEADING', locale)}</h3>
          <span className={`badge badge--${connectivity}`}>
            {connectivity === 'online' && $('W_SYNC_STATUS_ONLINE', locale)}
            {connectivity === 'offline' && $('W_SYNC_STATUS_OFFLINE', locale)}
          </span>
        </div>
        <div className="progress">
          <div className="progress-bar" style={{ width: connectivity === 'online' ? '100%' : '0%' }} />
        </div>
        <p className="muted">
          {connectivity === 'online' ? $('W_SYNC_CONN_SYNCED', locale) : $('W_SYNC_CONN_WAITING', locale)}
        </p>
      </section>

      {/* Conflicts */}
      <section className="card conflict-card animate-fade-in" style={{ animationDelay: '160ms' }}>
        <h3>{$('W_SYNC_CONFLICTS_HEADING_PREFIX', locale)}{conflicts ? conflicts.length : 0}{$('W_SYNC_CONFLICTS_HEADING_SUFFIX', locale)}</h3>
        {loading ? (
          <p className="muted" style={{ textAlign: 'center', padding: '1rem 0' }}>{$('W_SYNC_CONFLICTS_LOADING', locale)}</p>
        ) : !conflicts || conflicts.length === 0 ? (
          <p className="muted" style={{ textAlign: 'center', padding: '1rem 0' }}>{$('W_SYNC_CONFLICTS_EMPTY', locale)}</p>
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
                    <h4>{$('W_SYNC_DIFF_LOCAL', locale)}</h4>
                    <pre style={{ fontSize: '0.75rem', color: '#f59e0b', whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(conflict.local_payload, null, 2)}
                    </pre>
                  </div>
                  <div className="diff-side">
                    <h4>{$('W_SYNC_DIFF_SERVER', locale)}</h4>
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
                    {$('W_SYNC_BTN_KEEP_LOCAL', locale)}
                  </button>
                  <button
                    className="btn btn--secondary"
                    type="button"
                    disabled={resolving === conflict.id}
                    onClick={() => resolveConflict(conflict.id, 'keep_server')}
                  >
                    {$('W_SYNC_BTN_KEEP_SERVER', locale)}
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
