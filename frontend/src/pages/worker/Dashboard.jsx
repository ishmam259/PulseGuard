import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MobileLayout from '../../components/layout/MobileLayout'
import * as api from '../../services/api'

const workerNavItems = [
  { label: 'Home', to: '/worker/dashboard', icon: '' },
  { label: 'Patients', to: '/worker/patients', icon: '' },
  { label: 'AI', to: '/worker/ai-analysis', icon: '' },
  { label: 'Sync', to: '/worker/sync', icon: '' },
  { label: 'Profile', to: '/worker/profile', icon: '' },
]

export default function WorkerDashboard() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      const data = await api.getPatients()
      setPatients(data)
      setLoading(false)
    }
    load()
  }, [])

  const highRisk = patients.filter(p => p.risk_level === 'high').length
  const total = patients.length

  return (
    <MobileLayout
      title="Health Worker"
      banner={{
        tone: 'syncing',
        title: 'Sync Center',
        message: `${total} patients assigned`,
        action: { label: 'Open Sync', onClick: () => navigate('/worker/sync') },
      }}
      navItems={workerNavItems}
    >
      {/* ── KPI Section ── */}
      <section className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
        <h3>Today's KPIs</h3>
        <div className="kpi-row">
          <div className="stat-card bg-appointments">
            <div className="stat-card-header">
              <img src="/assets/icons/appointments.svg" alt="appointments" className="stat-card-icon" />
              <h2 className="stat-card-count">{loading ? '—' : total}</h2>
            </div>
            <p className="stat-card-label">Total Patients</p>
          </div>

          <div className="stat-card bg-pending">
            <div className="stat-card-header">
              <img src="/assets/icons/pending.svg" alt="pending" className="stat-card-icon" />
              <h2 className="stat-card-count">{loading ? '—' : highRisk}</h2>
            </div>
            <p className="stat-card-label">High Risk Cases</p>
          </div>

          <div className="stat-card bg-cancelled">
            <div className="stat-card-header">
              <img src="/assets/icons/cancelled.svg" alt="cancelled" className="stat-card-icon" />
              <h2 className="stat-card-count">{loading ? '—' : patients.filter(p => p.risk_level === 'moderate').length}</h2>
            </div>
            <p className="stat-card-label">Moderate Risk Cases</p>
          </div>

          <div className="stat-card bg-appointments" style={{ borderBottomColor: '#24AE7C' }}>
            <div className="stat-card-header">
              <img src="/assets/icons/check-circle.svg" alt="low risk" className="stat-card-icon" />
              <h2 className="stat-card-count">{loading ? '—' : patients.filter(p => p.risk_level === 'low').length}</h2>
            </div>
            <p className="stat-card-label">Low Risk Cases</p>
          </div>
        </div>
      </section>

      {/* ── Quick Actions ── */}
      <section className="animate-fade-in">
        <div className="section-header">
          <h3>Quick Actions</h3>
        </div>
        <div className="grid three">
          <Link className="card action-card" to="/worker/patients">
            Patient List
          </Link>
          <Link className="card action-card" to="/worker/ai-analysis">
            AI Assistant
          </Link>
          <Link className="card action-card" to="/worker/sync">
            Sync Center
          </Link>
        </div>
      </section>

      {/* ── High Risk Patients ── */}
      <section className="card animate-fade-in">
        <div className="section-header">
          <h3>High Risk Patients</h3>
          <span className="muted">{highRisk} patients</span>
        </div>
        <div className="list stagger">
          {loading ? (
            <p className="muted" style={{ textAlign: 'center', padding: '1rem 0' }}>Loading...</p>
          ) : patients.filter(p => p.risk_level === 'high').map((patient) => (
            <div className="list-item" key={patient.id}>
              <div>
                <strong>{patient.name}</strong>
                <p className="muted">
                  Week {patient.gestational_week || '—'} • {patient.village || 'Unknown'}
                </p>
              </div>
              <div className="inline-actions">
                <span className="badge badge--high">
                  {((patient.risk_score || 0) * 100).toFixed(0)}%
                </span>
                <Link className="btn btn--secondary" to={`/worker/patient/${patient.id}`}>
                  View
                </Link>
              </div>
            </div>
          ))}
          {!loading && highRisk === 0 && (
            <p className="muted" style={{ textAlign: 'center', padding: '1rem 0' }}>No high risk patients</p>
          )}
        </div>
      </section>
    </MobileLayout>
  )
}
