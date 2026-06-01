import { useState, useEffect } from 'react'
import MobileLayout from '../../components/layout/MobileLayout'
import { useApp } from '../../context/AppContext'
import { workerNavItems } from '../../data/navItems'
import * as api from '../../services/api'
import $ from '../../config/strings'

export default function AIAnalysis() {
  const { locale } = useApp()
  const [patients, setPatients] = useState(undefined)
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

    const patient = (patients || []).find(p => p.id === selectedPatient)

    // Get latest vitals for prediction
    const patientData = await api.getPatient(selectedPatient)
    const vitals = patientData?.latestVitals

    let pred;
    if (vitals) {
      pred = await api.aiPredict({
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
    const sum = await api.aiSummary(selectedPatient, pred, {
      bp_systolic: parseInt(vitals.bp_systolic),
      bp_diastolic: parseInt(vitals.bp_diastolic),
      weight_kg: parseFloat(vitals.weight_kg) || 60.0,
      temperature_c: parseFloat(vitals.temperature_c) || 36.7,
      pulse: parseInt(vitals.pulse) || 78,
      gestational_week: parseInt(patient?.gestational_week) || 24,
      symptoms: vitals.symptoms || [],
      visit_frequency_delta: parseFloat(vitals.visit_frequency_delta) || 7.0
    });

    setSummary(sum)
    setAnalyzing(false)
  }

  const selectedName = (patients || []).find(p => p.id === selectedPatient)?.name || $('W_AI_PH_SELECT', locale)

  return (
    <MobileLayout title={$('W_PAGE_TITLE_AI', locale)} navItems={workerNavItems(locale)}>
      <section className="card animate-fade-in">
        <h3>{$('W_AI_HEADING', locale)}</h3>
        <div className="form-grid" style={{ marginBottom: '1rem' }}>
          <label>
            {$('W_AI_LABEL_SELECT', locale)}
            <select className="input" value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)}>
              <option value="">{$('W_AI_PH_SELECT', locale)}</option>
              {(patients || []).map(p => (
                <option key={p.id} value={p.id}>{p.name}, {$('W_PATIENTS_WEEK_PREFIX', locale)} {p.gestational_week || '?'}</option>
              ))}
            </select>
          </label>
        </div>
        <button type="button" className="btn btn--primary" onClick={handleAnalyze} disabled={!selectedPatient || analyzing}>
          {analyzing ? $('W_AI_BTN_ANALYZING', locale) : $('W_AI_BTN_ANALYZE', locale)}
        </button>
      </section>

      {prediction && (
        <section className="card animate-fade-in" style={{ animationDelay: '80ms' }}>
          <h3>{$('W_AI_RISK_HEADING_PREFIX', locale)} {selectedName}</h3>
          <div className="card-row">
            <div>
              <p className="muted">{$('W_AI_RISK_SCORE_LABEL', locale)}</p>
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
              <strong style={{ color: '#ef4444' }}>{$('W_AI_PREECLAMPSIA_TITLE', locale)}</strong>
              <p className="muted">{$('W_AI_PREECLAMPSIA_BODY', locale)}</p>
            </div>
          )}
          {prediction.factors?.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <p className="muted">{$('W_AI_FACTORS_LABEL', locale)}</p>
              <div className="chip-row">
                {prediction.factors.map((f) => <span key={f} className="chip">{f}</span>)}
              </div>
            </div>
          )}
          <p className="muted" style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>{$('W_AI_MODEL_PREFIX', locale)} {prediction.model}</p>
        </section>
      )}

      {summary && (
        <section className="card animate-fade-in" style={{ animationDelay: '160ms' }}>
          <h3>{$('W_AI_SUMMARY_HEADING', locale)}</h3>
          <div className="alert-panel">
            <strong>{$('W_AI_SUMMARY_LABEL', locale)}</strong>
            <p className="muted">{summary.summary}</p>
          </div>
          {summary.recommendations?.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <h4>{$('W_AI_RECOMMENDATIONS_HEADING', locale)}</h4>
              <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.8 }}>
                {summary.recommendations.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </div>
          )}
          {summary.sources && (
            <p className="muted" style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
              {$('W_AI_SOURCES_PREFIX', locale)} {summary.sources.join(', ')}
            </p>
          )}
        </section>
      )}
    </MobileLayout>
  )
}
