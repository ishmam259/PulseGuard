import { useState, useEffect } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import RiskTrendChart from '../../components/charts/RiskTrendChart'
import RegionChart from '../../components/charts/RegionChart'
import { useApp } from '../../context/AppContext'
import * as api from '../../services/api'
import $ from '../../config/strings'

export default function Dashboard() {
  const { currentUser, notifications, locale } = useApp()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAdminData() {
      try {
        const data = await api.getPatients()
        setPatients(data || [])
      } catch (err) {
        console.error('Failed to load admin dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadAdminData()
  }, [])

  // Derive region data dynamically
  const getRegionInfo = () => {
    if (patients.length === 0) {
      return { labels: [], patients: [], highRisk: [] }
    }
    const villages = {}
    patients.forEach((p) => {
      const v = p.village || 'Unknown'
      if (!villages[v]) {
        villages[v] = { total: 0, highRisk: 0 }
      }
      villages[v].total++
      if (p.risk_level === 'high') {
        villages[v].highRisk++
      }
    })
    const labels = Object.keys(villages)
    const totalCounts = labels.map((l) => villages[l].total)
    const highRiskCounts = labels.map((l) => villages[l].highRisk)
    return { labels, patients: totalCounts, highRisk: highRiskCounts }
  }

  // Derive active workers count
  const getWorkerCount = () => {
    const workers = new Set()
    patients.forEach((p) => {
      if (p.assigned_worker) {
        workers.add(p.assigned_worker)
      }
    })
    return workers.size || 1
  }

  const totalPatients = patients.length
  const highRiskCases = patients.filter((p) => p.risk_level === 'high').length
  const moderateRiskCases = patients.filter((p) => p.risk_level === 'moderate').length
  const workerCount = getWorkerCount()

  // Real-time alerts from context
  const activeAlerts = notifications.length > 0 ? notifications : [
    {
      id: 1,
      type: 'info',
      title: 'System Initialized',
      message: 'PulseGuard maternal health server is fully functional and ready.',
      time: 'Just now',
      read: false
    }
  ]

  const regionCount = getRegionInfo().labels.length

  return (
    <AdminLayout title={$('ADMIN_TITLE_DASHBOARD', locale)}>
      <div className="card greeting-card" style={{ marginBottom: 'var(--spacing-4)' }}>
        <h2>{$('ADMIN_DASH_HELLO', locale)} {currentUser?.name || 'Admin'}</h2>
        <p className="muted">
          {loading
            ? $('ADMIN_DASH_LOADING', locale)
            : $('ADMIN_DASH_SUMMARY', locale)
                .replace('{total}', totalPatients)
                .replace('{regions}', regionCount)
                .replace('{high}', highRiskCases)
          }
        </p>
        <span className="badge badge--online" style={{ marginTop: '0.5rem' }}>
          {$('LAYOUT_ADMIN_CONSOLE', locale)}
        </span>
      </div>

      {/* KPI Row */}
      {loading ? (
        <div className="card text-center animate-pulse" style={{ padding: '2rem', marginBottom: 'var(--spacing-4)' }}>
          <p className="muted">{$('ADMIN_DASH_LOADING', locale)}</p>
        </div>
      ) : (
        <section className="kpi-row stagger">
          <div className="stat-card bg-appointments animate-fade-in" style={{ animationDelay: '0ms' }}>
            <div className="stat-card-header">
              <img src="/assets/icons/appointments.svg" alt="appointments" className="stat-card-icon" />
              <h2 className="stat-card-count">{totalPatients}</h2>
            </div>
            <p className="stat-card-label">{$('ADMIN_DASH_KPI_PATIENTS', locale)}</p>
          </div>

          <div className="stat-card bg-pending animate-fade-in" style={{ animationDelay: '60ms' }}>
            <div className="stat-card-header">
              <img src="/assets/icons/pending.svg" alt="pending" className="stat-card-icon" />
              <h2 className="stat-card-count">{highRiskCases}</h2>
            </div>
            <p className="stat-card-label">{$('ADMIN_DASH_KPI_HIGH', locale)}</p>
          </div>

          <div className="stat-card bg-cancelled animate-fade-in" style={{ animationDelay: '120ms' }}>
            <div className="stat-card-header">
              <img src="/assets/icons/cancelled.svg" alt="cancelled" className="stat-card-icon" />
              <h2 className="stat-card-count">{moderateRiskCases}</h2>
            </div>
            <p className="stat-card-label">{$('ADMIN_DASH_KPI_MODERATE', locale)}</p>
          </div>

          <div className="stat-card bg-workers animate-fade-in" style={{ animationDelay: '180ms' }}>
            <div className="stat-card-header">
              <img src="/assets/icons/user.svg" alt="workers" className="stat-card-icon" style={{ filter: 'invert(100%)' }} />
              <h2 className="stat-card-count">{workerCount}</h2>
            </div>
            <p className="stat-card-label">{$('ADMIN_DASH_KPI_WORKERS', locale)}</p>
          </div>
        </section>
      )}

      {/* Charts */}
      {!loading && patients.length > 0 && (
        <section className="grid two" style={{ marginBottom: 'var(--spacing-5)' }}>
          <div className="card animate-fade-in" style={{ animationDelay: '200ms' }}>
            <h3>{$('ADMIN_DASH_CHART_TRENDS', locale)}</h3>
            <RiskTrendChart />
          </div>
          <div className="card animate-fade-in" style={{ animationDelay: '260ms' }}>
            <h3>{$('ADMIN_DASH_CHART_REGION', locale)}</h3>
            <RegionChart regionInfo={getRegionInfo()} />
          </div>
        </section>
      )}

      {/* Real-time Alerts */}
      <section className="card alert-panel animate-fade-in" style={{ animationDelay: '320ms' }}>
        <div className="card-row" style={{ marginTop: 0 }}>
          <h3>{$('ADMIN_DASH_ALERTS', locale)}</h3>
          <span className="badge badge--high">{activeAlerts.length} {$('ADMIN_DASH_ACTIVE', locale)}</span>
        </div>
        <div className="list stagger">
          {activeAlerts.map((alert, i) => (
            <div className="list-item" key={alert.id} style={{ animationDelay: `${i * 60}ms` }}>
              <div>
                <strong>{alert.title}</strong>
                <p className="muted">{alert.message}</p>
              </div>
              <div className="inline-actions">
                <span className="muted" style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>{alert.time}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AdminLayout>
  )
}
