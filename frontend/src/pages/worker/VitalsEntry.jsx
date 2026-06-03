import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MobileLayout from '../../components/layout/MobileLayout'
import { useApp } from '../../context/AppContext'
import { workerNavItems } from '../../data/navItems'
import * as api from '../../services/api'
import $ from '../../config/strings'

export default function VitalsEntry() {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const { locale } = useApp()
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(patientId || '')
  const [form, setForm] = useState({
    bp_systolic: '', bp_diastolic: '', weight_kg: '', pulse: '', temperature_c: '', symptoms: ''
  })
  const [result, setResult] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

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
      setError($('W_VITALS_ERR_REQUIRED', locale))
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
        setError(res.error || $('W_VITALS_ERR_REQUIRED', locale))
      }
    } catch {
      setError($('W_VITALS_ERR_NETWORK', locale))
    }
    setSaving(false)
  }

  return (
    <MobileLayout title={$('W_PAGE_TITLE_VITALS', locale)} navItems={workerNavItems(locale)}>
      <section className="card animate-fade-in">
        <h3>{$('W_VITALS_HEADING', locale)}</h3>

        {error && (
          <div className="alert-panel" style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)', marginBottom: '1rem' }}>
            <strong style={{ color: '#ef4444' }}>{error}</strong>
          </div>
        )}

        <div className="form-grid">
          <label>
            {$('W_VITALS_LABEL_PATIENT', locale)}
            <div className="input-wrapper">
              <select className="input" value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)}>
                <option value="">{$('W_VITALS_PH_PATIENT', locale)}</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}, {$('W_PATIENTS_WEEK_PREFIX', locale)} {p.gestational_week || '?'}</option>
                ))}
              </select>
            </div>
          </label>
          <label>
            {$('W_VITALS_LABEL_SYSTOLIC', locale)}
            <div className="input-wrapper">
              <input className="input" type="number" placeholder="120" value={form.bp_systolic} onChange={handleChange('bp_systolic')} />
            </div>
          </label>
          <label>
            {$('W_VITALS_LABEL_DIASTOLIC', locale)}
            <div className="input-wrapper">
              <input className="input" type="number" placeholder="80" value={form.bp_diastolic} onChange={handleChange('bp_diastolic')} />
            </div>
          </label>
          <label>
            {$('W_VITALS_LABEL_WEIGHT', locale)}
            <div className="input-wrapper">
              <input className="input" type="number" step="0.1" placeholder="62.0" value={form.weight_kg} onChange={handleChange('weight_kg')} />
            </div>
          </label>
          <label>
            {$('W_VITALS_LABEL_PULSE', locale)}
            <div className="input-wrapper">
              <input className="input" type="number" placeholder="78" value={form.pulse} onChange={handleChange('pulse')} />
            </div>
          </label>
          <label>
            {$('W_VITALS_LABEL_TEMP', locale)}
            <div className="input-wrapper">
              <input className="input" type="number" step="0.1" placeholder="36.8" value={form.temperature_c} onChange={handleChange('temperature_c')} />
            </div>
          </label>
          <label>
            {$('W_VITALS_LABEL_SYMPTOMS', locale)}
            <div className="input-wrapper">
              <input className="input" placeholder={$('W_VITALS_PH_SYMPTOMS', locale)} value={form.symptoms} onChange={handleChange('symptoms')} />
            </div>
          </label>
        </div>

        {result && (
          <div className="alert-panel" style={{ background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)', marginTop: '1rem' }}>
            <strong style={{ color: 'var(--color-success)' }}>{$('W_VITALS_SUCCESS', locale)}</strong>
            <p className="muted">
              Risk Score: {((result.riskScore || 0) * 100).toFixed(0)}% | Level: {result.riskLevel || 'low'}
            </p>
          </div>
        )}

        <div className="button-row">
          <button className="btn btn--primary" type="button" onClick={handleSave} disabled={saving}>
            {saving ? $('W_VITALS_BTN_SAVING', locale) : $('W_VITALS_BTN_SAVE', locale)}
          </button>
          {selectedPatient && (
            <button className="btn btn--ghost" type="button" onClick={() => navigate(`/worker/patient/${selectedPatient}`)}>
              {$('W_VITALS_BTN_BACK', locale)}
            </button>
          )}
        </div>
      </section>
    </MobileLayout>
  )
}
