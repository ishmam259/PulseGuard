import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import MobileLayout from '../../components/layout/MobileLayout'
import { useApp } from '../../context/AppContext'
import * as api from '../../services/api'
import { patientNavItems } from '../../data/navItems'
import $ from '../../config/strings'

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export default function Onboarding() {
  const { currentUser, locale, connectivity } = useApp()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    gestational_week: '',
    village: '',
    age: '',
    height: '',
    blood_type: '',
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState(null)

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5 MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => setPreviewUrl(ev.target.result)
    reader.readAsDataURL(file)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.gestational_week) {
      setError($('ONBOARD_ERR_WEEK_REQUIRED', locale))
      return
    }

    const week = parseInt(form.gestational_week)
    if (isNaN(week) || week < 1 || week > 45) {
      setError($('ONBOARD_ERR_WEEK_RANGE', locale))
      return
    }

    setSaving(true)
    try {
      // 1. Upload profile picture if selected
      let profilePictureUrl = null
      if (previewUrl) {
        setUploading(true)
        try {
          const uploadRes = await api.uploadProfileImage(previewUrl)
          if (uploadRes.ok) profilePictureUrl = uploadRes.url
        } catch {
          // Non-fatal: proceed without picture
        } finally {
          setUploading(false)
        }
      }

      // 2. Create patient profile with all the new fields
      const res = await api.createPatient({
        name: currentUser.name,
        gestational_week: week,
        village: form.village.trim() || undefined,
        age: form.age ? parseInt(form.age) : undefined,
        height: form.height ? parseFloat(form.height) : undefined,
        blood_type: form.blood_type || undefined,
        profile_picture_url: profilePictureUrl || undefined,
      })

      if (!res.ok) {
        throw new Error(res.error || 'Failed to create patient profile.')
      }

      // 3. Update user-level profile picture URL as well
      if (profilePictureUrl) {
        await api.updateProfile({
          name: currentUser.name,
          email: currentUser.email,
          phone: currentUser.phone,
          profile_picture_url: profilePictureUrl,
        })
      }

      navigate('/patient/dashboard')
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <MobileLayout
      title={$('PAGE_TITLE_ONBOARDING', locale)}
      status={connectivity}
      navItems={patientNavItems(locale)}
    >
      <div className="animate-fade-in">
        {/* Hero Card */}
        <div
          className="card"
          style={{
            background: 'var(--gradient-surface)',
            border: '1px solid var(--color-border)',
            borderLeft: '4px solid var(--color-primary)',
            padding: '2rem 1.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            {$('ONBOARD_WELCOME_PREFIX', locale)} {currentUser?.name?.split(' ')[0]}!
          </h2>
          <p className="muted" style={{ lineHeight: 1.6 }}>
            {$('ONBOARD_WELCOME_BODY', locale)}
          </p>
        </div>

        {/* Form Card */}
        <div className="card" style={{ padding: '1.75rem 1.5rem' }}>
          <h3 style={{ marginBottom: '0.25rem' }}>{$('ONBOARD_SECTION_HEADING', locale)}</h3>
          <p className="muted" style={{ marginBottom: '1.5rem', fontSize: '13px' }}>
            {$('ONBOARD_SECTION_SUBHEADING', locale)}
          </p>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
              <strong style={{ color: '#ef4444' }}>{error}</strong>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Profile Picture */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', padding: '1rem', border: '2px dashed var(--color-border)', borderRadius: '12px', cursor: 'pointer' }}
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--color-primary)' }} />
              ) : (
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--color-border)' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-muted)' }}>
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
              )}
              <span className="muted" style={{ fontSize: '13px', fontWeight: 500 }}>
                {previewUrl ? $('PROFILE_UPLOAD_CHANGE', locale) : $('PROFILE_UPLOAD_PICTURE', locale)} (optional)
              </span>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileSelect} />
            </div>

            {/* Gestational Week */}
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontWeight: 600, fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              {$('ONBOARD_LABEL_WEEK', locale)}
              <div className="input-wrapper">
                <input
                  id="gestational_week"
                  type="number"
                  className="input"
                  value={form.gestational_week}
                  onChange={handleChange('gestational_week')}
                  placeholder={$('ONBOARD_PH_WEEK', locale)}
                  min="1"
                  max="45"
                  required
                />
              </div>
              <span style={{ fontSize: '12px', color: 'var(--color-muted)', fontWeight: 400 }}>
                {$('ONBOARD_HINT_WEEK', locale)}
              </span>
            </label>

            {/* Age */}
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontWeight: 600, fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              {$('ONBOARD_LABEL_AGE', locale)}
              <div className="input-wrapper">
                <input
                  id="age"
                  type="number"
                  className="input"
                  value={form.age}
                  onChange={handleChange('age')}
                  placeholder={$('ONBOARD_PH_AGE', locale)}
                  min="10"
                  max="60"
                />
              </div>
            </label>

            {/* Height */}
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontWeight: 600, fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              {$('PROFILE_EDIT_LABEL_HEIGHT', locale)}
              <div className="input-wrapper">
                <input
                  id="height"
                  type="number"
                  className="input"
                  value={form.height}
                  onChange={handleChange('height')}
                  placeholder={$('PROFILE_EDIT_PH_HEIGHT', locale)}
                  min="50"
                  max="300"
                  step="0.1"
                />
              </div>
            </label>

            {/* Blood Type */}
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontWeight: 600, fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              {$('PROFILE_EDIT_LABEL_BLOOD_TYPE', locale)}
              <div className="input-wrapper">
                <select
                  id="blood_type"
                  className="input"
                  value={form.blood_type}
                  onChange={handleChange('blood_type')}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="">— Select blood type —</option>
                  {BLOOD_TYPES.map(bt => (
                    <option key={bt} value={bt}>{bt}</option>
                  ))}
                </select>
              </div>
            </label>

            {/* Village */}
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontWeight: 600, fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              {$('ONBOARD_LABEL_VILLAGE', locale)}
              <div className="input-wrapper">
                <input
                  id="village"
                  type="text"
                  className="input"
                  value={form.village}
                  onChange={handleChange('village')}
                  placeholder={$('ONBOARD_PH_VILLAGE', locale)}
                />
              </div>
            </label>

            <button
              id="complete-onboarding-btn"
              type="submit"
              className="btn btn--primary btn--large"
              disabled={saving || uploading}
              style={{ marginTop: '0.5rem' }}
            >
              {saving || uploading ? $('ONBOARD_BTN_LOADING', locale) : $('ONBOARD_BTN_SUBMIT', locale)}
            </button>
          </form>
        </div>
      </div>
    </MobileLayout>
  )
}
