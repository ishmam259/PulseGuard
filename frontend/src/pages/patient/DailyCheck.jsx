import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MobileLayout from '../../components/layout/MobileLayout'
import { useApp } from '../../context/AppContext'
import * as api from '../../services/api'
import { patientNavItems } from '../../data/navItems'

export default function DailyCheck() {
  const { connectivity } = useApp()
  const navigate = useNavigate()
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    bp: '',
    weight_kg: '',
    temperature_c: '',
    symptoms: '',
    pulse: '',
  })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadPatient() {
      try {
        const patient = await api.getMyPatientProfile();
        console.log(patient);
        //alert(patients.length)
        if (patient) {
          setPatient(patient)
        }
      } catch (err) {
        console.error('Failed to load patient for daily check:', err)
      } finally {
        setLoading(false)
      }
    }
    loadPatient()
  }, [])

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSave = async (isOfflineExplicit = false) => {
    setError('')
    setSuccess('')

    if (!patient) {
      setError('No patient profile found. Please register first.')
      return
    }

    if (!form.bp) {
      setError('Blood pressure is required (e.g. 120/80).')
      return
    }

    const bpParts = form.bp.split('/')
    const systolic = parseInt(bpParts[0])
    const diastolic = parseInt(bpParts[1])

    if (isNaN(systolic) || isNaN(diastolic)) {
      setError('Please enter blood pressure in the format "systolic/diastolic" (e.g. 120/80)')
      return
    }

    if(systolic < 40 || systolic > 300 || diastolic < 30 || diastolic > 230) {
      setError('Invalid BP. Out of range');
      return;
    }

    if(form.pulse) {
      let pulse = parseInt(form.pulse);
      if(pulse < 30 || pulse > 250) {
        setError('Invalid pulse. Out of range');
        return;
      }
    }

    const payload = {
      bp_systolic: systolic,
      bp_diastolic: diastolic,
      weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : undefined,
      temperature_c: form.temperature_c ? parseFloat(form.temperature_c) : undefined,
      pulse: form.pulse ? parseInt(form.pulse) : undefined,
      symptoms: form.symptoms ? form.symptoms.split(',').flatMap((s) => { const trimmed = s.trim(); return trimmed ? [trimmed] : []; }) : [],
    }

    if (connectivity === 'offline' || isOfflineExplicit) {
      // Save to local offline queue
      try {
        const queue = JSON.parse(localStorage.getItem('pg_offline_queue:v1') || '[]')
        queue.push({
          patient_id: patient.id,
          type: 'vitals',
          data: payload,
          local_timestamp: new Date().toISOString(),
        })
        localStorage.setItem('pg_offline_queue:v1', JSON.stringify(queue))
        setSuccess('Saved to offline queue successfully! It will sync when connection is restored.')
        setForm({ bp: '', weight_kg: '', temperature_c: '', symptoms: '', pulse: '' })
      } catch {
        setError('Failed to save data locally.')
      }
      return
    }

    setSaving(true)
    try {
      const res = await api.addVitals(patient.id, payload)
      if (res.ok) {
        setSuccess(`Daily check recorded! Risk status: ${res.riskLevel || 'low'}`)
        setForm({ bp: '', weight_kg: '', temperature_c: '', symptoms: '', pulse: '' })
      } else {
        setError(res.error || 'Failed to save daily check details.')
      }
    } catch {
      setError('Network request failed. Please try saving offline instead.')
    } finally {
      setSaving(false)
    }
  }

  const currentDateStr = new Date().toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <MobileLayout
      title="Daily Health Check"
      status={connectivity}
      navItems={patientNavItems}
    >
      <div className="animate-fade-in">
        {loading ? (
          <div className="card text-center" style={{ padding: '2rem' }}>
            <p className="muted animate-pulse">Loading daily health check form…</p>
          </div>
        ) : !patient ? (
          <div className="card" style={{
            background: 'linear-gradient(135deg, rgba(36,174,124,0.12), rgba(121,181,236,0.06))',
            border: '1px solid rgba(36,174,124,0.3)',
            boxShadow: 'inset 3px 0 0 var(--color-primary)',
            padding: '2rem 1.5rem',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Profile Setup Required</h3>
            <p className="muted" style={{ marginBottom: '1.5rem', lineHeight: 1.6 }}>
              You need to complete your pregnancy profile before recording vitals.
            </p>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => navigate('/patient/onboarding')}
            >
              Complete My Profile
            </button>
          </div>
        ) : (
          <div className="card">
            <h3 className="text-gradient">Record Today's Vitals</h3>
            <p className="muted">
              {currentDateStr}, Pregnancy Week {patient.patient.gestational_week || 'N/A'}
            </p>

            {error && (
              <div
                className="alert-panel"
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  borderColor: 'rgba(239,68,68,0.3)',
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  borderRadius: '6px',
                }}
              >
                <strong style={{ color: '#ef4444' }}>{error}</strong>
              </div>
            )}

            {success && (
              <div
                className="alert-panel"
                style={{
                  background: 'rgba(16,185,129,0.1)',
                  borderColor: 'rgba(16,185,129,0.3)',
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  borderRadius: '6px',
                }}
              >
                <strong style={{ color: 'var(--color-success)' }}>{success}</strong>
              </div>
            )}

            <div className="form-grid">
              <label>
                Blood Pressure (mmHg) *
                <div className="input-wrapper">
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. 120/80"
                    value={form.bp}
                    onChange={handleChange('bp')}
                  />
                </div>
              </label>
              <label>
                Weight (kg)
                <div className="input-wrapper">
                  <input
                    type="number"
                    className="input"
                    placeholder="e.g. 62"
                    step="0.1"
                    value={form.weight_kg}
                    onChange={handleChange('weight_kg')}
                  />
                </div>
              </label>
              <label>
                Temperature (°C)
                <div className="input-wrapper">
                  <input
                    type="number"
                    className="input"
                    placeholder="e.g. 36.8"
                    step="0.1"
                    value={form.temperature_c}
                    onChange={handleChange('temperature_c')}
                  />
                </div>
              </label>
              <label>
                Pulse (bpm)
                <div className="input-wrapper">
                  <input
                    type="number"
                    className="input"
                    placeholder="e.g. 75"
                    value={form.pulse}
                    onChange={handleChange('pulse')}
                  />
                </div>
              </label>
              <label>
                Symptoms (comma-separated)
                <div className="input-wrapper">
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Headache, Nausea"
                    value={form.symptoms}
                    onChange={handleChange('symptoms')}
                  />
                </div>
              </label>
            </div>

            <div className="button-row" style={{ marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => handleSave(false)}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => handleSave(true)}
              >
                Save Offline
              </button>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  )
}
