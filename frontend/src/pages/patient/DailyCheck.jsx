import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MobileLayout from '../../components/layout/MobileLayout'
import { useApp } from '../../context/AppContext'
import * as api from '../../services/api'
import { patientNavItems } from '../../data/navItems'
import $ from '../../config/strings'
import { Save, WifiOff } from 'lucide-react'

export default function DailyCheck() {
  const { connectivity, locale } = useApp()
  const t = (en, bn) => (locale === 'en' ? en : bn)
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

  const currentDateStr = new Date().toLocaleDateString(
    locale === 'bn' ? 'bn-BD' : 'en-GB',
    { day: 'numeric', month: 'long', year: 'numeric' }
  )

  return (
    <MobileLayout
      title={$('PAGE_TITLE_DAILY_CHECK', locale)}
      status={connectivity}
      navItems={patientNavItems(locale)}
    >
      <div className="animate-fade-in">
        {loading ? (
          <div className="glass text-center" style={{ padding: '3rem 2rem', borderRadius: '24px' }}>
            <p className="muted animate-pulse">{$('DAILY_LOADING', locale)}</p>
          </div>
        ) : !patientData ? (
          <div className="glass text-center" style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '24px',
            padding: '40px 32px',
          }}>
            <div className="absolute top-0 left-0 h-full w-1 bg-[var(--gradient-primary)]" style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '4px', background: 'var(--gradient-primary)' }} />
            
            <div className="mx-auto" style={{ display: 'grid', height: '64px', width: '64px', placeItems: 'center', borderRadius: '16px', background: 'var(--color-primary-dim)', color: 'var(--color-primary)', marginBottom: '20px', marginLeft: 'auto', marginRight: 'auto' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              </svg>
            </div>
            
            <h3 className="font-display" style={{ fontSize: '1.6rem', marginBottom: '8px' }}>{$('DAILY_NO_PROFILE_HEADING', locale)}</h3>
            <p className="muted" style={{ marginBottom: '24px', lineHeight: 1.6, maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
              {$('DAILY_NO_PROFILE_BODY', locale)}
            </p>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => navigate('/patient/onboarding')}
              style={{ borderRadius: '9999px', padding: '12px 28px' }}
            >
              {$('DAILY_NO_PROFILE_BTN', locale)}
            </button>
          </div>
        ) : (
          <div className="glass" style={{ position: 'relative', overflow: 'hidden', borderRadius: '24px', padding: '32px' }}>
            <div className="absolute top-0 left-0 h-full w-1 bg-[var(--gradient-primary)]" style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '4px', background: 'var(--gradient-primary)' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{
                borderRadius: '9999px',
                background: 'var(--gradient-primary)',
                padding: '6px 14px',
                fontSize: '11px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'white',
                boxShadow: 'var(--shadow-glow-primary)'
              }}>
                {t("Record Today's Vitals", "আজকের ভাইটাল রেকর্ড করুন")}
              </span>
            </div>
            
            <p className="muted" style={{ fontSize: '13.5px', marginBottom: '24px' }}>
              {currentDateStr} &middot; {$('DAILY_FORM_DATE_PREFIX', locale)} <strong style={{ color: 'var(--color-text)' }}>{patientData.patient.gestational_week || 'N/A'}</strong>
            </p>

            {error && (
              <div
                style={{
                  background: 'var(--color-danger-dim)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  marginBottom: '20px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  color: 'var(--color-danger-light)'
                }}
              >
                <strong>{error}</strong>
              </div>
            )}

            {success && (
              <div
                style={{
                  background: 'var(--color-success-dim)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  marginBottom: '20px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  color: 'var(--color-success)'
                }}
              >
                <strong>{success}</strong>
              </div>
            )}

            <div className="form-grid" style={{ gap: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-muted)' }}>
                {$('DAILY_LABEL_BP', locale)} <span style={{ color: 'var(--color-primary)' }}>*</span>
                <div className="input-wrapper" style={{ marginTop: '8px' }}>
                  <input
                    type="text"
                    placeholder={$('DAILY_PH_BP', locale)}
                    value={form.bp}
                    onChange={handleChange('bp')}
                    style={{
                      height: '48px',
                      borderRadius: '16px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'color-mix(in oklab, var(--color-surface) 60%, transparent)',
                      padding: '0 16px',
                      fontSize: '14px',
                      outline: 'none',
                      width: '100%',
                      color: 'var(--color-text)'
                    }}
                  />
                </div>
              </label>
              
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-muted)' }}>
                {$('DAILY_LABEL_WEIGHT', locale)}
                <div className="input-wrapper" style={{ marginTop: '8px' }}>
                  <input
                    type="number"
                    placeholder={$('DAILY_PH_WEIGHT', locale)}
                    step="0.1"
                    value={form.weight_kg}
                    onChange={handleChange('weight_kg')}
                    style={{
                      height: '48px',
                      borderRadius: '16px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'color-mix(in oklab, var(--color-surface) 60%, transparent)',
                      padding: '0 16px',
                      fontSize: '14px',
                      outline: 'none',
                      width: '100%',
                      color: 'var(--color-text)'
                    }}
                  />
                </div>
              </label>

              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-muted)' }}>
                {$('DAILY_LABEL_TEMP', locale)}
                <div className="input-wrapper" style={{ marginTop: '8px' }}>
                  <input
                    type="number"
                    placeholder={$('DAILY_PH_TEMP', locale)}
                    step="0.1"
                    value={form.temperature_c}
                    onChange={handleChange('temperature_c')}
                    style={{
                      height: '48px',
                      borderRadius: '16px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'color-mix(in oklab, var(--color-surface) 60%, transparent)',
                      padding: '0 16px',
                      fontSize: '14px',
                      outline: 'none',
                      width: '100%',
                      color: 'var(--color-text)'
                    }}
                  />
                </div>
              </label>

              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-muted)' }}>
                {$('DAILY_LABEL_PULSE', locale)}
                <div className="input-wrapper" style={{ marginTop: '8px' }}>
                  <input
                    type="number"
                    placeholder={$('DAILY_PH_PULSE', locale)}
                    value={form.pulse}
                    onChange={handleChange('pulse')}
                    style={{
                      height: '48px',
                      borderRadius: '16px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'color-mix(in oklab, var(--color-surface) 60%, transparent)',
                      padding: '0 16px',
                      fontSize: '14px',
                      outline: 'none',
                      width: '100%',
                      color: 'var(--color-text)'
                    }}
                  />
                </div>
              </label>

              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-muted)' }}>
                {$('DAILY_LABEL_SYMPTOMS', locale)}
                <div className="input-wrapper" style={{ marginTop: '8px' }}>
                  <input
                    type="text"
                    placeholder={$('DAILY_PH_SYMPTOMS', locale)}
                    value={form.symptoms}
                    onChange={handleChange('symptoms')}
                    style={{
                      height: '48px',
                      borderRadius: '16px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'color-mix(in oklab, var(--color-surface) 60%, transparent)',
                      padding: '0 16px',
                      fontSize: '14px',
                      outline: 'none',
                      width: '100%',
                      color: 'var(--color-text)'
                    }}
                  />
                </div>
              </label>
            </div>

            <div className="button-row" style={{ marginTop: '28px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => handleSave(false)}
                disabled={saving}
                style={{
                  borderRadius: '9999px',
                  padding: '12px 28px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Save className="h-4 w-4" />
                <span>{saving ? $('DAILY_BTN_SAVING', locale) : $('DAILY_BTN_SAVE', locale)}</span>
              </button>
              
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => handleSave(true)}
                style={{
                  borderRadius: '9999px',
                  padding: '12px 28px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'color-mix(in oklab, var(--color-surface) 60%, transparent)',
                  color: 'var(--color-text)'
                }}
              >
                <WifiOff className="h-4 w-4" />
                <span>{$('DAILY_BTN_SAVE_OFFLINE', locale)}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  )
}
