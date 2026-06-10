import { useState, useEffect } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import RiskTrendChart from '../../components/charts/RiskTrendChart'
import RegionChart from '../../components/charts/RegionChart'
import { useApp } from '../../context/AppContext'
import * as api from '../../services/api'
import $ from '../../config/strings'
import { Users, AlertTriangle, ShieldAlert, HeartPulse, Bell } from 'lucide-react'

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
      message: 'Maternal health server is fully functional and ready.',
      time: 'Just now',
      read: false
    }
  ]

  const regionCount = getRegionInfo().labels.length
  const nameParts = currentUser?.name ? currentUser.name.split(' ') : ['System', 'Administrator']
  const firstName = nameParts.slice(0, -1).join(' ') || nameParts[0]
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : ''

  return (
    <AdminLayout title={$('ADMIN_TITLE_DASHBOARD', locale)}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
        
        {/* Greeting Card */}
        <div className="glass" style={{ position: 'relative', overflow: 'hidden', borderRadius: '24px', padding: '32px' }}>
          <div className="absolute top-0 left-0 h-full w-1 bg-[var(--gradient-primary)]" style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '4px', background: 'var(--gradient-primary)' }} />
          <h2 className="font-display" style={{ fontSize: '2.2rem', fontWeight: '700', marginBottom: '8px', letterSpacing: '-0.01em' }}>
            {$('ADMIN_DASH_HELLO', locale)} {firstName} {lastName && <span className="italic text-gradient-primary">{lastName}</span>}
          </h2>
          <p className="muted" style={{ fontSize: '14px', lineHeight: 1.5 }}>
            {loading
              ? $('ADMIN_DASH_LOADING', locale)
              : $('ADMIN_DASH_SUMMARY', locale)
                  .replace('{total}', totalPatients)
                  .replace('{regions}', regionCount)
                  .replace('{high}', highRiskCases)
            }
          </p>
          <span className="badge badge--online" style={{ marginTop: '12px', display: 'inline-flex', textTransform: 'uppercase', fontSize: '10px', fontWeight: '700' }}>
            {$('LAYOUT_ADMIN_CONSOLE', locale)}
          </span>
        </div>

        {/* KPI Row */}
        {loading ? (
          <div className="glass text-center animate-pulse" style={{ padding: '3rem 2rem', borderRadius: '24px' }}>
            <p className="muted">{$('ADMIN_DASH_LOADING', locale)}</p>
          </div>
        ) : (
          <section>
            <div className="detail-cards-grid">
              
              {/* Total Patients */}
              <div className="detail-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="detail-card-label">{$('ADMIN_DASH_KPI_PATIENTS', locale)}</span>
                  <span style={{ color: 'var(--color-primary)' }}><Users className="h-5 w-5" /></span>
                </div>
                <p className="detail-card-value--accent" style={{ marginTop: '12px' }}>{totalPatients}</p>
              </div>

              {/* High Risk Cases */}
              <div className="detail-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="detail-card-label">{$('ADMIN_DASH_KPI_HIGH', locale)}</span>
                  <span style={{ color: 'var(--color-danger)' }}><AlertTriangle className="h-5 w-5" /></span>
                </div>
                <p className="detail-card-value--accent" style={{ marginTop: '12px', color: 'var(--color-danger)' }}>{highRiskCases}</p>
              </div>

              {/* Moderate Risk Cases */}
              <div className="detail-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="detail-card-label">{$('ADMIN_DASH_KPI_MODERATE', locale)}</span>
                  <span style={{ color: 'var(--color-warning)' }}><ShieldAlert className="h-5 w-5" /></span>
                </div>
                <p className="detail-card-value--accent" style={{ marginTop: '12px', color: 'var(--color-warning)' }}>{moderateRiskCases}</p>
              </div>

              {/* Health Workers Count */}
              <div className="detail-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="detail-card-label">{$('ADMIN_DASH_KPI_WORKERS', locale)}</span>
                  <span style={{ color: 'var(--color-primary)' }}><HeartPulse className="h-5 w-5" /></span>
                </div>
                <p className="detail-card-value--accent" style={{ marginTop: '12px' }}>{workerCount}</p>
              </div>

            </div>
          </section>
        )}

        {/* Charts */}
        {!loading && patients.length > 0 && (
          <section className="grid two" style={{ gap: '24px' }}>
            <div className="glass animate-fade-in" style={{ position: 'relative', overflow: 'hidden', borderRadius: '24px', padding: '32px' }}>
              <div className="absolute top-0 left-0 h-full w-1 bg-[var(--gradient-primary)]" style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '4px', background: 'var(--gradient-primary)' }} />
              <h3 className="font-display" style={{ fontSize: '1.4rem', marginBottom: '20px' }}>{$('ADMIN_DASH_CHART_TRENDS', locale)}</h3>
              <RiskTrendChart />
            </div>
            <div className="glass animate-fade-in" style={{ position: 'relative', overflow: 'hidden', borderRadius: '24px', padding: '32px' }}>
              <div className="absolute top-0 left-0 h-full w-1 bg-[var(--gradient-primary)]" style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '4px', background: 'var(--gradient-primary)' }} />
              <h3 className="font-display" style={{ fontSize: '1.4rem', marginBottom: '20px' }}>{$('ADMIN_DASH_CHART_REGION', locale)}</h3>
              <RegionChart regionInfo={getRegionInfo()} />
            </div>
          </section>
        )}

        {/* Real-time Alerts */}
        <section className="glass" style={{ position: 'relative', overflow: 'hidden', borderRadius: '24px', padding: '32px' }}>
          <div className="absolute top-0 left-0 h-full w-1 bg-[var(--gradient-primary)]" style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '4px', background: 'var(--gradient-primary)' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 className="font-display" style={{ fontSize: '1.4rem', margin: 0 }}>{$('ADMIN_DASH_ALERTS', locale)}</h3>
            <span className="badge badge--high" style={{ padding: '4px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Bell className="h-3.5 w-3.5" />
              <span>{activeAlerts.length} {$('ADMIN_DASH_ACTIVE', locale)}</span>
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeAlerts.map((alert) => (
              <div key={alert.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '16px', border: '1px solid var(--color-border)', backgroundColor: 'color-mix(in oklab, var(--color-surface) 50%, transparent)' }}>
                <div>
                  <strong style={{ fontSize: '15px', color: 'var(--color-text)' }}>{alert.title}</strong>
                  <p className="muted" style={{ fontSize: '12px', marginTop: '4px', margin: '4px 0 0' }}>{alert.message}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="muted" style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>{alert.time}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </AdminLayout>
  )
}
