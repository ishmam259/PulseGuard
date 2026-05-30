import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import * as api from '../../services/api'

const DEFAULTS = {
  high_bp_systolic: 140,
  high_bp_diastolic: 90,
  moderate_bp_systolic: 130,
  moderate_bp_diastolic: 85,
  high_risk_cutoff: 0.70,
  moderate_risk_cutoff: 0.40,
  alert_threshold: 0.70,
}

// Preview: what risk level would a sample reading get with current settings?
function classifyPreview(cfg, sample) {
  const sys = sample.systolic
  const dia = sample.diastolic
  if (sys >= cfg.high_bp_systolic || dia >= cfg.high_bp_diastolic) {
    const reason = sys >= cfg.high_bp_systolic 
      ? `Systolic (${sys} mmHg) is ≥ High threshold (${cfg.high_bp_systolic} mmHg)`
      : `Diastolic (${dia} mmHg) is ≥ High threshold (${cfg.high_bp_diastolic} mmHg)`
    return { level: 'high', reason }
  }
  if (sys >= cfg.moderate_bp_systolic || dia >= cfg.moderate_bp_diastolic) {
    const reason = sys >= cfg.moderate_bp_systolic 
      ? `Systolic (${sys} mmHg) is ≥ Moderate threshold (${cfg.moderate_bp_systolic} mmHg)`
      : `Diastolic (${dia} mmHg) is ≥ Moderate threshold (${cfg.moderate_bp_diastolic} mmHg)`
    return { level: 'moderate', reason }
  }
  return { 
    level: 'low', 
    reason: `Normal range: Systolic (${sys} mmHg) and Diastolic (${dia} mmHg) are below the Moderate thresholds.`
  }
}

const riskColors = {
  high: { bg: 'rgba(242,78,67,0.12)', border: 'rgba(242,78,67,0.35)', text: '#F37877', badge: 'badge--high' },
  moderate: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)', text: '#f59e0b', badge: 'badge--moderate' },
  low: { bg: 'rgba(36,174,124,0.12)', border: 'rgba(36,174,124,0.35)', text: '#24AE7C', badge: 'badge--low' },
}

function InputRow({ label, min, max, step = 1, unit = '', value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid var(--color-border)' }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>{label}</p>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
          style={{ width: '100%', accentColor: 'var(--color-primary)', marginTop: '4px' }}
        />
      </div>
      <label style={{
        minWidth: '72px',
        textAlign: 'center',
        background: 'var(--color-bg-accent)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '6px 8px',
        fontWeight: 700,
        fontSize: '15px',
        color: 'var(--color-primary)',
        fontVariantNumeric: 'tabular-nums',
      }}>
        <input
          type="number"
          className="aiconfig-value-input"
          aria-label={label}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
          style={{
            width: unit ? '56px' : '100%',
            border: 'none',
            background: 'transparent',
            color: 'var(--color-primary)',
            font: 'inherit',
            textAlign: 'center',
            fontVariantNumeric: 'tabular-nums',
          }}
        />
        {unit}
      </label>
    </div>
  )
}

