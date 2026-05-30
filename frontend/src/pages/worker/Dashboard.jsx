import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MobileLayout from '../../components/layout/MobileLayout'
import * as api from '../../services/api'
import { useLocale } from '../../context/LocaleContext'

export default function WorkerDashboard() {
  const { t, n } = useLocale()
  const [patients, setPatients] = useState(undefined)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const workerNavItems = [
    { label: t('NAV_HOME'), to: '/worker/dashboard', icon: '' },
    { label: t('NAV_PATIENTS'), to: '/worker/patients', icon: '' },
    { label: t('NAV_AI'), to: '/worker/ai-analysis', icon: '' },
    { label: t('NAV_SYNC'), to: '/worker/sync', icon: '' },
    { label: t('NAV_PROFILE'), to: '/worker/profile', icon: '' },
  ]

  useEffect(() => {
    const load = async () => {
      const data = await api.getPatients()
      setPatients(data)
      setLoading(false)
    }
    load()
  }, [])

  const highRisk = (patients || []).filter(p => p.risk_level === 'high').length
  const total = (patients || []).length

  return (
    <MobileLayout
      title={t('WORKER_DASHBOARD_TITLE')}
      banner={{
        tone: 'syncing',
        title: t('WORKER_BANNER_TITLE'),
        message: t('WORKER_BANNER_PATIENTS_ASSIGNED', { count: total }),
        action: { label: t('WORKER_BANNER_OPEN_SYNC'), onClick: () => navigate('/worker/sync') },
      }}
      navItems={workerNavItems}
    >
      {/* ── KPI Section ── */}
      <section className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
        <h3>{t('WORKER_TODAYS_KPIS')}</h3>
        <div className="kpi-row">
          <div className="stat-card bg-appointments">
            <div className="stat-card-header">
              <img src="/assets/icons/appointments.svg" alt="appointments" className="stat-card-icon" />
              <h2 className="stat-card-count">{loading ? '—' : n(total)}</h2>
            </div>
            <p className="stat-card-label">{t('WORKER_TOTAL_PATIENTS')}</p>
          </div>

          <div className="stat-card bg-pending">
            <div className="stat-card-header">
              <img src="/assets/icons/pending.svg" alt="pending" className="stat-card-icon" />
              <h2 className="stat-card-count">{loading ? '—' : n(highRisk)}</h2>
            </div>
            <p className="stat-card-label">{t('WORKER_HIGH_RISK_CASES')}</p>
          </div>

          <div className="stat-card bg-cancelled">
            <div className="stat-card-header">
              <img src="/assets/icons/cancelled.svg" alt="cancelled" className="stat-card-icon" />
              <h2 className="stat-card-count">{loading ? '—' : n((patients || []).filter(p => p.risk_level === 'moderate').length)}</h2>
            </div>
            <p className="stat-card-label">{t('WORKER_MODERATE_RISK_CASES')}</p>
          </div>

          <div className="stat-card bg-appointments" style={{ borderBottomColor: '#24AE7C' }}>
            <div className="stat-card-header">
              <img src="/assets/icons/check-circle.svg" alt="low risk" className="stat-card-icon" />
              <h2 className="stat-card-count">{loading ? '—' : n((patients || []).filter(p => p.risk_level === 'low').length)}</h2>
            </div>
            <p className="stat-card-label">{t('WORKER_LOW_RISK_CASES')}</p>
          </div>
        </div>
      </section>

      {/* ── Quick Actions ── */}
      <section className="animate-fade-in">
        <div className="section-header">
          <h3>{t('WORKER_QUICK_ACTIONS')}</h3>
        </div>
        <div className="grid three">
          <Link className="card action-card" to="/worker/patients">
            {t('WORKER_PATIENT_LIST_LINK')}
          </Link>
          <Link className="card action-card" to="/worker/ai-analysis">
            {t('WORKER_AI_ASSISTANT_LINK')}
          </Link>
          <Link className="card action-card" to="/worker/sync">
            {t('WORKER_SYNC_CENTER_LINK')}
          </Link>
        </div>
      </section>

      {/* ── High Risk Patients ── */}
      <section className="card animate-fade-in">
        <div className="section-header">
          <h3>{t('WORKER_HIGH_RISK_HEADING')}</h3>
          <span className="muted">{t('WORKER_PATIENTS_COUNT', { count: highRisk })}</span>
        </div>
        <div className="list stagger">
          {loading ? (
            <p className="muted" style={{ textAlign: 'center', padding: '1rem 0' }}>{t('LOADING')}</p>
          ) : (patients || []).flatMap((patient) => patient.risk_level === 'high' ? [(
            <div className="list-item" key={patient.id}>
              <div>
                <strong>{patient.name}</strong>
                <p className="muted">
                  {t('WEEK')} {patient.gestational_week ? n(patient.gestational_week) : '—'} • {patient.village || t('UNKNOWN')}
                </p>
              </div>
              <div className="inline-actions">
                <span className="badge badge--high">
                  {n(((patient.risk_score || 0) * 100).toFixed(0))}%
                </span>
                <Link className="btn btn--secondary" to={`/worker/patient/${patient.id}`}>
                  {t('VIEW')}
                </Link>
              </div>
            </div>
          )] : [])}
          {!loading && highRisk === 0 && (
            <p className="muted" style={{ textAlign: 'center', padding: '1rem 0' }}>{t('WORKER_NO_HIGH_RISK')}</p>
          )}
        </div>
      </section>
    </MobileLayout>
  )
}
