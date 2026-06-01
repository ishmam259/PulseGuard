import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import MobileLayout from '../../components/layout/MobileLayout'
import { useApp } from '../../context/AppContext'
import { workerNavItems } from '../../data/navItems'
import * as api from '../../services/api'
import $ from '../../config/strings'

export default function PatientDetails() {
  const { id } = useParams()
  const { locale } = useApp()

  // Tab values stay in English internally for logic
  const TABS = ['Overview', 'Vitals', 'AI Insights', 'History']
  const tabLabels = {
    'Overview':    () => $('W_DETAILS_TAB_OVERVIEW', locale),
    'Vitals':      () => $('W_DETAILS_TAB_VITALS', locale),
    'AI Insights': () => $('W_DETAILS_TAB_AI', locale),
    'History':     () => $('W_DETAILS_TAB_HISTORY', locale),
  }

  const [activeTab, setActiveTab] = useState('Overview')
  const [patient, setPatient] = useState(null)
  const [latestVitals, setLatestVitals] = useState(null)
  const [history, setHistory] = useState([])
  const [aiResult, setAiResult] = useState(null)
  const [loading, setLoading] = useState(true)

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
      <MobileLayout title={$('W_PAGE_TITLE_PATIENT_DETAILS', locale)} navItems={workerNavItems(locale)}>
        <p className="muted" style={{ textAlign: 'center', padding: '3rem 0' }}>{$('W_DETAILS_LOADING', locale)}</p>
      </MobileLayout>
    )
  }

  if (!patient) {
    return (
      <MobileLayout title={$('W_PAGE_TITLE_PATIENT_DETAILS', locale)} navItems={workerNavItems(locale)}>
        <p className="muted" style={{ textAlign: 'center', padding: '3rem 0' }}>{$('W_DETAILS_NOT_FOUND', locale)}</p>
      </MobileLayout>
    )
  }

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '??'
  const riskLevel = patient.risk_level || 'low'
  const riskScore = patient.risk_score || 0

  return (
    <MobileLayout title={$('W_PAGE_TITLE_PATIENT_DETAILS', locale)} navItems={workerNavItems(locale)}>
      {/* ── Patient Header ── */}
      <section className="card animate-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div className="avatar large">{getInitials(patient.name)}</div>
          <div>
            <h3 style={{ margin: 0 }}>{patient.name}</h3>
            <p className="muted">{$('W_DETAILS_AGE_PREFIX', locale)} {patient.age || '—'} • {$('W_DETAILS_WEEK_PREFIX', locale)} {patient.gestational_week || '—'}</p>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`tab${activeTab === tab ? ' active' : ''}`}
              type="button"
              onClick={() => setActiveTab(tab)}
            >
              {tabLabels[tab]()}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {activeTab === 'Overview' && (
          <div className="animate-fade-in">
            <div className="card-row">
              <div>
                <p className="muted">{$('W_DETAILS_PREG_WEEK', locale)}</p>
                <div className="kpi">{patient.gestational_week || '—'}</div>
              </div>
              <span className={`badge badge--${riskLevel}`}>
                {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} {$('W_DETAILS_RISK_SUFFIX', locale)}
              </span>
            </div>

            {latestVitals && (
              <div className="summary-grid">
                <div>
                  <p className="muted">{$('W_DETAILS_BP', locale)}</p>
                  <strong>{latestVitals.bp_systolic}/{latestVitals.bp_diastolic}</strong>
                </div>
                <div>
                  <p className="muted">{$('W_DETAILS_WEIGHT', locale)}</p>
                  <strong>{latestVitals.weight_kg || '—'} kg</strong>
                </div>
                <div>
                  <p className="muted">{$('W_DETAILS_PULSE', locale)}</p>
                  <strong>{latestVitals.pulse || '—'} bpm</strong>
                </div>
                <div>
                  <p className="muted">{$('W_DETAILS_TEMPERATURE', locale)}</p>
                  <strong>{latestVitals.temperature_c || '—'}°C</strong>
                </div>
              </div>
            )}

            {riskLevel === 'high' && (
              <div className="alert-panel">
                <strong>{$('W_DETAILS_HIGH_RISK_ALERT', locale)}</strong>
                <p className="muted">
                  Patient shows elevated BP ({latestVitals?.bp_systolic}/{latestVitals?.bp_diastolic}).
                  Risk score: {(riskScore * 100).toFixed(0)}%; recommend immediate clinical referral.
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
            <h4>{$('W_DETAILS_VITALS_HEADING', locale)}</h4>
            <div className="list stagger">
              {history.map((v, i) => (
                <div className="list-item" key={v.id || i}>
                  <div>
                    <strong>{new Date(v.recorded_at).toLocaleDateString()}</strong>
                    <p className="muted">
                      BP: {v.bp_systolic}/{v.bp_diastolic} • Weight: {v.weight_kg}kg • Pulse: {v.pulse}
                    </p>
                  </div>
                  <span
                    className={`badge badge--${
                      v.risk_score >= 0.7 ? 'high' : v.risk_score >= 0.3 ? 'moderate' : 'low'
                    }`}
                  >
                    Risk: {((v.risk_score || 0) * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
              {history.length === 0 && (
                <p className="muted" style={{ textAlign: 'center', padding: '1rem 0' }}>{$('W_DETAILS_VITALS_EMPTY', locale)}</p>
              )}
            </div>
          </div>
        )}

        {/* ── AI Insights Tab ── */}
        {activeTab === 'AI Insights' && (
          <div className="animate-fade-in">
            <h4>{$('W_DETAILS_AI_HEADING', locale)}</h4>
            <div className="card-row">
              <div>
                <p className="muted">{$('W_DETAILS_AI_RISK_SCORE', locale)}</p>
                <div className="kpi" style={{
                  color: (aiResult?.risk_score || riskScore) >= 0.7 ? '#ef4444' : (aiResult?.risk_score || riskScore) >= 0.3 ? '#f59e0b' : '#10b981'
                }}>
                  {(((aiResult?.risk_score || riskScore)) * 100).toFixed(0)}%
                </div>
              </div>
              <span className={`badge badge--${aiResult?.risk_level || riskLevel}`}>
                {(aiResult?.risk_level || riskLevel).charAt(0).toUpperCase() + (aiResult?.risk_level || riskLevel).slice(1)} {$('W_DETAILS_RISK_SUFFIX', locale)}
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
                <h4> Risk Factors</h4>
                <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.8 }}>
                  {aiResult.factors.map((f, i) => (
                    <li key={`factor-${i}-${f}`}>{f}</li>
                  ))}
                </ul>
              </div>
            )}

            {aiResult?.preeclampsia_flag && (
              <div className="alert-panel" style={{ marginTop: '1rem' }}>
                <strong style={{ color: '#ef4444' }}>{$('W_DETAILS_AI_PREECLAMPSIA_TITLE', locale)}</strong>
                <p className="muted">{$('W_DETAILS_AI_PREECLAMPSIA_BODY', locale)}</p>
              </div>
            )}

            <p className="muted" style={{ marginTop: '1rem', fontSize: '0.8rem' }}>
              {$('W_DETAILS_AI_MODEL_PREFIX', locale)} {aiResult?.model || $('W_DETAILS_AI_NOT_YET', locale)} • {$('W_DETAILS_AI_MODEL_SUFFIX', locale)}
            </p>
          </div>
        )}

        {/* ── History Tab ── */}
        {activeTab === 'History' && (
          <div className="animate-fade-in">
            <h4>{$('W_DETAILS_HISTORY_HEADING', locale)}</h4>
            <div className="list stagger">
              {history.slice(0, 5).map((v, i) => (
                <div className="list-item" key={v.id || i}>
                  <div>
                    <strong>{new Date(v.recorded_at).toLocaleDateString()}</strong>
                    <p className="muted">{patient.village || 'Village'} • {$('W_DETAILS_HISTORY_VILLAGE_PREFIX', locale)} {v.recorded_by_name || 'Worker'}</p>
                  </div>
                  <span className="badge badge--online">{$('W_DETAILS_HISTORY_COMPLETE', locale)}</span>
                </div>
              ))}
              {history.length === 0 && (
                <p className="muted" style={{ textAlign: 'center', padding: '1rem 0' }}>{$('W_DETAILS_HISTORY_EMPTY', locale)}</p>
              )}
            </div>
            <p className="muted" style={{ marginTop: '1rem', textAlign: 'center' }}>
              {$('W_DETAILS_HISTORY_WORKER_PREFIX', locale)} {patient.worker_name || '—'}
            </p>
          </div>
        )}
      </section>

      {/* ── Action Buttons ── */}
      <div className="button-row animate-fade-in">
        <Link className="btn btn--primary" to={`/worker/vitals/${patient.id}`}>
          {$('W_DETAILS_BTN_RECORD_VITALS', locale)}
        </Link>
        <button className="btn btn--secondary" type="button" onClick={handleRunAI}>
          {$('W_DETAILS_BTN_RUN_AI', locale)}
        </button>
      </div>
    </MobileLayout>
  )
}
