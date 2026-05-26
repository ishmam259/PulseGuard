import { useState, useEffect } from 'react'
import MobileLayout from '../../components/layout/MobileLayout'
import * as api from '../../services/api'

const workerNavItems = [
  { label: 'Home', to: '/worker/dashboard', icon: '' },
  { label: 'Patients', to: '/worker/patients', icon: '' },
  { label: 'AI', to: '/worker/ai-analysis', icon: '' },
  { label: 'Sync', to: '/worker/sync', icon: '' },
  { label: 'Profile', to: '/worker/profile', icon: '' },
]

export default function AIAnalysis() {
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState('')
  const [prediction, setPrediction] = useState(null)
  const [summary, setSummary] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    const load = async () => {
      const data = await api.getPatients()
      setPatients(data)
    }
    load()
  }, [])

  const handleAnalyze = async () => {
    if (!selectedPatient) return
    setAnalyzing(true)
    setPrediction(null)
    setSummary(null)

    const patient = patients.find(p => p.id === selectedPatient)

    // Get latest vitals for prediction
    const patientData = await api.getPatient(selectedPatient)
    const vitals = patientData?.latestVitals

    if (vitals) {
      const pred = await api.aiPredict({
        bp_systolic: vitals.bp_systolic,
        bp_diastolic: vitals.bp_diastolic,
        weight_kg: vitals.weight_kg,
        temperature_c: vitals.temperature_c,
        pulse: vitals.pulse,
        symptoms: vitals.symptoms || [],
        gestational_week: patient?.gestational_week || 24,
      })
      setPrediction(pred)
    }

    // Get AI summary
    const sum = await api.aiSummary(selectedPatient)
    setSummary(sum)
    setAnalyzing(false)
  }

  const selectedName = patients.find(p => p.id === selectedPatient)?.name || 'Select a patient'

  return (
    <MobileLayout title="AI Analysis" navItems={workerNavItems}>
      <section className="card animate-fade-in">
        <h3>AI Risk Assessment</h3>
        <div className="form-grid" style={{ marginBottom: '1rem' }}>
          <label>
            Select Patient
            <select className="input" value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)}>
              <option value="">Choose patient...</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name} — Week {p.gestational_week || '?'}</option>
              ))}
            </select>
          </label>
        </div>
        <button className="btn btn--primary" onClick={handleAnalyze} disabled={!selectedPatient || analyzing}>
          {analyzing ? 'Analyzing...' : 'Run AI Analysis'}
        </button>
      </section>

      {prediction && (
        <section className="card animate-fade-in" style={{ animationDelay: '80ms' }}>
          <h3>Risk Prediction — {selectedName}</h3>
          <div className="card-row">
            <div>
              <p className="muted">Risk Score</p>
              <div className="kpi" style={{
                color: prediction.risk_score >= 0.7 ? '#ef4444' : prediction.risk_score >= 0.3 ? '#f59e0b' : '#10b981'
              }}>
                {(prediction.risk_score * 100).toFixed(0)}%
              </div>
            </div>
            <span className={`badge badge--${prediction.risk_level}`}>
              {prediction.risk_level.charAt(0).toUpperCase() + prediction.risk_level.slice(1)} Risk
            </span>
          </div>
          <div className="progress" style={{ marginTop: '1rem' }}>
            <div className="progress-bar" style={{
              width: `${prediction.risk_score * 100}%`,
              background: prediction.risk_score >= 0.7 ? 'linear-gradient(90deg, #ef4444, #dc2626)' : prediction.risk_score >= 0.3 ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 'linear-gradient(90deg, #10b981, #059669)',
            }} />
          </div>
          {prediction.preeclampsia_flag && (
            <div className="alert-panel" style={{ marginTop: '1rem' }}>
              <strong style={{ color: '#ef4444' }}>Preeclampsia Flag</strong>
              <p className="muted">AI model has flagged potential preeclampsia risk.</p>
            </div>
          )}
          {prediction.factors?.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <p className="muted">Contributing Factors:</p>
              <div className="chip-row">
                {prediction.factors.map((f, i) => <span key={i} className="chip">{f}</span>)}
              </div>
            </div>
          )}
          <p className="muted" style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>Model: {prediction.model}</p>
        </section>
      )}

      {summary && (
        <section className="card animate-fade-in" style={{ animationDelay: '160ms' }}>
          <h3>Longitudinal Summary</h3>
          <div className="alert-panel">
            <strong>AI Assessment</strong>
            <p className="muted">{summary.summary}</p>
          </div>
          {summary.recommendations?.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <h4>Recommendations</h4>
              <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.8 }}>
                {summary.recommendations.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}
          {summary.sources && (
            <p className="muted" style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
              Sources: {summary.sources.join(', ')}
            </p>
          )}
        </section>
      )}
    </MobileLayout>
  )
}