export default function AIConfig() {
  const navigate = useNavigate()
  const [config, setConfig] = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [preview, setPreview] = useState({ systolic: 135, diastolic: 88 })

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getAIConfig()
        if (data) {
          setConfig({
            high_bp_systolic: Number(data.high_bp_systolic),
            high_bp_diastolic: Number(data.high_bp_diastolic),
            moderate_bp_systolic: Number(data.moderate_bp_systolic),
            moderate_bp_diastolic: Number(data.moderate_bp_diastolic),
            high_risk_cutoff: Number(data.high_risk_cutoff),
            moderate_risk_cutoff: Number(data.moderate_risk_cutoff),
            alert_threshold: Number(data.alert_threshold),
          })
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleChange = (field) => (e) => {
    setConfig((prev) => ({ ...prev, [field]: Number(e.target.value) }))
    setSuccess('')
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const res = await api.updateAIConfig(config)
      if (!res.ok) throw new Error(res.error || 'Failed to save configuration.')
      setSuccess('AI configuration saved successfully!')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setConfig(DEFAULTS)
    setSuccess('')
  }

  const { level: previewRisk, reason: previewReason } = classifyPreview(config, preview)
  const riskStyle = riskColors[previewRisk]

  return (
    <AdminLayout title="AI Configuration">
      <style>{`
        .aiconfig-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 1.5rem;
          align-items: start;
          width: 100%;
          margin-bottom: 2rem;
        }
        .guide-item {
          display: flex;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid var(--color-border);
        }
        .guide-item:last-child {
          border-bottom: none;
        }
        .aiconfig-value-input::-webkit-outer-spin-button,
        .aiconfig-value-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .aiconfig-value-input {
          appearance: textfield;
          -moz-appearance: textfield;
        }
        @media (max-width: 1080px) {
          .aiconfig-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div style={{ width: '100%' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <button className="btn btn--ghost" onClick={() => navigate('/admin/settings')} style={{ padding: '8px 14px', fontSize: '13px' }}>
            ← Back
          </button>
          <p className="muted" style={{ margin: 0 }}>Adjust risk prediction thresholds and alert sensitivity. Changes apply immediately to new vitals entries.</p>
        </div>

        {/* Status messages */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
            <strong style={{ color: '#ef4444' }}>{error}</strong>
          </div>
        )}
        {success && (
          <div style={{ background: 'rgba(36,174,124,0.1)', border: '1px solid rgba(36,174,124,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
            <strong style={{ color: 'var(--color-primary)' }}>✓ {success}</strong>
          </div>
        )}

        {loading ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p className="muted animate-pulse">Loading AI configuration...</p>
          </div>
        ) : (
          <div className="aiconfig-grid">
            {/* Left Column: Sliders */}
            <div style={{ display: 'grid', gap: '1.25rem' }}>
              {/* Blood Pressure Thresholds */}
              <div className="card animate-fade-in">
                <h3 style={{ marginBottom: '0.25rem' }}>🩺 Blood Pressure Thresholds</h3>
                <p className="muted" style={{ marginBottom: '1rem', fontSize: '13px' }}>
                  Used by the heuristic engine when the AI worker is offline. Readings above the <strong>High</strong> threshold are immediately flagged.
                </p>
                <InputRow label="High Risk — Systolic (mmHg)" min={120} max={180} value={config.high_bp_systolic} onChange={handleChange('high_bp_systolic')} />
                <InputRow label="High Risk — Diastolic (mmHg)" min={70} max={130} value={config.high_bp_diastolic} onChange={handleChange('high_bp_diastolic')} />
                <InputRow label="Moderate Risk — Systolic (mmHg)" min={110} max={160} value={config.moderate_bp_systolic} onChange={handleChange('moderate_bp_systolic')} />
                <InputRow label="Moderate Risk — Diastolic (mmHg)" min={60} max={120} value={config.moderate_bp_diastolic} onChange={handleChange('moderate_bp_diastolic')} />
              </div>

              {/* Risk Score Cutoffs */}
              <div className="card animate-fade-in" style={{ animationDelay: '80ms' }}>
                <h3 style={{ marginBottom: '0.25rem' }}>📊 Risk Score Cutoffs</h3>
                <p className="muted" style={{ marginBottom: '1rem', fontSize: '13px' }}>
                  Applied when the AI worker returns a numerical score (0.0 – 1.0). Scores above the <strong>High</strong> cutoff broadcast a real-time alert.
                </p>
                <InputRow label="High Risk Cutoff" min={0.5} max={0.95} step={0.05} value={config.high_risk_cutoff} onChange={handleChange('high_risk_cutoff')} />
                <InputRow label="Moderate Risk Cutoff" min={0.2} max={0.7} step={0.05} value={config.moderate_risk_cutoff} onChange={handleChange('moderate_risk_cutoff')} />
                <InputRow label="Alert Broadcast Threshold" min={0.5} max={0.95} step={0.05} value={config.alert_threshold} onChange={handleChange('alert_threshold')} />
              </div>
            </div>

            {/* Right Column: Preview, Guidelines & Actions */}
            <div style={{ display: 'grid', gap: '1.25rem' }}>
              {/* Live Preview Card */}
              <div className="card animate-fade-in" style={{ animationDelay: '160ms', border: `1px solid ${riskStyle.border}`, background: riskStyle.bg, transition: 'all 0.3s ease' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>🔍 Live Threshold Preview</h3>
                <p className="muted" style={{ marginBottom: '1.25rem', fontSize: '13px' }}>
                  Enter a sample BP reading below to see how the active configuration would classify it.
                </p>
                
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontWeight: 600, fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    Systolic
                    <input
                      type="number"
                      className="input"
                      value={preview.systolic}
                      onChange={(e) => setPreview((p) => ({ ...p, systolic: Number(e.target.value) }))}
                      style={{ width: '100px' }}
                      min={60}
                      max={250}
                    />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontWeight: 600, fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    Diastolic
                    <input
                      type="number"
                      className="input"
                      value={preview.diastolic}
                      onChange={(e) => setPreview((p) => ({ ...p, diastolic: Number(e.target.value) }))}
                      style={{ width: '100px' }}
                      min={40}
                      max={150}
                    />
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
                    <span style={{ color: 'var(--color-muted)', fontSize: '13px' }}>Result:</span>
                    <span className={`badge ${riskStyle.badge}`} style={{ fontSize: '13px', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '4px', fontWeight: 700 }}>
                      {previewRisk} Risk
                    </span>
                  </div>
                </div>

                <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '10px 14px', borderRadius: '6px', borderLeft: `3px solid ${riskStyle.text === '#FFFFFF' ? 'var(--color-border)' : riskStyle.text}` }}>
                  <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: '1.5' }}>
                    💡 <strong>Evaluation Logic:</strong> {previewReason}
                  </p>
                </div>
              </div>

              {/* System Guide Card */}
              <div className="card animate-fade-in" style={{ animationDelay: '240ms' }}>
                <h3 style={{ marginBottom: '0.75rem' }}>ℹ️ Threshold Decision Guide</h3>
                <p className="muted" style={{ marginBottom: '1rem', fontSize: '13px' }}>
                  How PulseGuard AI uses these configuration thresholds to safeguard patients:
                </p>
                <div className="guide-item">
                  <div style={{ fontSize: '18px', marginTop: '2px' }}>🚨</div>
                  <div>
                    <h4 style={{ fontSize: '14px', marginBottom: '2.5px', fontWeight: 600 }}>Emergency Alerts</h4>
                    <p className="muted" style={{ fontSize: '12px', lineHeight: '1.5', margin: 0 }}>
                      When a vitals reading is classified as <strong>High Risk</strong>, an urgent real-time alert is triggered and broadcasted to on-duty supervisors.
                    </p>
                  </div>
                </div>
                <div className="guide-item">
                  <div style={{ fontSize: '18px', marginTop: '2px' }}>🔌</div>
                  <div>
                    <h4 style={{ fontSize: '14px', marginBottom: '2.5px', fontWeight: 600 }}>Offline-First Fallback</h4>
                    <p className="muted" style={{ fontSize: '12px', lineHeight: '1.5', margin: 0 }}>
                      When internet or syncing connectivity is offline, the client app falls back to the local Blood Pressure threshold rules instantly.
                    </p>
                  </div>
                </div>
                <div className="guide-item">
                  <div style={{ fontSize: '18px', marginTop: '2px' }}>🧠</div>
                  <div>
                    <h4 style={{ fontSize: '14px', marginBottom: '2.5px', fontWeight: 600 }}>AI Risk Model</h4>
                    <p className="muted" style={{ fontSize: '12px', lineHeight: '1.5', margin: 0 }}>
                      When online, the risk score cutoff determines the probability rating threshold (e.g. <strong>{Math.round(config.high_risk_cutoff * 100)}%</strong>) computed by the maternal health deep neural net.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions Panel */}
              <div className="card animate-fade-in" style={{ animationDelay: '300ms', padding: '1.25rem' }}>
                <h3 style={{ marginBottom: '0.75rem', fontSize: '14px' }}>⚙️ Configuration Controls</h3>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    className="btn btn--primary"
                    onClick={handleSave}
                    disabled={saving}
                    style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    {saving ? 'Saving...' : '💾 Save'}
                  </button>
                  <button
                    className="btn btn--ghost"
                    onClick={handleReset}
                    disabled={saving}
                    style={{ flex: 1, padding: '12px' }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
