import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MobileLayout from '../../components/layout/MobileLayout'
import { useApp } from '../../context/AppContext'
import * as api from '../../services/api'
import { patientNavItems } from '../../data/navItems'
import $ from '../../config/strings'
import { formatDate } from '../../utils/date'
import { 
  Heart, 
  MessageCircle, 
  Sparkles, 
  AlertTriangle, 
  Users, 
  ArrowRight, 
  HeartPulse 
} from 'lucide-react'

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

  const riskLevelClass = (level) => {
    const l = (level || 'low').toLowerCase();
    if (l === 'high') return 'badge--high';
    if (l === 'moderate') return 'badge--moderate';
    return 'badge--low';
  }

  return (
    <MobileLayout
      title={$('PAGE_TITLE_DASHBOARD', locale)}
      status={connectivity}
      navItems={patientNavItems(locale)}
    >
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {loading ? (
          <div className="card text-center" style={{ padding: '3rem 2rem' }}>
            <p className="muted animate-pulse">{$('DASH_LOADING', locale)}</p>
          </div>
        ) : !patient ? (
          /* Profile incomplete welcome state */
          <div className="card card-highlight-left text-center" style={{ padding: '2.5rem 1.5rem' }}>
            <div className="mx-auto" style={{ display: 'grid', height: '64px', width: '64px', placeItems: 'center', borderRadius: '16px', background: 'var(--color-primary-dim)', color: 'var(--color-primary)', margin: '0 auto 1.5rem' }}>
              <HeartPulse style={{ height: '32px', width: '32px' }} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {$('DASH_WELCOME_HEADING_PREFIX', locale)} {currentUser?.name?.split(' ')[0] || 'Mother'}!
            </h2>
            <p className="muted" style={{ marginBottom: '1.5rem', lineHeight: 1.6, maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
              {$('DASH_WELCOME_BODY', locale)}
            </p>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => navigate('/patient/onboarding')}
            >
              {$('DASH_COMPLETE_PROFILE_BTN', locale)}
            </button>
          </div>
        ) : (
          /* Main welcome greeting card */
          <div className="card" style={{ position: 'relative', overflow: 'hidden', borderRadius: '24px', padding: '32px', backgroundColor: 'var(--color-surface)', border: '1px solid color-mix(in oklab, var(--color-primary) 6%, transparent)', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.01)' }}>
            <p className="muted" style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-muted)' }}>
              {$('DASH_GREETING_PREFIX', locale).trim()}
            </p>
            <h2 className="font-display" style={{ fontSize: '2.2rem', fontWeight: '700', marginTop: '8px', marginBottom: '8px', letterSpacing: '-0.01em', color: 'var(--color-text)' }}>
              {(() => {
                const name = patient.name;
                if (name.includes('Ishmam')) {
                  const parts = name.split('Ishmam');
                  return (
                    <>
                      {parts[0]}<span className="italic" style={{ color: 'var(--color-primary)', fontWeight: '700' }}>Ishmam</span>{parts[1]}
                    </>
                  );
                }
                const words = name.split(' ');
                if (words.length <= 1) return name;
                const lastWord = words[words.length - 1];
                const rest = words.slice(0, -1).join(' ');
                return (
                  <>
                    {rest} <span className="italic" style={{ color: 'var(--color-primary)', fontWeight: '700' }}>{lastWord}</span>
                  </>
                );
              })()}
            </h2>
            
            <div className="muted" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginBottom: '16px' }}>
              <span>
                {$('DASH_WEEK_LABEL', locale)} <strong style={{ color: 'var(--color-text)' }}>{patient.gestational_week || 'N/A'}</strong>
              </span>
              {patient.lmp_recorded_date != null && patient.initial_gestational_week != null && (
                <>
                  <span style={{ height: '4px', width: '4px', borderRadius: '50%', background: 'var(--color-border)' }} />
                  <span>
                    {$('PREG_WEEK_INITIAL', locale).replace('$W', patient.initial_gestational_week)}{' '}
                    {new Date(patient.lmp_recorded_date).toLocaleDateString(
                      locale === 'bn' ? 'bn-BD' : 'en-GB',
                      { day: 'numeric', month: 'short', year: 'numeric' }
                    )}
                  </span>
                </>
              )}
            </div>

            <span className={`badge ${riskLevelClass(patient.risk_level)}`} style={{ textTransform: 'uppercase', fontWeight: '700', fontSize: '11px', letterSpacing: '0.05em', display: 'inline-flex', alignItems: 'center', backgroundColor: 'var(--color-surface)', border: '1px solid', borderColor: 'currentColor', padding: '6px 12px', borderRadius: '9999px' }}>
              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', marginRight: '6px' }} />
              {(patient.risk_level || 'Low').toUpperCase()} {$('W_DETAILS_RISK_SUFFIX', locale).toUpperCase()}
            </span>
          </div>
        )}

        {/* Quick Actions */}
        <section>
          <div className="section-header">
            <h3 className="font-display">{$('DASH_SECTION_QUICK_ACTIONS', locale)}</h3>
          </div>
          <div className="grid two">
            
            {/* Daily check */}
            <Link to="/patient/daily-check" className="action-card">
              <div className="action-card-header">
                <div className="action-card-icon-wrapper">
                  <Heart style={{ height: '20px', width: '20px' }} />
                </div>
                <ArrowRight className="arrow-icon" style={{ height: '16px', width: '16px' }} />
              </div>
              <div>
                <h4 className="font-display" style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-text)' }}>
                  {$('DASH_ACTION_DAILY_TITLE', locale)}
                </h4>
                <p className="muted" style={{ marginTop: '4px', fontSize: '12px' }}>
                  {$('DASH_ACTION_DAILY_DESC', locale)}
                </p>
              </div>
            </Link>

            {/* AI Chat */}
            <Link to="/patient/ai-chat" className="action-card">
              <div className="action-card-header">
                <div className="action-card-icon-wrapper">
                  <MessageCircle style={{ height: '20px', width: '20px' }} />
                </div>
                <ArrowRight className="arrow-icon" style={{ height: '16px', width: '16px' }} />
              </div>
              <div>
                <h4 className="font-display" style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-text)' }}>
                  {$('DASH_ACTION_AI_TITLE', locale)}
                </h4>
                <p className="muted" style={{ marginTop: '4px', fontSize: '12px' }}>
                  {$('DASH_ACTION_AI_DESC', locale)}
                </p>
              </div>
            </Link>

            {/* Wellness (Nutrition/Water/Vomit) */}
            <Link to="/patient/wellness" className="action-card">
              <div className="action-card-header">
                <div className="action-card-icon-wrapper">
                  <Sparkles style={{ height: '20px', width: '20px' }} />
                </div>
                <ArrowRight className="arrow-icon" style={{ height: '16px', width: '16px' }} />
              </div>
              <div>
                <h4 className="font-display" style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-text)' }}>
                  {locale === 'en' ? 'Wellness Tracker' : 'ওয়েলনেস ট্র্যাকার'}
                </h4>
                <p className="muted" style={{ marginTop: '4px', fontSize: '12px' }}>
                  {$('DASH_ACTION_NUTRITION_DESC', locale)}
                </p>
              </div>
            </Link>

            {/* Emergency SOS */}
            <Link to="/patient/emergency" className="action-card alert">
              <div className="action-card-header">
                <div className="action-card-icon-wrapper" style={{ animation: 'pulse 1s infinite' }}>
                  <AlertTriangle style={{ height: '20px', width: '20px' }} />
                </div>
                <ArrowRight className="arrow-icon" style={{ height: '16px', width: '16px', color: 'var(--color-danger)' }} />
              </div>
              <div>
                <h4 className="font-display" style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-danger)' }}>
                  {$('DASH_ACTION_EMERGENCY_TITLE', locale)}
                </h4>
                <p className="muted" style={{ marginTop: '4px', fontSize: '12px', color: 'var(--color-danger-light)' }}>
                  {$('DASH_ACTION_EMERGENCY_DESC', locale)}
                </p>
              </div>
            </Link>

            {/* Community Chat */}
            <Link to="/patient/community-chat" className="action-card" style={{ gridColumn: 'span 2' }}>
              <div className="action-card-header">
                <div className="action-card-icon-wrapper">
                  <Users style={{ height: '20px', width: '20px' }} />
                </div>
                <ArrowRight className="arrow-icon" style={{ height: '16px', width: '16px' }} />
              </div>
              <div>
                <h4 className="font-display" style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-text)' }}>
                  {$('DASH_ACTION_COMMUNITY_TITLE', locale)}
                </h4>
                <p className="muted" style={{ marginTop: '4px', fontSize: '12px' }}>
                  {$('DASH_ACTION_COMMUNITY_DESC', locale)}
                </p>
              </div>
            </Link>

          </div>
        </section>

        {/* Health Summary */}
        <section>
          <div className="section-header">
            <h3 className="font-display">{$('DASH_SECTION_HEALTH_SUMMARY', locale)}</h3>
          </div>
          <div className="detail-cards-grid">
            
            {/* Blood Pressure */}
            <div className="detail-card">
              <p className="detail-card-label">
                {$('DASH_KPI_BP', locale)}
              </p>
              <p className="detail-card-value--accent">
                {latestVitals ? `${latestVitals.bp_systolic}/${latestVitals.bp_diastolic}` : 'N/A'}
              </p>
            </div>

            {/* Weight */}
            <div className="detail-card">
              <p className="detail-card-label">
                {$('DASH_KPI_WEIGHT', locale)}
              </p>
              <p className="detail-card-value--accent">
                {latestVitals?.weight_kg ? `${latestVitals.weight_kg} kg` : 'N/A'}
              </p>
            </div>

            {/* Temperature */}
            <div className="detail-card">
              <p className="detail-card-label">
                {$('DASH_KPI_TEMP', locale)}
              </p>
              <p className="detail-card-value--accent">
                {latestVitals?.temperature_c ? `${latestVitals.temperature_c} °C` : 'N/A'}
              </p>
            </div>

            {/* Last Checkup */}
            <div className="detail-card">
              <p className="detail-card-label">
                {$('DASH_KPI_LAST_CHECKUP', locale)}
              </p>
              <p className="detail-card-value--accent" style={{ lineBreak: 'anywhere' }}>
                {latestVitals ? formatDate(latestVitals.recorded_at) : $('DASH_KPI_NO_RECORDS', locale)}
              </p>
            </div>

          </div>

          {patient && (
            <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
              <Link 
                to="/patient/records" 
                className="btn btn--secondary"
              >
                <span>{$('DASH_VIEW_ALL_RECORDS', locale)}</span>
                <ArrowRight style={{ height: '14px', width: '14px' }} />
              </Link>
            </div>
          )}
        </section>
      </div>
    </MobileLayout>
  )
}
