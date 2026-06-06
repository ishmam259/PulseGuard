import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import MobileLayout from '../../components/layout/MobileLayout'
import { useApp } from '../../context/AppContext'
import * as api from '../../services/api'
import { patientNavItems, workerNavItems } from '../../data/navItems'
import $ from '../../config/strings'

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const FALLBACK_AVATAR = '/assets/images/No_pf.png'

export default function Profile() {
  const { currentUser, setCurrentUser, logout, connectivity, locale } = useApp()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [patient, setPatient] = useState(null)
  const [patientCount, setPatientCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Editing state
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [previewUrl, setPreviewUrl] = useState(null)

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    village: '',
    gestational_week: '',
    height: '',
    blood_type: '',
    address: '',
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
    return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
  }

  const handleStartEdit = () => {
    setEditForm({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      village: patient?.village || '',
      gestational_week: patient?.gestational_week || '',
      height: isPatient ? (patient?.height || '') : (currentUser?.height || ''),
      blood_type: isPatient ? (patient?.blood_type || '') : (currentUser?.blood_type || ''),
      address: currentUser?.address || '',
    })
    setPreviewUrl(null)
    setIsEditing(true)
    setError('')
    setSuccess('')
  }

  const handleChange = (field) => (e) => {
    setEditForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  // Handle profile picture file selection → preview
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

  // Upload the selected image to Cloudinary via our backend
  const handleUploadImage = async () => {
    if (!previewUrl) return null
    setUploading(true)
    try {
      const res = await api.uploadProfileImage(previewUrl)
      if (!res.ok) throw new Error(res.error || 'Upload failed')
      setSuccess($('PROFILE_UPLOAD_SUCCESS', locale))
      setPreviewUrl(null)
      // Update the user in context with the new picture url
      setCurrentUser((prev) => ({ ...prev, profile_picture_url: res.url }))
      return res.url
    } catch (err) {
      setError($('PROFILE_UPLOAD_ERROR', locale))
      return null
    } finally {
      setUploading(false)
    }
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
      if (!/^\d{11}$/.test(editForm.phone.trim())) {
        setError($('PROFILE_ERR_PHONE_DIGITS', locale))
        return
      }
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      // 1. Upload profile picture if one was selected
      let newPictureUrl = currentUser?.profile_picture_url || null
      if (previewUrl) {
        const uploaded = await handleUploadImage()
        if (uploaded) newPictureUrl = uploaded
      }

      // 2. Update user profile (name, email, phone + new fields)
      const userRes = await api.updateProfile({
        name: trimmedName,
        email: editForm.email,
        phone: editForm.phone,
        address: editForm.address || null,
        blood_type: editForm.blood_type || null,
        height: editForm.height ? parseFloat(editForm.height) : null,
        profile_picture_url: newPictureUrl,
      })

      if (!userRes.ok) {
        throw new Error(userRes.error || 'Failed to update user profile details')
      }

      // 3. If patient, update patient-specific fields
      if (isPatient && patient) {
        const patientUpdate = {
          village: editForm.village,
          height: editForm.height ? parseFloat(editForm.height) : null,
          blood_type: editForm.blood_type || null,
        }
        if (!patient.lmp_date && editForm.gestational_week) {
          patientUpdate.gestational_week = parseInt(editForm.gestational_week)
        }
        const patientRes = await api.updatePatient(patient.id, patientUpdate)
        if (!patientRes.ok) {
          throw new Error(patientRes.error || 'Failed to update patient details')
        }
        setPatient(patientRes.patient)
      }

      // 4. Update current user in context
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

  // Determine which picture to show
  const displayPicture = previewUrl
    || (isPatient ? (patient?.profile_picture_url || currentUser?.profile_picture_url) : currentUser?.profile_picture_url)
    || null

  return (
    <MobileLayout
      title={$('PAGE_TITLE_PROFILE', locale)}
      status={connectivity}
      navItems={navItems}
    >
      <div className="animate-fade-in">
        {/* Alerts */}
        {error && (
          <div className="alert-panel" style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)', marginBottom: '1rem', padding: '0.75rem', borderRadius: '6px' }}>
            <strong style={{ color: '#ef4444' }}>{error}</strong>
          </div>
        )}
        {success && (
          <div className="alert-panel" style={{ background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)', marginBottom: '1rem', padding: '0.75rem', borderRadius: '6px' }}>
            <strong style={{ color: 'var(--color-success)' }}>{success}</strong>
          </div>
        )}

        {/* ── Profile Card ── */}
        <div className="card profile-card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
          {/* Profile Picture */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
            {displayPicture ? (
              <img
                src={displayPicture}
                alt="Profile"
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid var(--color-primary)',
                  boxShadow: '0 0 0 4px rgba(var(--color-primary-rgb, 99,102,241),0.15)',
                }}
                onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_AVATAR }}
              />
            ) : (
              <div
                className="avatar large profile-modal-overlay"
                style={{ width: 88, height: 88, fontSize: '2rem', border: '3px solid var(--color-primary)' }}
              >
                {getInitials(currentUser?.name)}
              </div>
            )}
            {/* Camera icon overlay for editing */}
            {isEditing && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                title={$('PROFILE_UPLOAD_PICTURE', locale)}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'var(--color-primary)',
                  border: '2px solid var(--color-surface)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
          </div>

          <h2 className="text-gradient" style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>
            {currentUser?.name || 'User Profile'}
          </h2>
          <p className="muted" style={{ textTransform: 'capitalize', fontWeight: '600', fontSize: '0.85rem' }}>
            {currentUser?.role || 'Guest'}
          </p>
          {isPatient && patient && (
            <p className="muted" style={{ fontSize: '0.78rem', marginTop: '0.2rem' }}>
              {$('PROFILE_PATIENT_ID_PREFIX', locale)}{patient.id.slice(0, 8).toUpperCase()}
            </p>
          )}
          {isWorker && (
            <p className="muted" style={{ fontSize: '0.78rem', marginTop: '0.2rem' }}>
              {$('PROFILE_WORKER_ID_PREFIX', locale)}{currentUser?.id.slice(0, 8).toUpperCase()}
            </p>
          )}

          {/* Upload button hint when editing */}
          {isEditing && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn btn--ghost"
              disabled={uploading}
              style={{ marginTop: '0.75rem', fontSize: '0.8rem', padding: '6px 16px' }}
            >
              {uploading
                ? $('PROFILE_UPLOADING', locale)
                : previewUrl
                  ? $('PROFILE_UPLOAD_CHANGE', locale)
                  : $('PROFILE_UPLOAD_PICTURE', locale)}
            </button>
          )}
        </div>

        {/* ── Details / Edit Card ── */}
        <div className="card" style={{ marginTop: '1.25rem', padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.25rem' }}>
            {isEditing ? $('PROFILE_SECTION_EDIT', locale) : $('PROFILE_SECTION_DETAILS', locale)}
          </h3>

          {loading ? (
            <p className="muted text-center" style={{ padding: '1rem 0' }}>{$('PROFILE_LOADING', locale)}</p>
          ) : isEditing ? (
            /* ── Edit Form ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              {/* Name */}
              <label>
                {$('PROFILE_EDIT_LABEL_NAME', locale)}
                <div className="input-wrapper">
                  <input type="text" className="input" value={editForm.name} onChange={handleChange('name')} placeholder={$('PROFILE_EDIT_PH_NAME', locale)} />
                </div>
              </label>

              {/* Email */}
              <label>
                {$('PROFILE_EDIT_LABEL_EMAIL', locale)}
                <div className="input-wrapper">
                  <input type="email" className="input" value={editForm.email} onChange={handleChange('email')} placeholder={$('PROFILE_EDIT_PH_EMAIL', locale)} />
                </div>
              </label>

              {/* Phone */}
              <label>
                {$('PROFILE_EDIT_LABEL_PHONE', locale)}
                <div className="input-wrapper">
                  <input type="text" className="input" value={editForm.phone} onChange={handleChange('phone')} placeholder={$('PROFILE_EDIT_PH_PHONE', locale)} />
                </div>
              </label>

              {/* Height */}
              <label>
                {$('PROFILE_EDIT_LABEL_HEIGHT', locale)}
                <div className="input-wrapper">
                  <input type="number" className="input" value={editForm.height} onChange={handleChange('height')} placeholder={$('PROFILE_EDIT_PH_HEIGHT', locale)} min="50" max="300" step="0.1" />
                </div>
              </label>

              {/* Blood Type */}
              <label>
                {$('PROFILE_EDIT_LABEL_BLOOD_TYPE', locale)}
                <div className="input-wrapper">
                  <select className="input" value={editForm.blood_type} onChange={handleChange('blood_type')} style={{ cursor: 'pointer' }}>
                    <option value="">— Select blood type —</option>
                    {BLOOD_TYPES.map(bt => (
                      <option key={bt} value={bt}>{bt}</option>
                    ))}
                  </select>
                </div>
              </label>

              {/* Patient-specific fields */}
              {isPatient && patient && (
                <>
                  <label>
                    {$('PROFILE_EDIT_LABEL_VILLAGE', locale)}
                    <div className="input-wrapper">
                      <input type="text" className="input" value={editForm.village} onChange={handleChange('village')} placeholder={$('PROFILE_EDIT_PH_VILLAGE', locale)} />
                    </div>
                  </label>
                  {!patient.lmp_date && (
                    <label>
                      {$('PROFILE_EDIT_LABEL_WEEK', locale)}
                      <div className="input-wrapper">
                        <input type="number" className="input" value={editForm.gestational_week} onChange={handleChange('gestational_week')} placeholder={$('PROFILE_EDIT_PH_WEEK', locale)} min="1" max="45" />
                      </div>
                    </label>
                  )}
                </>
              )}

              {/* Worker-specific: Address */}
              {isWorker && (
                <label>
                  {$('PROFILE_EDIT_LABEL_ADDRESS', locale)}
                  <div className="input-wrapper">
                    <input type="text" className="input" value={editForm.address} onChange={handleChange('address')} placeholder={$('PROFILE_EDIT_PH_ADDRESS', locale)} />
                  </div>
                </label>
              )}
            </div>
          ) : (
            /* ── Details View ── */
            isPatient && patient ? (
              <div className="profile-details-grid" style={{ marginTop: '1rem' }}>
                <div className="profile-detail-card">
                  <span className="profile-detail-label">{$('PROFILE_LABEL_PREG_WEEK', locale)}</span>
                  <span className="profile-detail-value--accent">{patient.gestational_week || 'N/A'}</span>
                  {patient.lmp_recorded_date != null && patient.initial_gestational_week != null && (
                    <span className="muted" style={{ fontSize: '11px', marginTop: '2px' }}>
                      {$('PREG_WEEK_INITIAL', locale).replace('$W', patient.initial_gestational_week)}{' '}
                      {new Date(patient.lmp_recorded_date).toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
                <div className="profile-detail-card">
                  <span className="profile-detail-label">{$('PROFILE_LABEL_RISK', locale)}</span>
                  <span className={`badge badge--${(patient.risk_level || 'low').toLowerCase()}`} style={{ marginTop: '0.25rem', alignSelf: 'flex-start' }}>
                    {patient.risk_level || 'Low'}
                  </span>
                </div>
                <div className="profile-detail-card">
                  <span className="profile-detail-label">{$('PROFILE_LABEL_HEIGHT', locale)}</span>
                  <span className="profile-detail-value">{patient.height ? `${patient.height} cm` : 'N/A'}</span>
                </div>
                <div className="profile-detail-card">
                  <span className="profile-detail-label">{$('PROFILE_LABEL_BLOOD_TYPE', locale)}</span>
                  <span className="profile-detail-value--accent">{patient.blood_type || 'N/A'}</span>
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
                  <span className="profile-detail-label">{$('PROFILE_LABEL_HEIGHT', locale)}</span>
                  <span className="profile-detail-value">{currentUser?.height ? `${currentUser.height} cm` : 'N/A'}</span>
                </div>
                <div className="profile-detail-card">
                  <span className="profile-detail-label">{$('PROFILE_LABEL_BLOOD_TYPE', locale)}</span>
                  <span className="profile-detail-value--accent">{currentUser?.blood_type || 'N/A'}</span>
                </div>
                <div className="profile-detail-card">
                  <span className="profile-detail-label">{$('PROFILE_LABEL_PHONE', locale)}</span>
                  <span className="profile-detail-value">{currentUser?.phone || 'N/A'}</span>
                </div>
                <div className="profile-detail-card" style={{ gridColumn: 'span 2' }}>
                  <span className="profile-detail-label">{$('PROFILE_LABEL_ADDRESS', locale)}</span>
                  <span className="profile-detail-value--muted">{currentUser?.address || 'N/A'}</span>
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
              /* Patient with no profile yet */
              <div className="profile-details-grid" style={{ marginTop: '1rem' }}>
                <div className="profile-detail-card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <span className="profile-detail-label">{$('PROFILE_LABEL_PROFILE_STATUS', locale)}</span>
                  <span className="profile-detail-value">{$('PROFILE_LABEL_PENDING', locale)}</span>
                  <button
                    type="button"
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

        {/* ── Actions ── */}
        <div className="profile-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          {isEditing ? (
            <>
              <button
                type="button"
                className="btn btn--primary"
                style={{ flex: 1 }}
                onClick={handleSaveProfile}
                disabled={saving || uploading}
              >
                {saving ? $('PROFILE_BTN_SAVING', locale) : $('PROFILE_BTN_SAVE_CHANGES', locale)}
              </button>
              <button
                type="button"
                className="btn btn--secondary"
                style={{ flex: 1 }}
                onClick={() => { setIsEditing(false); setPreviewUrl(null); setError(''); setSuccess('') }}
                disabled={saving || uploading}
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
