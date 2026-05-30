import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import MobileLayout from '../../components/layout/MobileLayout'
import * as api from '../../services/api'
import { useLocale } from '../../context/LocaleContext'

export default function PatientDetails() {
  const { id } = useParams()
  const { t, n } = useLocale()
  const [activeTab, setActiveTab] = useState('Overview')
  const [patient, setPatient] = useState(null)
  const [latestVitals, setLatestVitals] = useState(null)
  const [history, setHistory] = useState([])
  const [aiResult, setAiResult] = useState(null)
  const [loading, setLoading] = useState(true)

  const workerNavItems = [
    { label: t('NAV_HOME'), to: '/worker/dashboard', icon: '' },
    { label: t('NAV_PATIENTS'), to: '/worker/patients', icon: '' },
    { label: t('NAV_AI'), to: '/worker/ai-analysis', icon: '' },
    { label: t('NAV_SYNC'), to: '/worker/sync', icon: '' },
    { label: t('NAV_PROFILE'), to: '/worker/profile', icon: '' },
  ]

  const tabItems = [
    { key: 'Overview', label: t('PATIENT_TAB_OVERVIEW') },
    { key: 'Vitals', label: t('PATIENT_TAB_VITALS') },
    { key: 'AI Insights', label: t('PATIENT_TAB_AI_INSIGHTS') },
    { key: 'History', label: t('PATIENT_TAB_HISTORY') },
  ]

  useEffect(() => {
    const load = async () => {
      const data = await api.getPatient(id)
      if (data) {
        setPatient(data.patient)
        setLatestVitals(data.latestVitals)
      }
      const hist = await api.getHistory(id)
      setHistory(hist)
      setLoading(false)
    }
    load()
  }, [id])

  const handleRunAI = async () => {
    if (!latestVitals) return
    const result = await api.aiPredict({
      bp_systolic: latestVitals.bp_systolic,
      bp_diastolic: latestVitals.bp_diastolic,
      weight_kg: latestVitals.weight_kg,
      temperature_c: latestVitals.temperature_c,
      pulse: latestVitals.pulse,
      symptoms: latestVitals.symptoms || [],
      gestational_week: patient?.gestational_week || 24,
    })
    setAiResult(result)
    setActiveTab('AI Insights')
  }

  if (loading) {
    return (
      <MobileLayout title={t('PATIENT_DETAILS_TITLE')} navItems={workerNavItems}>
        <p className="muted" style={{ textAlign: 'center', padding: '3rem 0' }}>{t('PATIENT_LOADING')}</p>
      </MobileLayout>
    )
  }

  if (!patient) {
    return (
      <MobileLayout title={t('PATIENT_DETAILS_TITLE')} navItems={workerNavItems}>
        <p className="muted" style={{ textAlign: 'center', padding: '3rem 0' }}>{t('PATIENT_NOT_FOUND')}</p>
      </MobileLayout>
    )
  }

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '??'
  const riskLevel = patient.risk_level || 'low'
  const riskScore = patient.risk_score || 0

  return (
    <MobileLayout title={t('PATIENT_DETAILS_TITLE')} navItems={workerNavItems}>
      {/* ── Patient Header ── */}
      <section className="card animate-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div className="avatar large">{getInitials(patient.name)}</div>
          <div>
            <h3 style={{ margin: 0 }}>{patient.name}</h3>
            <p className="muted">{t('PATIENT_AGE_LABEL')} {patient.age ? n(patient.age) : '—'} • {t('WEEK')} {patient.gestational_week ? n(patient.gestational_week) : '—'}</p>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="tabs">
          {tabItems.map((tab) => (
            <button
              key={tab.key}
              className={`tab${activeTab === tab.key ? ' active' : ''}`}
              type="button"
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {activeTab === 'Overview' && (
          <div className="animate-fade-in">
            <div className="card-row">
              <div>
                <p className="muted">{t('PATIENT_PREGNANCY_WEEK')}</p>
                <div className="kpi">{patient.gestational_week ? n(patient.gestational_week) : '—'}</div>
              </div>
              <span className={`badge badge--${riskLevel}`}>
                {t('RISK_' + riskLevel.toUpperCase())} {t('RISK_SUFFIX')}
              </span>
            </div>

            {latestVitals && (
              <div className="summary-grid">
                <div>
                  <p className="muted">{t('PATIENT_BLOOD_PRESSURE')}</p>
                  <strong>{n(latestVitals.bp_systolic)}/{n(latestVitals.bp_diastolic)}</strong>
                </div>
                <div>
                  <p className="muted">{t('PATIENT_WEIGHT')}</p>
                  <strong>{latestVitals.weight_kg ? n(latestVitals.weight_kg) : '—'} {t('PATIENT_WEIGHT_UNIT')}</strong>
                </div>
                <div>
                  <p className="muted">{t('PATIENT_PULSE')}</p>
                  <strong>{latestVitals.pulse ? n(latestVitals.pulse) : '—'} {t('PATIENT_PULSE_UNIT')}</strong>
                </div>
                <div>
                  <p className="muted">{t('PATIENT_TEMPERATURE')}</p>
                  <strong>{latestVitals.temperature_c ? n(latestVitals.temperature_c) : '—'}{t('PATIENT_TEMPERATURE_UNIT')}</strong>
                </div>
              </div>
            )}

            {riskLevel === 'high' && (
              <div className="alert-panel">
                <strong>{t('PATIENT_HIGH_RISK_ALERT_TITLE')}</strong>
                <p className="muted">
                  {t('PATIENT_HIGH_RISK_ALERT_DESC', { bp: `${latestVitals?.bp_systolic}/${latestVitals?.bp_diastolic}`, score: (riskScore * 100).toFixed(0) })}
                </p>
              </div>
            )}

            {latestVitals?.symptoms?.length > 0 && (
              <div className="chip-row" style={{ marginTop: '1rem' }}>
                {latestVitals.symptoms.map((s) => (
                  <span key={s} className="chip">{s}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Vitals Tab ── */}
        {activeTab === 'Vitals' && (
          <div className="animate-fade-in">
            <h4>{t('PATIENT_VITALS_HISTORY')}</h4>
            <div className="list stagger">
              {history.map((v, i) => (
                <div className="list-item" key={v.id || i}>
                  <div>
                    <strong>{n(new Date(v.recorded_at).toLocaleDateString())}</strong>
                    <p className="muted">
                      {t('PATIENT_VITALS_BP')} {n(v.bp_systolic)}/{n(v.bp_diastolic)} • {t('PATIENT_VITALS_WEIGHT')} {v.weight_kg ? n(v.weight_kg) : '—'}{t('PATIENT_WEIGHT_UNIT')} • {t('PATIENT_VITALS_PULSE')} {v.pulse ? n(v.pulse) : '—'}
                    </p>
                  </div>
                  <span
                    className={`badge badge--${
                      v.risk_score >= 0.7 ? 'high' : v.risk_score >= 0.3 ? 'moderate' : 'low'
                    }`}
                  >
                    {t('PATIENT_VITALS_RISK')} {n(((v.risk_score || 0) * 100).toFixed(0))}%
                  </span>
                </div>
              ))}
              {history.length === 0 && (
                <p className="muted" style={{ textAlign: 'center', padding: '1rem 0' }}>{t('PATIENT_NO_VITALS')}</p>
              )}
            </div>
          </div>
        )}

        {/* ── AI Insights Tab ── */}
        {activeTab === 'AI Insights' && (
          <div className="animate-fade-in">
            <h4>{t('PATIENT_AI_RISK_ASSESSMENT')}</h4>
            <div className="card-row">
              <div>
                <p className="muted">{t('PATIENT_AI_RISK_SCORE')}</p>
                <div className="kpi" style={{
                  color: (aiResult?.risk_score || riskScore) >= 0.7 ? '#ef4444' : (aiResult?.risk_score || riskScore) >= 0.3 ? '#f59e0b' : '#10b981'
                }}>
                  {n((((aiResult?.risk_score || riskScore)) * 100).toFixed(0))}%
                </div>
              </div>
              <span className={`badge badge--${aiResult?.risk_level || riskLevel}`}>
                {t('RISK_' + (aiResult?.risk_level || riskLevel).toUpperCase())} {t('RISK_SUFFIX')}
              </span>
            </div>

            <div className="progress" style={{ marginTop: '1rem' }}>
              <div
                className="progress-bar"
                style={{
                  width: `${(aiResult?.risk_score || riskScore) * 100}%`,
                  background: (aiResult?.risk_score || riskScore) >= 0.7
                    ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                    : (aiResult?.risk_score || riskScore) >= 0.3
                    ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                    : 'linear-gradient(90deg, #10b981, #059669)',
                }}
              />
            </div>

            {aiResult?.factors?.length > 0 && (
              <div className="card" style={{ marginTop: '1rem' }}>
                <h4>{t('PATIENT_RISK_FACTORS')}</h4>
                <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.8 }}>
                  {aiResult.factors.map((f, i) => (
                    <li key={`factor-${i}-${f}`}>{f}</li>
                  ))}
                </ul>
              </div>
            )}

            {aiResult?.preeclampsia_flag && (
              <div className="alert-panel" style={{ marginTop: '1rem' }}>
                <strong style={{ color: '#ef4444' }}>{t('AI_PREECLAMPSIA_FLAG')}</strong>
                <p className="muted">{t('PATIENT_AI_PREECLAMPSIA_DESC')}</p>
              </div>
            )}

            <p className="muted" style={{ marginTop: '1rem', fontSize: '0.8rem' }}>
              {t('AI_MODEL_LABEL')} {aiResult?.model || t('PATIENT_NOT_ANALYZED')} • {t('PATIENT_RUN_HINT')}
            </p>
          </div>
        )}

        {/* ── History Tab ── */}
        {activeTab === 'History' && (
          <div className="animate-fade-in">
            <h4>{t('PATIENT_VISIT_HISTORY')}</h4>
            <div className="list stagger">
              {history.slice(0, 5).map((v, i) => (
                <div className="list-item" key={v.id || i}>
                  <div>
                    <strong>{n(new Date(v.recorded_at).toLocaleDateString())}</strong>
                    <p className="muted">{patient.village || t('PATIENT_VILLAGE_FALLBACK')} • {t('PATIENT_RECORDED_BY')} {v.recorded_by_name || t('PATIENT_WORKER_FALLBACK')}</p>
                  </div>
                  <span className="badge badge--online">{t('PATIENT_COMPLETE_BADGE')}</span>
                </div>
              ))}
              {history.length === 0 && (
                <p className="muted" style={{ textAlign: 'center', padding: '1rem 0' }}>{t('PATIENT_NO_VISIT_HISTORY')}</p>
              )}
            </div>
            <p className="muted" style={{ marginTop: '1rem', textAlign: 'center' }}>
              {t('PATIENT_ASSIGNED_WORKER')} {patient.worker_name || '—'}
            </p>
          </div>
        )}
      </section>

      {/* ── Action Buttons ── */}
      <div className="button-row animate-fade-in">
        <Link className="btn btn--primary" to={`/worker/vitals/${patient.id}`}>
          {t('PATIENT_RECORD_VITALS')}
        </Link>
        <button className="btn btn--secondary" type="button" onClick={handleRunAI}>
          {t('PATIENT_RUN_AI_ANALYSIS')}
        </button>
      </div>
    </MobileLayout>
  )
}
