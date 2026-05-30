import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MobileLayout from '../../components/layout/MobileLayout'
import * as api from '../../services/api'
import { useLocale } from '../../context/LocaleContext'

export default function VitalsEntry() {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const { t, n } = useLocale()
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(patientId || '')
  const [form, setForm] = useState({
    bp_systolic: '', bp_diastolic: '', weight_kg: '', pulse: '', temperature_c: '', symptoms: ''
  })
  const [result, setResult] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

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
      if (patientId) setSelectedPatient(patientId)
      else if (data.length > 0) setSelectedPatient(prev => prev || data[0].id)
    }
    load()
  }, [patientId])

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleSave = async () => {
    setError('')
    if (!selectedPatient || !form.bp_systolic || !form.bp_diastolic) {
      setError(t('VITALS_VALIDATION_ERROR'))
      return
    }
    setSaving(true)
    try {
      const vitalsData = {
        bp_systolic: parseInt(form.bp_systolic),
        bp_diastolic: parseInt(form.bp_diastolic),
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : undefined,
        pulse: form.pulse ? parseInt(form.pulse) : undefined,
        temperature_c: form.temperature_c ? parseFloat(form.temperature_c) : undefined,
        symptoms: form.symptoms ? form.symptoms.split(',').flatMap(s => s.trim() ? [s.trim()] : []) : [],
      }
      const res = await api.addVitals(selectedPatient, vitalsData)
      if (res.ok) {
        setResult(res)
        setForm({ bp_systolic: '', bp_diastolic: '', weight_kg: '', pulse: '', temperature_c: '', symptoms: '' })
      } else {
        setError(res.error || t('VITALS_SAVE_FAILED'))
      }
    } catch {
      setError(t('ERROR_CONNECTION_FAILED'))
    }
    setSaving(false)
  }

  return (
    <MobileLayout title={t('VITALS_PAGE_TITLE')} navItems={workerNavItems}>
      <section className="card animate-fade-in">
        <h3>{t('VITALS_INPUT_HEADING')}</h3>

        {error && (
          <div className="alert-panel" style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)', marginBottom: '1rem' }}>
            <strong style={{ color: '#ef4444' }}>{error}</strong>
          </div>
        )}

        <div className="form-grid">
          <label>
            {t('VITALS_PATIENT_LABEL')}
            <div className="input-wrapper">
              <select className="input" value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)}>
                <option value="">{t('VITALS_SELECT_PATIENT')}</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}, {t('WEEK')} {p.gestational_week ? n(p.gestational_week) : '?'}</option>
                ))}
              </select>
            </div>
          </label>
          <label>
            {t('VITALS_BP_SYSTOLIC_LABEL')}
            <div className="input-wrapper">
              <input className="input" type="number" placeholder={t('VITALS_BP_SYSTOLIC_PLACEHOLDER')} value={form.bp_systolic} onChange={handleChange('bp_systolic')} />
            </div>
          </label>
          <label>
            {t('VITALS_BP_DIASTOLIC_LABEL')}
            <div className="input-wrapper">
              <input className="input" type="number" placeholder={t('VITALS_BP_DIASTOLIC_PLACEHOLDER')} value={form.bp_diastolic} onChange={handleChange('bp_diastolic')} />
            </div>
          </label>
          <label>
            {t('VITALS_WEIGHT_LABEL')}
            <div className="input-wrapper">
              <input className="input" type="number" step="0.1" placeholder={t('VITALS_WEIGHT_PLACEHOLDER')} value={form.weight_kg} onChange={handleChange('weight_kg')} />
            </div>
          </label>
          <label>
            {t('VITALS_PULSE_LABEL')}
            <div className="input-wrapper">
              <input className="input" type="number" placeholder={t('VITALS_PULSE_PLACEHOLDER')} value={form.pulse} onChange={handleChange('pulse')} />
            </div>
          </label>
          <label>
            {t('VITALS_TEMP_LABEL')}
            <div className="input-wrapper">
              <input className="input" type="number" step="0.1" placeholder={t('VITALS_TEMP_PLACEHOLDER')} value={form.temperature_c} onChange={handleChange('temperature_c')} />
            </div>
          </label>
          <label>
            {t('VITALS_SYMPTOMS_LABEL')}
            <div className="input-wrapper">
              <input className="input" placeholder={t('VITALS_SYMPTOMS_PLACEHOLDER')} value={form.symptoms} onChange={handleChange('symptoms')} />
            </div>
          </label>
        </div>

        {result && (
          <div className="alert-panel" style={{ background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)', marginTop: '1rem' }}>
            <strong style={{ color: 'var(--color-success)' }}>{t('VITALS_SAVED_SUCCESS')}</strong>
            <p className="muted">
              {t('VITALS_RISK_SCORE')} {n(((result.riskScore || 0) * 100).toFixed(0))}% | {t('VITALS_LEVEL')} {t('RISK_' + (result.riskLevel || 'low').toUpperCase())}
            </p>
          </div>
        )}

        <div className="button-row">
          <button className="btn btn--primary" type="button" onClick={handleSave} disabled={saving}>
            {saving ? t('VITALS_SAVING') : t('VITALS_SAVE')}
          </button>
          {selectedPatient && (
            <button className="btn btn--ghost" type="button" onClick={() => navigate(`/worker/patient/${selectedPatient}`)}>
              {t('VITALS_BACK_TO_PATIENT')}
            </button>
          )}
        </div>
      </section>
    </MobileLayout>
  )
}
