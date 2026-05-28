import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MobileLayout from '../../components/layout/MobileLayout'
import { useApp } from '../../context/AppContext'
import * as api from '../../services/api'
import { patientNavItems } from '../../data/navItems'

export default function Onboarding() {
  const { currentUser } = useApp()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    gestational_week: '',
    village: '',
    age: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.gestational_week) {
      setError('Please enter your current gestational week.')
      return
    }

    const week = parseInt(form.gestational_week)
    if (isNaN(week) || week < 1 || week > 45) {
      setError('Gestational week must be between 1 and 45.')
      return
    }

    setSaving(true)
    try {
      const res = await api.createPatient({
        name: currentUser.name,
        gestational_week: week,
        village: form.village.trim() || undefined,
        age: form.age ? parseInt(form.age) : undefined,
      })

      if (!res.ok) {
        throw new Error(res.error || 'Failed to create patient profile.')
      }

      // Profile created — go to dashboard
      navigate('/patient/dashboard')
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <MobileLayout title="Set Up Profile" navItems={patientNavItems}>
      <div className="animate-fade-in">
        {/* Hero Card */}
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, rgba(36,174,124,0.14), rgba(121,181,236,0.08))',
            border: '1px solid rgba(36,174,124,0.25)',
            borderLeft: '5px solid var(--color-primary)',
            padding: '2rem 1.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🌿</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Welcome, {currentUser?.name?.split(' ')[0]}!
          </h2>
          <p className="muted" style={{ lineHeight: 1.6 }}>
            To get started with PulseGuard, we need a few details to set up your maternal health profile. This will unlock vitals tracking, AI health checks, and personalised guidance.
          </p>
        </div>

        {/* Form Card */}
        <div className="card" style={{ padding: '1.75rem 1.5rem' }}>
          <h3 style={{ marginBottom: '0.25rem' }}>Medical Profile Setup</h3>
          <p className="muted" style={{ marginBottom: '1.5rem', fontSize: '13px' }}>
            All fields marked <span style={{ color: 'var(--color-primary)' }}>*</span> are required.
          </p>

          {error && (
            <div
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
              }}
            >
              <strong style={{ color: '#ef4444' }}>{error}</strong>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Gestational Week */}
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontWeight: 600, fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              Current Pregnancy Week <span style={{ color: 'var(--color-primary)' }}>*</span>
              <div className="input-wrapper">
                <input
                  id="gestational_week"
                  type="number"
                  className="input"
                  value={form.gestational_week}
                  onChange={handleChange('gestational_week')}
                  placeholder="e.g. 24"
                  min="1"
                  max="45"
                  required
                />
              </div>
              <span style={{ fontSize: '12px', color: 'var(--color-muted)', fontWeight: 400 }}>
                Enter a value between 1 and 45.
              </span>
            </label>

            {/* Age */}
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontWeight: 600, fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              Your Age
              <div className="input-wrapper">
                <input
                  id="age"
                  type="number"
                  className="input"
                  value={form.age}
                  onChange={handleChange('age')}
                  placeholder="e.g. 26"
                  min="10"
                  max="60"
                />
              </div>
            </label>

            {/* Village */}
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontWeight: 600, fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              Village / Clinic Area
              <div className="input-wrapper">
                <input
                  id="village"
                  type="text"
                  className="input"
                  value={form.village}
                  onChange={handleChange('village')}
                  placeholder="e.g. Kurigram Village A"
                />
              </div>
            </label>

            <button
              id="complete-onboarding-btn"
              type="submit"
              className="btn btn--primary btn--large"
              disabled={saving}
              style={{ marginTop: '0.5rem' }}
            >
              {saving ? 'Setting up profile…' : '✓ Complete Registration'}
            </button>
          </form>
        </div>
      </div>
    </MobileLayout>
  )
}
