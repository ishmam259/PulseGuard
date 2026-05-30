import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MobileLayout from '../../components/layout/MobileLayout'
import { useApp } from '../../context/AppContext'
import * as api from '../../services/api'
import { patientNavItems, workerNavItems } from '../../data/navItems'
import $ from '../../config/strings'

export default function Profile() {
  const { currentUser, setCurrentUser, logout, connectivity, locale } = useApp()
  const navigate = useNavigate()
  const [patient, setPatient] = useState(null)
  const [patientCount, setPatientCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Editing state
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    village: '',
    gestational_week: '',
  })

  useEffect(() => {
    async function loadProfileData() {
      try {
        if (currentUser?.role === 'patient') {
          const data = await api.getMyPatientProfile()
          if (data && data.patient) {
            setPatient(data.patient)
          }
        } else if (currentUser?.role === 'worker') {
          const patients = await api.getPatients()
          setPatientCount(patients ? patients.length : 0)
        }
      } catch (err) {
        console.error('Failed to load profile data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadProfileData()
  }, [currentUser])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const getInitials = (name) => {
    if (!name) return '??'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }

  const handleStartEdit = () => {
    setEditForm({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      village: patient?.village || '',
      gestational_week: patient?.gestational_week || '',
    })
    setIsEditing(true)
    setError('')
    setSuccess('')
  }

  const handleChange = (field) => (e) => {
    setEditForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSaveProfile = async () => {
    const trimmedName = editForm.name.trim()
    if (!trimmedName) {
      setError($('PROFILE_ERR_NAME_REQUIRED', locale))
      return
    }

    if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
      setError($('PROFILE_ERR_NAME_LETTERS', locale))
      return
    }

    if (editForm.phone && editForm.phone.trim() !== '') {
      const phoneDigits = editForm.phone.trim()
      if (!/^\d{11}$/.test(phoneDigits)) {
        setError($('PROFILE_ERR_PHONE_DIGITS', locale))
        return
      }
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      // 1. Update user profile (name, email, phone)
      const userRes = await api.updateProfile({
        name: trimmedName,
        email: editForm.email,
        phone: editForm.phone,
      })

      if (!userRes.ok) {
        throw new Error(userRes.error || 'Failed to update user profile details')
      }

      // 2. If patient, update patient details (village, gestational_week)
      if (isPatient && patient) {
        const patientRes = await api.updatePatient(patient.id, {
          village: editForm.village,
          gestational_week: editForm.gestational_week ? parseInt(editForm.gestational_week) : null,
        })

        if (!patientRes.ok) {
          throw new Error(patientRes.error || 'Failed to update patient details')
        }

        // Update local patient state
        setPatient(patientRes.patient)
      }

      // 3. Update current user in context
      setCurrentUser(userRes.user)

      setSuccess($('PROFILE_SUCCESS', locale))
      setIsEditing(false)
    } catch (err) {
      setError(err.message || 'An error occurred while saving profile.')
    } finally {
      setSaving(false)
    }
  }

  const isPatient = currentUser?.role === 'patient'
  const isWorker = currentUser?.role === 'worker'
  const isAdmin = currentUser?.role === 'admin'

  const navItems = isPatient ? patientNavItems(locale) : isWorker ? workerNavItems(locale) : []

  return (
    <MobileLayout
      title={$('PAGE_TITLE_PROFILE', locale)}
      status={connectivity}
      navItems={navItems}
    >
      <div className="animate-fade-in">
        {/* Alerts */}
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

        {/* Profile Card */}
        <div className="card profile-card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
          <div className="avatar large profile-modal-overlay">
            {getInitials(currentUser?.name)}
          </div>
          <h2 className="text-gradient" style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>{currentUser?.name || 'User Profile'}</h2>
          <p className="muted" style={{ textTransform: 'capitalize', fontWeight: '600', fontSize: '0.9rem' }}>
            {currentUser?.role || 'Guest'}
          </p>
          {isPatient && patient && (
            <p className="muted" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>{$('PROFILE_PATIENT_ID_PREFIX', locale)}{patient.id.slice(0, 8).toUpperCase()}</p>
          )}
          {isWorker && (
            <p className="muted" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>{$('PROFILE_WORKER_ID_PREFIX', locale)}{currentUser?.id.slice(0, 8).toUpperCase()}</p>
          )}
        </div>

        {/* Details or Edit Form based on state */}
        <div className="card" style={{ marginTop: '1.25rem', padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.25rem' }}>{isEditing ? $('PROFILE_SECTION_EDIT', locale) : $('PROFILE_SECTION_DETAILS', locale)}</h3>
          
          {loading ? (
            <p className="muted text-center" style={{ padding: '1rem 0' }}>{$('PROFILE_LOADING', locale)}</p>
          ) : isEditing ? (
            /* ── Edit Profile Form ── */
            <div className="form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <label>
                {$('PROFILE_EDIT_LABEL_NAME', locale)}
                <div className="input-wrapper">
                  <input
                    type="text"
                    className="input"
                    value={editForm.name}
                    onChange={handleChange('name')}
                    placeholder={$('PROFILE_EDIT_PH_NAME', locale)}
                  />
                </div>
              </label>
              <label>
                {$('PROFILE_EDIT_LABEL_EMAIL', locale)}
                <div className="input-wrapper">
                  <input
                    type="email"
                    className="input"
                    value={editForm.email}
                    onChange={handleChange('email')}
                    placeholder={$('PROFILE_EDIT_PH_EMAIL', locale)}
                  />
                </div>
              </label>
              <label>
                {$('PROFILE_EDIT_LABEL_PHONE', locale)}
                <div className="input-wrapper">
                  <input
                    type="text"
                    className="input"
                    value={editForm.phone}
                    onChange={handleChange('phone')}
                    placeholder={$('PROFILE_EDIT_PH_PHONE', locale)}
                  />
                </div>
              </label>

              {isPatient && patient && (
                <>
                  <label>
                    {$('PROFILE_EDIT_LABEL_VILLAGE', locale)}
                    <div className="input-wrapper">
                      <input
                        type="text"
                        className="input"
                        value={editForm.village}
                        onChange={handleChange('village')}
                        placeholder={$('PROFILE_EDIT_PH_VILLAGE', locale)}
                      />
                    </div>
                  </label>
                  <label>
                    {$('PROFILE_EDIT_LABEL_WEEK', locale)}
                    <div className="input-wrapper">
                      <input
                        type="number"
                        className="input"
                        value={editForm.gestational_week}
                        onChange={handleChange('gestational_week')}
                        placeholder={$('PROFILE_EDIT_PH_WEEK', locale)}
                        min="1"
                        max="45"
                      />
                    </div>
                  </label>
                </>
              )}
            </div>
          ) : (
            /* ── Profile Details View ── */
            isPatient && patient ? (
              <div className="profile-details-grid" style={{ marginTop: '1rem' }}>
                <div className="profile-detail-card">
                  <span className="profile-detail-label">{$('PROFILE_LABEL_PREG_WEEK', locale)}</span>
                  <span className="profile-detail-value--accent">{patient.gestational_week || 'N/A'}</span>
                </div>
                <div className="profile-detail-card">
                  <span className="profile-detail-label">{$('PROFILE_LABEL_RISK', locale)}</span>
                  <span className={`badge badge--${(patient.risk_level || 'low').toLowerCase()}`} style={{ marginTop: '0.25rem', alignSelf: 'flex-start' }}>
                    {patient.risk_level || 'Low'}
                  </span>
                </div>
                <div className="profile-detail-card">
                  <span className="profile-detail-label">{$('PROFILE_LABEL_VILLAGE', locale)}</span>
                  <span className="profile-detail-value">{patient.village || 'N/A'}</span>
                </div>
                <div className="profile-detail-card">
                  <span className="profile-detail-label">{$('PROFILE_LABEL_PHONE', locale)}</span>
                  <span className="profile-detail-value">{currentUser?.phone || 'N/A'}</span>
                </div>
                <div className="profile-detail-card" style={{ gridColumn: 'span 2' }}>
                  <span className="profile-detail-label">{$('PROFILE_LABEL_EMAIL', locale)}</span>
                  <span className="profile-detail-value--muted">{currentUser?.email || 'N/A'}</span>
                </div>
              </div>
            ) : isWorker ? (
              <div className="profile-details-grid" style={{ marginTop: '1rem' }}>
                <div className="profile-detail-card">
                  <span className="profile-detail-label">{$('PROFILE_LABEL_ASSIGNED_PATIENTS', locale)}</span>
                  <span className="profile-detail-value--accent">{patientCount}</span>
                </div>
                <div className="profile-detail-card">
                  <span className="profile-detail-label">{$('PROFILE_LABEL_PHONE', locale)}</span>
                  <span className="profile-detail-value">{currentUser?.phone || 'N/A'}</span>
                </div>
                <div className="profile-detail-card" style={{ gridColumn: 'span 2' }}>
                  <span className="profile-detail-label">{$('PROFILE_LABEL_EMAIL', locale)}</span>
                  <span className="profile-detail-value--muted">{currentUser?.email || 'N/A'}</span>
                </div>
              </div>
            ) : isAdmin ? (
              <div className="profile-details-grid" style={{ marginTop: '1rem' }}>
                <div className="profile-detail-card">
                  <span className="profile-detail-label">{$('PROFILE_LABEL_SYSTEM_ROLE', locale)}</span>
                  <span className="profile-detail-value">{$('PROFILE_LABEL_ADMIN_VALUE', locale)}</span>
                </div>
                <div className="profile-detail-card">
                  <span className="profile-detail-label">{$('PROFILE_LABEL_PHONE', locale)}</span>
                  <span className="profile-detail-value">{currentUser?.phone || 'N/A'}</span>
                </div>
                <div className="profile-detail-card" style={{ gridColumn: 'span 2' }}>
                  <span className="profile-detail-label">{$('PROFILE_LABEL_EMAIL', locale)}</span>
                  <span className="profile-detail-value--muted">{currentUser?.email || 'N/A'}</span>
                </div>
              </div>
            ) : (
              <div className="profile-details-grid" style={{ marginTop: '1rem' }}>
                <div className="profile-detail-card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <span className="profile-detail-label">{$('PROFILE_LABEL_PROFILE_STATUS', locale)}</span>
                  <span className="profile-detail-value">{$('PROFILE_LABEL_PENDING', locale)}</span>
                  <button type="button"
                    className="btn btn--primary btn--sm" 
                    style={{ marginTop: '0.5rem', fontSize: '0.85rem', padding: '8px 16px' }}
                    onClick={() => navigate('/patient/onboarding')}
                  >
                    {$('PROFILE_BTN_COMPLETE_REG', locale)}
                  </button>
                </div>
                <div className="profile-detail-card">
                  <span className="profile-detail-label">{$('PROFILE_LABEL_PHONE', locale)}</span>
                  <span className="profile-detail-value">{currentUser?.phone || 'N/A'}</span>
                </div>
                <div className="profile-detail-card">
                  <span className="profile-detail-label">{$('PROFILE_LABEL_EMAIL', locale)}</span>
                  <span className="profile-detail-value--muted">{currentUser?.email || 'N/A'}</span>
                </div>
              </div>
            )
          )}
        </div>

        {/* Actions */}
        <div className="profile-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          {isEditing ? (
            <>
              <button
                type="button"
                className="btn btn--primary"
                style={{ flex: 1 }}
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? $('PROFILE_BTN_SAVING', locale) : $('PROFILE_BTN_SAVE_CHANGES', locale)}
              </button>
              <button
                type="button"
                className="btn btn--secondary"
                style={{ flex: 1 }}
                onClick={() => setIsEditing(false)}
                disabled={saving}
              >
                {$('PROFILE_BTN_CANCEL', locale)}
              </button>
            </>
          ) : (
            <>
              <button type="button" className="btn btn--secondary" style={{ flex: 1 }} onClick={handleStartEdit}>
                {$('PROFILE_BTN_EDIT', locale)}
              </button>
              <button type="button" className="btn btn--ghost" style={{ flex: 1 }} onClick={handleLogout}>
                {$('PROFILE_BTN_LOGOUT', locale)}
              </button>
            </>
          )}
        </div>
      </div>
    </MobileLayout>
  )
}
