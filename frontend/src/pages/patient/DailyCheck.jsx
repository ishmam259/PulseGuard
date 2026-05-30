import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MobileLayout from '../../components/layout/MobileLayout'
import { useApp } from '../../context/AppContext'
import * as api from '../../services/api'
import { patientNavItems } from '../../data/navItems'
import $ from '../../config/strings'

export default function DailyCheck() {
  const { connectivity, locale } = useApp()
  const navigate = useNavigate()
  const [patientData, setPatientData] = useState(null)  // holds { patient, latestVitals }
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
        const data = await api.getMyPatientProfile()
        // data = { patient: {...} | null, latestVitals: {...} | null }
        if (data && data.patient) {
          setPatientData(data)
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

    if (!patientData) {
      setError($('DAILY_ERR_NO_PROFILE', locale))
      return
    }

    if (!form.bp) {
      setError($('DAILY_ERR_BP_REQUIRED', locale))
      return
    }

    const bpParts = form.bp.split('/')
    const systolic = parseInt(bpParts[0])
    const diastolic = parseInt(bpParts[1])

    if (isNaN(systolic) || isNaN(diastolic)) {
      setError($('DAILY_ERR_BP_FORMAT', locale))
      return
    }

    if(systolic < 40 || systolic > 300 || diastolic < 30 || diastolic > 230) {
      setError($('DAILY_ERR_BP_RANGE', locale));
      return;
    }

    if(form.pulse) {
      let pulse = parseInt(form.pulse);
      if(pulse < 30 || pulse > 250) {
        setError($('DAILY_ERR_PULSE_RANGE', locale));
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
      try {
        const queue = JSON.parse(localStorage.getItem('pg_offline_queue:v1') || '[]')
        queue.push({
          patient_id: patientData.patient.id,
          type: 'vitals',
          data: payload,
          local_timestamp: new Date().toISOString(),
        })
        localStorage.setItem('pg_offline_queue:v1', JSON.stringify(queue))
        setSuccess($('DAILY_SUCCESS_OFFLINE', locale))
        setForm({ bp: '', weight_kg: '', temperature_c: '', symptoms: '', pulse: '' })
      } catch {
        setError($('DAILY_ERR_SAVE_LOCAL', locale))
      }
      return
    }

    setSaving(true)
    try {
      const res = await api.addVitals(patientData.patient.id, payload)
      if (res.ok) {
        setSuccess(`${$('DAILY_SUCCESS_PREFIX', locale)}: ${res.riskLevel || 'low'}`)
        setForm({ bp: '', weight_kg: '', temperature_c: '', symptoms: '', pulse: '' })
      } else {
        setError(res.error || 'Failed to save daily check details.')
      }
    } catch {
      setError($('DAILY_ERR_NETWORK', locale))
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
      title={$('PAGE_TITLE_DAILY_CHECK', locale)}
      status={connectivity}
      navItems={patientNavItems(locale)}
    >
      <div className="animate-fade-in">
        {loading ? (
          <div className="card text-center" style={{ padding: '2rem' }}>
            <p className="muted animate-pulse">{$('DAILY_LOADING', locale)}</p>
          </div>
        ) : !patientData ? (
          <div className="card" style={{
            background: 'linear-gradient(135deg, rgba(36,174,124,0.12), rgba(121,181,236,0.06))',
            border: '1px solid rgba(36,174,124,0.3)',
            boxShadow: 'inset 3px 0 0 var(--color-primary)',
            padding: '2rem 1.5rem',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{$('DAILY_NO_PROFILE_ICON', locale)}</div>
            <h3 style={{ marginBottom: '0.5rem' }}>{$('DAILY_NO_PROFILE_HEADING', locale)}</h3>
            <p className="muted" style={{ marginBottom: '1.5rem', lineHeight: 1.6 }}>
              {$('DAILY_NO_PROFILE_BODY', locale)}
            </p>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => navigate('/patient/onboarding')}
            >
              {$('DAILY_NO_PROFILE_BTN', locale)}
            </button>
          </div>
        ) : (
          <div className="card">
            <h3 className="text-gradient">{$('DAILY_FORM_HEADING', locale)}</h3>
            <p className="muted">
              {currentDateStr}, {$('DAILY_FORM_DATE_PREFIX', locale)} {patientData.patient.gestational_week || 'N/A'}
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
                {$('DAILY_LABEL_BP', locale)}
                <div className="input-wrapper">
                  <input
                    type="text"
                    className="input"
                    placeholder={$('DAILY_PH_BP', locale)}
                    value={form.bp}
                    onChange={handleChange('bp')}
                  />
                </div>
              </label>
              <label>
                {$('DAILY_LABEL_WEIGHT', locale)}
                <div className="input-wrapper">
                  <input
                    type="number"
                    className="input"
                    placeholder={$('DAILY_PH_WEIGHT', locale)}
                    step="0.1"
                    value={form.weight_kg}
                    onChange={handleChange('weight_kg')}
                  />
                </div>
              </label>
              <label>
                {$('DAILY_LABEL_TEMP', locale)}
                <div className="input-wrapper">
                  <input
                    type="number"
                    className="input"
                    placeholder={$('DAILY_PH_TEMP', locale)}
                    step="0.1"
                    value={form.temperature_c}
                    onChange={handleChange('temperature_c')}
                  />
                </div>
              </label>
              <label>
                {$('DAILY_LABEL_PULSE', locale)}
                <div className="input-wrapper">
                  <input
                    type="number"
                    className="input"
                    placeholder={$('DAILY_PH_PULSE', locale)}
                    value={form.pulse}
                    onChange={handleChange('pulse')}
                  />
                </div>
              </label>
              <label>
                {$('DAILY_LABEL_SYMPTOMS', locale)}
                <div className="input-wrapper">
                  <input
                    type="text"
                    className="input"
                    placeholder={$('DAILY_PH_SYMPTOMS', locale)}
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
                {saving ? $('DAILY_BTN_SAVING', locale) : $('DAILY_BTN_SAVE', locale)}
              </button>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => handleSave(true)}
              >
                {$('DAILY_BTN_SAVE_OFFLINE', locale)}
              </button>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  )
}
