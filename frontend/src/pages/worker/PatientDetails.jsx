import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import MobileLayout from '../../components/layout/MobileLayout'
import * as api from '../../services/api'

const workerNavItems = [
  { label: 'Home', to: '/worker/dashboard', icon: '' },
  { label: 'Patients', to: '/worker/patients', icon: '' },
  { label: 'AI', to: '/worker/ai-analysis', icon: '' },
  { label: 'Sync', to: '/worker/sync', icon: '' },
  { label: 'Profile', to: '/worker/profile', icon: '' },
]

const tabs = ['Overview', 'Vitals', 'AI Insights', 'History']

export default function PatientDetails() {
  const { id } = useParams()
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
      <MobileLayout title="Patient Details" navItems={workerNavItems}>
        <p className="muted" style={{ textAlign: 'center', padding: '3rem 0' }}>Loading patient...</p>
      </MobileLayout>
    )
  }

  if (!patient) {
    return (
      <MobileLayout title="Patient Details" navItems={workerNavItems}>
        <p className="muted" style={{ textAlign: 'center', padding: '3rem 0' }}>Patient not found</p>
      </MobileLayout>
    )
  }

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '??'
  const riskLevel = patient.risk_level || 'low'
  const riskScore = patient.risk_score || 0

  return (
    <MobileLayout title="Patient Details" navItems={workerNavItems}>
      {/* ── Patient Header ── */}
      <section className="card animate-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div className="avatar large">{getInitials(patient.name)}</div>
          <div>
            <h3 style={{ margin: 0 }}>{patient.name}</h3>
            <p className="muted">Age: {patient.age || '—'} • Week {patient.gestational_week || '—'}</p>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`tab${activeTab === tab ? ' active' : ''}`}
              type="button"
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {activeTab === 'Overview' && (
          <div className="animate-fade-in">
            <div className="card-row">
              <div>
                <p className="muted">Pregnancy Week</p>
                <div className="kpi">{patient.gestational_week || '—'}</div>
              </div>
              <span className={`badge badge--${riskLevel}`}>
                {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
              </span>
            </div>

            {latestVitals && (
              <div className="summary-grid">
                <div>
                  <p className="muted">Blood Pressure</p>
                  <strong>{latestVitals.bp_systolic}/{latestVitals.bp_diastolic}</strong>
                </div>
                <div>
                  <p className="muted">Weight</p>
                  <strong>{latestVitals.weight_kg || '—'} kg</strong>
                </div>
                <div>
                  <p className="muted">Pulse</p>
                  <strong>{latestVitals.pulse || '—'} bpm</strong>
                </div>
                <div>
                  <p className="muted">Temperature</p>
                  <strong>{latestVitals.temperature_c || '—'}°C</strong>
                </div>
              </div>
            )}

            {riskLevel === 'high' && (
              <div className="alert-panel">
                <strong>High Risk Alert</strong>
                <p className="muted">
                  Patient shows elevated BP ({latestVitals?.bp_systolic}/{latestVitals?.bp_diastolic}).
                  Risk score: {(riskScore * 100).toFixed(0)}% — recommend immediate clinical referral.
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
            <h4>Vitals History</h4>
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
                <p className="muted" style={{ textAlign: 'center', padding: '1rem 0' }}>No vitals recorded yet</p>
              )}
            </div>
          </div>
        )}

        {/* ── AI Insights Tab ── */}
        {activeTab === 'AI Insights' && (
          <div className="animate-fade-in">
            <h4>Risk Assessment</h4>
            <div className="card-row">
              <div>
                <p className="muted">AI Risk Score</p>
                <div className="kpi" style={{
                  color: (aiResult?.risk_score || riskScore) >= 0.7 ? '#ef4444' : (aiResult?.risk_score || riskScore) >= 0.3 ? '#f59e0b' : '#10b981'
                }}>
                  {(((aiResult?.risk_score || riskScore)) * 100).toFixed(0)}%
                </div>
              </div>
              <span className={`badge badge--${aiResult?.risk_level || riskLevel}`}>
                {(aiResult?.risk_level || riskLevel).charAt(0).toUpperCase() + (aiResult?.risk_level || riskLevel).slice(1)} Risk
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
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            )}

            {aiResult?.preeclampsia_flag && (
              <div className="alert-panel" style={{ marginTop: '1rem' }}>
                <strong style={{ color: '#ef4444' }}>Preeclampsia Flag</strong>
                <p className="muted">AI model has flagged potential preeclampsia risk. Immediate clinical referral recommended.</p>
              </div>
            )}

            <p className="muted" style={{ marginTop: '1rem', fontSize: '0.8rem' }}>
              Model: {aiResult?.model || 'Not yet analyzed'} • Click "Run AI Analysis" below to get fresh prediction
            </p>
          </div>
        )}

        {/* ── History Tab ── */}
        {activeTab === 'History' && (
          <div className="animate-fade-in">
            <h4>Visit History</h4>
            <div className="list stagger">
              {history.slice(0, 5).map((v, i) => (
                <div className="list-item" key={v.id || i}>
                  <div>
                    <strong>{new Date(v.recorded_at).toLocaleDateString()}</strong>
                    <p className="muted">{patient.village || 'Village'} • Recorded by {v.recorded_by_name || 'Worker'}</p>
                  </div>
                  <span className="badge badge--online">Complete</span>
                </div>
              ))}
              {history.length === 0 && (
                <p className="muted" style={{ textAlign: 'center', padding: '1rem 0' }}>No visit history</p>
              )}
            </div>
            <p className="muted" style={{ marginTop: '1rem', textAlign: 'center' }}>
              Assigned Worker: {patient.worker_name || '—'}
            </p>
          </div>
        )}
      </section>

      {/* ── Action Buttons ── */}
      <div className="button-row animate-fade-in">
        <Link className="btn btn--primary" to={`/worker/vitals/${patient.id}`}>
          Record Vitals
        </Link>
        <button className="btn btn--secondary" type="button" onClick={handleRunAI}>
          Run AI Analysis
        </button>
      </div>
    </MobileLayout>
  )
}
