import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MobileLayout from '../../components/layout/MobileLayout'
import { useApp } from '../../context/AppContext'
import { useLocale } from '../../context/LocaleContext'
import * as api from '../../services/api'
import { patientNavItems } from '../../data/navItems'

export default function DailyCheck() {
  const { connectivity } = useApp()
  const { t } = useLocale()
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
      setError(t('DAILY_ERROR_NO_PATIENT'))
      return
    }

    if (!form.bp) {
      setError(t('DAILY_ERROR_BP_REQUIRED'))
      return
    }

    const bpParts = form.bp.split('/')
    const systolic = parseInt(bpParts[0])
    const diastolic = parseInt(bpParts[1])

    if (isNaN(systolic) || isNaN(diastolic)) {
      setError(t('DAILY_ERROR_BP_FORMAT'))
      return
    }

    if(systolic < 40 || systolic > 300 || diastolic < 30 || diastolic > 230) {
      setError(t('DAILY_ERROR_BP_RANGE'));
      return;
    }

    if(form.pulse) {
      let pulse = parseInt(form.pulse);
      if(pulse < 30 || pulse > 250) {
        setError(t('DAILY_ERROR_PULSE_RANGE'));
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
          patient_id: patient.patient.id,
          type: 'vitals',
          data: payload,
          local_timestamp: new Date().toISOString(),
        })
        localStorage.setItem('pg_offline_queue:v1', JSON.stringify(queue))
        setSuccess(t('DAILY_SUCCESS_OFFLINE'))
        setForm({ bp: '', weight_kg: '', temperature_c: '', symptoms: '', pulse: '' })
      } catch {
        setError(t('DAILY_ERROR_LOCAL_SAVE'))
      }
      return
    }

    setSaving(true)
    try {
      const res = await api.addVitals(patient.patient.id, payload)
      if (res.ok) {
        const riskVal = (res.riskLevel || 'low').toLowerCase() === 'high'
          ? t('RISK_HIGH')
          : (res.riskLevel || 'low').toLowerCase() === 'moderate'
          ? t('RISK_MODERATE')
          : t('RISK_LOW')
        setSuccess(t('DAILY_SUCCESS_RECORDED', { riskLevel: riskVal }))
        setForm({ bp: '', weight_kg: '', temperature_c: '', symptoms: '', pulse: '' })
      } else {
        setError(res.error || t('DAILY_ERROR_SAVE_FAILED'))
      }
    } catch {
      setError(t('DAILY_ERROR_NETWORK'))
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
      title={t('DAILY_PAGE_TITLE')}
      status={connectivity}
      navItems={patientNavItems}
    >
      <div className="animate-fade-in">
        {loading ? (
          <div className="card text-center" style={{ padding: '2rem' }}>
            <p className="muted animate-pulse">{t('DAILY_LOADING')}</p>
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
            <h3 style={{ marginBottom: '0.5rem' }}>{t('DAILY_PROFILE_REQUIRED')}</h3>
            <p className="muted" style={{ marginBottom: '1.5rem', lineHeight: 1.6 }}>
              {t('DAILY_PROFILE_REQUIRED_DESC')}
            </p>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => navigate('/patient/onboarding')}
            >
              {t('DAILY_COMPLETE_PROFILE')}
            </button>
          </div>
        ) : (
          <div className="card">
            <h3 className="text-gradient">{t('DAILY_RECORD_HEADING')}</h3>
            <p className="muted">
              {currentDateStr}, {t('DASHBOARD_PREGNANCY_WEEK')} <strong>{patient.patient.gestational_week || t('FALLBACK_NA')}</strong>
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
                {t('DAILY_BP_LABEL')}
                <div className="input-wrapper">
                  <input
                    type="text"
                    className="input"
                    placeholder={t('DAILY_BP_PLACEHOLDER')}
                    value={form.bp}
                    onChange={handleChange('bp')}
                  />
                </div>
              </label>
              <label>
                {t('DAILY_WEIGHT_LABEL')}
                <div className="input-wrapper">
                  <input
                    type="number"
                    className="input"
                    placeholder={t('DAILY_WEIGHT_PLACEHOLDER')}
                    step="0.1"
                    value={form.weight_kg}
                    onChange={handleChange('weight_kg')}
                  />
                </div>
              </label>
              <label>
                {t('DAILY_TEMP_LABEL')}
                <div className="input-wrapper">
                  <input
                    type="number"
                    className="input"
                    placeholder={t('DAILY_TEMP_PLACEHOLDER')}
                    step="0.1"
                    value={form.temperature_c}
                    onChange={handleChange('temperature_c')}
                  />
                </div>
              </label>
              <label>
                {t('DAILY_PULSE_LABEL')}
                <div className="input-wrapper">
                  <input
                    type="number"
                    className="input"
                    placeholder={t('DAILY_PULSE_PLACEHOLDER')}
                    value={form.pulse}
                    onChange={handleChange('pulse')}
                  />
                </div>
              </label>
              <label>
                {t('DAILY_SYMPTOMS_LABEL')}
                <div className="input-wrapper">
                  <input
                    type="text"
                    className="input"
                    placeholder={t('DAILY_SYMPTOMS_PLACEHOLDER')}
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
                {saving ? t('DAILY_SAVING') : t('SAVE')}
              </button>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => handleSave(true)}
              >
                {t('DAILY_SAVE_OFFLINE')}
              </button>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  )
}
