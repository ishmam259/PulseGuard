import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MobileLayout from '../../components/layout/MobileLayout'
import { useApp } from '../../context/AppContext'
import { useLocale } from '../../context/LocaleContext'
import * as api from '../../services/api'
import { patientNavItems } from '../../data/navItems'

export default function Dashboard() {
  const { currentUser, connectivity } = useApp()
  const { t } = useLocale()
  const navigate = useNavigate()
  const [patient, setPatient] = useState(null)
  const [latestVitals, setLatestVitals] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPatientData() {
      try {
        const data = await api.getMyPatientProfile()
        if (data && data.patient) {
          setPatient(data.patient)
          setLatestVitals(data.latestVitals)
        }
      } catch (err) {
        console.error('Failed to load patient dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadPatientData()
  }, [])

  return (
    <MobileLayout
      title={t('DASHBOARD')}
      status={connectivity}
      navItems={patientNavItems}
    >
      <div className="animate-fade-in">
        {loading ? (
          <div className="card text-center" style={{ padding: '2rem' }}>
            <p className="muted animate-pulse">{t('DASHBOARD_LOADING')}</p>
          </div>
        ) : !patient ? (
          <div className="card" style={{
            background: 'linear-gradient(135deg, rgba(36,174,124,0.12), rgba(121,181,236,0.06))',
            border: '1px solid rgba(36,174,124,0.3)',
            boxShadow: 'inset 3px 0 0 var(--color-primary)',
            padding: '2rem 1.5rem',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🌿</div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>{t('DASHBOARD_WELCOME', { name: currentUser?.name?.split(' ')[0] || t('DASHBOARD_WELCOME_FALLBACK') })}</h2>
            <p className="muted" style={{ marginBottom: '1.5rem', lineHeight: 1.6 }}>
              {t('DASHBOARD_WELCOME_DESC')}
            </p>
            <button
              type="button"
              className="btn btn--primary btn--large"
              onClick={() => navigate('/patient/onboarding')}
            >
              {t('DASHBOARD_COMPLETE_PROFILE')}
            </button>
          </div>
        ) : (
          <div className="card greeting-card">
            <h2>{t('DASHBOARD_HELLO', { name: patient.name })}</h2>
            <p className="muted">{t('DASHBOARD_PREGNANCY_WEEK')} <strong>{patient.gestational_week || t('FALLBACK_NA')}</strong></p>
            <span className={`badge badge--${(patient.risk_level || 'low').toLowerCase()}`} style={{ marginTop: '0.5rem' }}>
              {patient.risk_level === 'high'
                ? t('HIGH_RISK')
                : patient.risk_level === 'moderate'
                ? t('MODERATE_RISK')
                : t('LOW_RISK')}
            </span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="section-header" style={{ marginTop: '1.5rem' }}>
          <h3>{t('DASHBOARD_QUICK_ACTIONS')}</h3>
        </div>
        <div className="grid two">
          <Link to="/patient/daily-check" className="card action-card stagger" style={{ animationDelay: '0s' }}>
            <svg style={{ width: '40px', height: '40px', color: 'var(--color-primary)', marginBottom: '4px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h4>{t('DASHBOARD_ACTION_DAILY_CHECK')}</h4>
            <p className="muted">{t('DASHBOARD_ACTION_DAILY_DESC')}</p>
          </Link>
          <Link to="/patient/ai-chat" className="card action-card stagger" style={{ animationDelay: '0.1s' }}>
            <svg style={{ width: '40px', height: '40px', color: 'var(--color-secondary)', marginBottom: '4px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <h4>{t('DASHBOARD_ACTION_AI_CHAT')}</h4>
            <p className="muted">{t('DASHBOARD_ACTION_AI_DESC')}</p>
          </Link>
          <Link to="/patient/nutrition" className="card action-card stagger" style={{ animationDelay: '0.2s' }}>
            <svg style={{ width: '40px', height: '40px', color: 'var(--color-primary)', marginBottom: '4px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
            </svg>
            <h4>{t('DASHBOARD_ACTION_NUTRITION')}</h4>
            <p className="muted">{t('DASHBOARD_ACTION_NUTRITION_DESC')}</p>
          </Link>
          <Link to="/patient/emergency" className="card action-card alert stagger" style={{ animationDelay: '0.3s' }}>
            <svg style={{ width: '40px', height: '40px', color: 'var(--color-danger)', marginBottom: '4px', animation: 'pulse 0.9s infinite' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h4>{t('DASHBOARD_ACTION_EMERGENCY')}</h4>
            <p className="muted">{t('DASHBOARD_ACTION_EMERGENCY_DESC')}</p>
          </Link>
        </div>

        {/* Health Summary */}
        <div className="section-header" style={{ marginTop: '1.5rem' }}>
          <h3>{t('DASHBOARD_HEALTH_SUMMARY')}</h3>
        </div>
        <div className="card">
          <div className="summary-grid">
            <div className="kpi-card">
              <span className="muted">{t('DASHBOARD_KPI_BP')}</span>
              <span className={latestVitals ? "kpi" : "kpi-empty"}>
                {latestVitals ? `${latestVitals.bp_systolic}/${latestVitals.bp_diastolic}` : t('FALLBACK_NA')}
              </span>
            </div>
            <div className="kpi-card">
              <span className="muted">{t('DASHBOARD_KPI_WEIGHT')}</span>
              <span className={latestVitals?.weight_kg ? "kpi" : "kpi-empty"}>
                {latestVitals?.weight_kg ? `${latestVitals.weight_kg} kg` : t('FALLBACK_NA')}
              </span>
            </div>
            <div className="kpi-card">
              <span className="muted">{t('DASHBOARD_KPI_TEMPERATURE')}</span>
              <span className={latestVitals?.temperature_c ? "kpi" : "kpi-empty"}>
                {latestVitals?.temperature_c ? `${latestVitals.temperature_c} °C` : t('FALLBACK_NA')}
              </span>
            </div>
            <div className="kpi-card">
              <span className="muted">{t('DASHBOARD_KPI_LAST_CHECKUP')}</span>
              <span className={latestVitals ? "kpi" : "kpi-empty"}>
                {latestVitals ? new Date(latestVitals.recorded_at).toLocaleDateString() : t('DASHBOARD_KPI_NO_RECORDS')}
              </span>
            </div>
          </div>
          {patient && (
            <div style={{ marginTop: '1rem', textAlign: 'right' }}>
              <Link to="/patient/records" className="btn btn--ghost" style={{ fontSize: '0.85rem' }}>
                {t('DASHBOARD_VIEW_ALL_RECORDS')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  )
}
