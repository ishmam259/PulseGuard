import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MobileLayout from '../../components/layout/MobileLayout'
import * as api from '../../services/api'

const workerNavItems = [
  { label: 'Home', to: '/worker/dashboard', icon: '' },
  { label: 'Patients', to: '/worker/patients', icon: '' },
  { label: 'AI', to: '/worker/ai-analysis', icon: '' },
  { label: 'Sync', to: '/worker/sync', icon: '' },
  { label: 'Profile', to: '/worker/profile', icon: '' },
]

export default function VitalsEntry() {
  const { patientId } = useParams()
  const navigate = useNavigate()
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
      setError('Please select a patient and enter BP readings')
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
        setError(res.error || 'Failed to save vitals')
      }
    } catch {
      setError('Connection failed. Please try again.')
    }
    setSaving(false)
  }

  return (
    <MobileLayout title="Record Vitals" navItems={workerNavItems}>
      <section className="card animate-fade-in">
        <h3>Vitals Input</h3>

        {error && (
          <div className="alert-panel" style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)', marginBottom: '1rem' }}>
            <strong style={{ color: '#ef4444' }}>{error}</strong>
          </div>
        )}

        <div className="form-grid">
          <label>
            Patient
            <div className="input-wrapper">
              <select className="input" value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)}>
                <option value="">Select patient…</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}, Week {p.gestational_week || '?'}</option>
                ))}
              </select>
            </div>
          </label>
          <label>
            BP Systolic (mmHg) *
            <div className="input-wrapper">
              <input className="input" type="number" placeholder="120" value={form.bp_systolic} onChange={handleChange('bp_systolic')} />
            </div>
          </label>
          <label>
            BP Diastolic (mmHg) *
            <div className="input-wrapper">
              <input className="input" type="number" placeholder="80" value={form.bp_diastolic} onChange={handleChange('bp_diastolic')} />
            </div>
          </label>
          <label>
            Weight (kg)
            <div className="input-wrapper">
              <input className="input" type="number" step="0.1" placeholder="62.0" value={form.weight_kg} onChange={handleChange('weight_kg')} />
            </div>
          </label>
          <label>
            Pulse (bpm)
            <div className="input-wrapper">
              <input className="input" type="number" placeholder="78" value={form.pulse} onChange={handleChange('pulse')} />
            </div>
          </label>
          <label>
            Temperature (°C)
            <div className="input-wrapper">
              <input className="input" type="number" step="0.1" placeholder="36.8" value={form.temperature_c} onChange={handleChange('temperature_c')} />
            </div>
          </label>
          <label>
            Symptoms (comma-separated)
            <div className="input-wrapper">
              <input className="input" placeholder="Headache, fatigue, swelling..." value={form.symptoms} onChange={handleChange('symptoms')} />
            </div>
          </label>
        </div>

        {result && (
          <div className="alert-panel" style={{ background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)', marginTop: '1rem' }}>
            <strong style={{ color: 'var(--color-success)' }}>Vitals saved successfully</strong>
            <p className="muted">
              Risk Score: {((result.riskScore || 0) * 100).toFixed(0)}% | Level: {result.riskLevel || 'low'}
            </p>
          </div>
        )}

        <div className="button-row">
          <button className="btn btn--primary" type="button" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Vitals'}
          </button>
          {selectedPatient && (
            <button className="btn btn--ghost" type="button" onClick={() => navigate(`/worker/patient/${selectedPatient}`)}>
              ← Back to Patient
            </button>
          )}
        </div>
      </section>
    </MobileLayout>
  )
}
