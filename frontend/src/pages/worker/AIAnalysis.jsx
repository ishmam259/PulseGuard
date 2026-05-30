import { useState, useEffect } from 'react'
import MobileLayout from '../../components/layout/MobileLayout'
import * as api from '../../services/api'
import { useLocale } from '../../context/LocaleContext'

export default function AIAnalysis() {
  const { t, n } = useLocale()
  const [patients, setPatients] = useState(undefined)
  const [selectedPatient, setSelectedPatient] = useState('')
  const [prediction, setPrediction] = useState(null)
  const [summary, setSummary] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)

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

  const selectedName = (patients || []).find(p => p.id === selectedPatient)?.name || t('AI_SELECT_PATIENT_FALLBACK')

  return (
    <MobileLayout title={t('AI_PAGE_TITLE')} navItems={workerNavItems}>
      <section className="card animate-fade-in">
        <h3>{t('AI_RISK_ASSESSMENT_HEADING')}</h3>
        <div className="form-grid" style={{ marginBottom: '1rem' }}>
          <label>
            {t('AI_SELECT_PATIENT_LABEL')}
            <select className="input" value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)}>
              <option value="">{t('AI_CHOOSE_PATIENT')}</option>
              {(patients || []).map(p => (
                <option key={p.id} value={p.id}>{p.name}, {t('WEEK')} {p.gestational_week ? n(p.gestational_week) : '?'}</option>
              ))}
            </select>
          </label>
        </div>
        <button type="button" className="btn btn--primary" onClick={handleAnalyze} disabled={!selectedPatient || analyzing}>
          {analyzing ? t('AI_ANALYZING') : t('AI_RUN_ANALYSIS')}
        </button>
      </section>

      {prediction && (
        <section className="card animate-fade-in" style={{ animationDelay: '80ms' }}>
          <h3>{t('AI_RISK_PREDICTION')} {selectedName}</h3>
          <div className="card-row">
            <div>
              <p className="muted">{t('AI_RISK_SCORE')}</p>
              <div className="kpi" style={{
                color: prediction.risk_score >= 0.7 ? '#ef4444' : prediction.risk_score >= 0.3 ? '#f59e0b' : '#10b981'
              }}>
                {n((prediction.risk_score * 100).toFixed(0))}%
              </div>
            </div>
            <span className={`badge badge--${prediction.risk_level}`}>
              {t('RISK_' + prediction.risk_level.toUpperCase())} {t('RISK_SUFFIX')}
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
              <strong style={{ color: '#ef4444' }}>{t('AI_PREECLAMPSIA_FLAG')}</strong>
              <p className="muted">{t('AI_PREECLAMPSIA_FLAG_DESC')}</p>
            </div>
          )}
          {prediction.factors?.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <p className="muted">{t('AI_CONTRIBUTING_FACTORS')}</p>
              <div className="chip-row">
                {prediction.factors.map((f) => <span key={f} className="chip">{f}</span>)}
              </div>
            </div>
          )}
          <p className="muted" style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>{t('AI_MODEL_LABEL')} {prediction.model}</p>
        </section>
      )}

      {summary && (
        <section className="card animate-fade-in" style={{ animationDelay: '160ms' }}>
          <h3>{t('AI_LONGITUDINAL_SUMMARY')}</h3>
          <div className="alert-panel">
            <strong>{t('AI_ASSESSMENT')}</strong>
            <p className="muted">{summary.summary}</p>
          </div>
          {summary.recommendations?.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <h4>{t('AI_RECOMMENDATIONS')}</h4>
              <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.8 }}>
                {summary.recommendations.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </div>
          )}
          {summary.sources && (
            <p className="muted" style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
              {t('AI_SOURCES')} {summary.sources.join(', ')}
            </p>
          )}
        </section>
      )}
    </MobileLayout>
  )
}
