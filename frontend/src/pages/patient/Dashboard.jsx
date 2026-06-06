import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MobileLayout from '../../components/layout/MobileLayout'
import { useApp } from '../../context/AppContext'
import * as api from '../../services/api'
import { patientNavItems } from '../../data/navItems'
import $ from '../../config/strings'
import { formatDate } from '../../utils/date'

export default function Dashboard() {
  const { currentUser, connectivity, locale } = useApp()
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
      title={$('PAGE_TITLE_DASHBOARD', locale)}
      status={connectivity}
      navItems={patientNavItems(locale)}
    >
      <div className="animate-fade-in">
        {loading ? (
          <div className="card text-center" style={{ padding: '2rem' }}>
            <p className="muted animate-pulse">{$('DASH_LOADING', locale)}</p>
          </div>
        ) : !patient ? (
          <div className="card" style={{
            background: 'var(--gradient-surface)',
            border: '1px solid var(--color-border)',
            borderLeft: '4px solid var(--color-primary)',
            padding: '2rem 1.5rem',
            textAlign: 'center',
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>{$('DASH_WELCOME_HEADING_PREFIX', locale)} {currentUser?.name?.split(' ')[0] || 'Mother'}!</h2>
            <p className="muted" style={{ marginBottom: '1.5rem', lineHeight: 1.6 }}>
              {$('DASH_WELCOME_BODY', locale)}
            </p>
            <button
              type="button"
              className="btn btn--primary btn--large"
              onClick={() => navigate('/patient/onboarding')}
            >
              {$('DASH_COMPLETE_PROFILE_BTN', locale)}
            </button>
          </div>
        ) : (
          <div className="card greeting-card">
            <h2>{$('DASH_GREETING_PREFIX', locale)} {patient.name}</h2>
            <p className="muted">{$('DASH_WEEK_LABEL', locale)} <strong>{patient.gestational_week || 'N/A'}</strong></p>
            {patient.lmp_recorded_date != null && patient.initial_gestational_week != null && (
              <p className="muted" style={{ fontSize: '12px', marginTop: '0.25rem' }}>
                {$('PREG_WEEK_INITIAL', locale).replace('$W', patient.initial_gestational_week)}{' '}
                {new Date(patient.lmp_recorded_date).toLocaleDateString(
                  locale === 'bn' ? 'bn-BD' : 'en-GB',
                  { day: 'numeric', month: 'short', year: 'numeric' }
                )}
              </p>
            )}
            <span className={`badge badge--${(patient.risk_level || 'low').toLowerCase()}`} style={{ marginTop: '0.5rem' }}>
              {(patient.risk_level || 'Low').charAt(0).toUpperCase() + (patient.risk_level || 'low').slice(1)} {$('W_DETAILS_RISK_SUFFIX', locale)}
            </span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="section-header" style={{ marginTop: '1.5rem' }}>
          <h3>{$('DASH_SECTION_QUICK_ACTIONS', locale)}</h3>
        </div>
        <div className="grid two">
          <Link to="/patient/daily-check" className="card action-card stagger" style={{ animationDelay: '0s' }}>
            <svg style={{ width: '40px', height: '40px', color: 'var(--color-primary)', marginBottom: '4px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h4>{$('DASH_ACTION_DAILY_TITLE', locale)}</h4>
            <p className="muted">{$('DASH_ACTION_DAILY_DESC', locale)}</p>
          </Link>
          <Link to="/patient/ai-chat" className="card action-card stagger" style={{ animationDelay: '0.1s' }}>
            <svg style={{ width: '40px', height: '40px', color: 'var(--color-secondary)', marginBottom: '4px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <h4>{$('DASH_ACTION_AI_TITLE', locale)}</h4>
            <p className="muted">{$('DASH_ACTION_AI_DESC', locale)}</p>
          </Link>
          <Link to="/patient/nutrition" className="card action-card stagger" style={{ animationDelay: '0.2s' }}>
            <svg style={{ width: '40px', height: '40px', color: 'var(--color-primary)', marginBottom: '4px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
            </svg>
            <h4>{$('DASH_ACTION_NUTRITION_TITLE', locale)}</h4>
            <p className="muted">{$('DASH_ACTION_NUTRITION_DESC', locale)}</p>
          </Link>
          <Link to="/patient/emergency" className="card action-card alert stagger" style={{ animationDelay: '0.3s' }}>
            <svg style={{ width: '40px', height: '40px', color: 'var(--color-danger)', marginBottom: '4px', animation: 'pulse 0.9s infinite' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h4>{$('DASH_ACTION_EMERGENCY_TITLE', locale)}</h4>
            <p className="muted">{$('DASH_ACTION_EMERGENCY_DESC', locale)}</p>
          </Link>
          <Link to="/patient/community-chat" className="card action-card stagger" style={{ animationDelay: '0.4s' }}>
            <svg style={{ width: '40px', height: '40px', color: 'var(--color-primary)', marginBottom: '4px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2v4l-4-4H7a2 2 0 0 1-2-2v-1M7 8a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9l-4 4v-4H7" />
            </svg>
            <h4>{$('DASH_ACTION_COMMUNITY_TITLE', locale)}</h4>
            <p className="muted">{$('DASH_ACTION_COMMUNITY_DESC', locale)}</p>
          </Link>
          <Link to="/patient/education" className="card action-card stagger" style={{ animationDelay: '0.5s' }}>
            <svg style={{ width: '40px', height: '40px', color: 'var(--color-primary)', marginBottom: '4px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h4>{$('DASH_ACTION_EDUCATION_TITLE', locale)}</h4>
            <p className="muted">{$('DASH_ACTION_EDUCATION_DESC', locale)}</p>
          </Link>
        </div>

        <div className="section-header" style={{ marginTop: '1.5rem' }}>
          <h3>{$('DASH_SECTION_HEALTH_SUMMARY', locale)}</h3>
        </div>
        <div className="card">
          <div className="summary-grid">
            <div className="kpi-card">
              <span className="muted">{$('DASH_KPI_BP', locale)}</span>
              <span className={latestVitals ? "kpi" : "kpi-empty"}>
                {latestVitals ? `${latestVitals.bp_systolic}/${latestVitals.bp_diastolic}` : 'N/A'}
              </span>
            </div>
            <div className="kpi-card">
              <span className="muted">{$('DASH_KPI_WEIGHT', locale)}</span>
              <span className={latestVitals?.weight_kg ? "kpi" : "kpi-empty"}>
                {latestVitals?.weight_kg ? `${latestVitals.weight_kg} kg` : 'N/A'}
              </span>
            </div>
            <div className="kpi-card">
              <span className={latestVitals?.temperature_c ? "muted" : "muted"}>{$('DASH_KPI_TEMP', locale)}</span>
              <span className={latestVitals?.temperature_c ? "kpi" : "kpi-empty"}>
                {latestVitals?.temperature_c ? `${latestVitals.temperature_c} °C` : 'N/A'}
              </span>
            </div>
            <div className="kpi-card">
              <span className="muted">{$('DASH_KPI_LAST_CHECKUP', locale)}</span>
              <span className={latestVitals ? "kpi" : "kpi-empty"}>
                {latestVitals ? formatDate(latestVitals.recorded_at) : $('DASH_KPI_NO_RECORDS', locale)}
              </span>
            </div>
          </div>
          {patient && (
            <div style={{ marginTop: '1rem', textAlign: 'right' }}>
              <Link to="/patient/records" className="btn btn--ghost" style={{ fontSize: '0.85rem' }}>
                {$('DASH_VIEW_ALL_RECORDS', locale)}
              </Link>
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  )
}
