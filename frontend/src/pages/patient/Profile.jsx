import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import MobileLayout from '../../components/layout/MobileLayout'
import { useApp } from '../../context/AppContext'
import * as api from '../../services/api'
import { patientNavItems, workerNavItems } from '../../data/navItems'
import $ from '../../config/strings'
import { Pencil, Check, ShieldAlert, Save, Camera } from 'lucide-react'

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const FALLBACK_AVATAR = '/assets/images/No_pf.png'

export default function Profile() {
  const { currentUser, setCurrentUser, connectivity, locale } = useApp()
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

  const riskLevelClass = (level) => {
    const l = (level || 'low').toLowerCase();
    if (l === 'high') return 'badge--high';
    if (l === 'moderate') return 'badge--moderate';
    return 'badge--low';
  }

  const splitDisplayName = (fullName) => {
    if (!fullName) return { first: 'User', last: 'Profile' }
    const parts = fullName.split(' ')
    if (parts.length === 1) return { first: parts[0], last: '' }
    const last = parts.pop()
    const first = parts.join(' ')
    return { first, last }
  }

  const nameParts = splitDisplayName(currentUser?.name)

  return (
    <MobileLayout
      title={$('PAGE_TITLE_PROFILE', locale)}
      status={connectivity}
      navItems={navItems}
    >
      {/* Hidden file input for profile picture */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        style={{ display: 'none' }}
      />

      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Error Alert */}
        {error && (
          <div style={{ borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.2)', backgroundColor: 'var(--color-danger-dim)', padding: '16px 20px', fontSize: '13px', color: 'var(--color-danger-light)', display: 'flex', alignItems: 'start', gap: '12px' }}>
            <ShieldAlert className="h-5 w-5 shrink-0" style={{ marginTop: '2px' }} />
            <strong>{error}</strong>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div style={{ borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.2)', backgroundColor: 'var(--color-success-dim)', padding: '16px 20px', fontSize: '13px', color: 'var(--color-success)', display: 'flex', alignItems: 'start', gap: '12px' }}>
            <Check className="h-5 w-5 shrink-0" style={{ marginTop: '2px' }} />
            <strong>{success}</strong>
          </div>
        )}

        {/* Identity Header Card */}
        <div className="glass" style={{ position: 'relative', overflow: 'hidden', borderRadius: '24px', padding: '32px', textAlign: 'center' }}>

          {/* Circular avatar — shows photo/preview when available, initials otherwise */}
          <div
            className="relative"
            style={{ position: 'relative', display: 'grid', height: '96px', width: '96px', placeItems: 'center', borderRadius: '50%', background: 'var(--gradient-primary)', fontSize: '24px', fontWeight: 'bold', color: 'white', boxShadow: 'var(--shadow-glow-primary)', margin: '0 auto 20px', cursor: isEditing ? 'pointer' : 'default', overflow: 'hidden' }}
            onClick={isEditing ? () => fileInputRef.current?.click() : undefined}
            title={isEditing ? 'Change profile photo' : undefined}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            ) : currentUser?.profile_picture_url ? (
              <img src={currentUser.profile_picture_url} alt="Profile" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            ) : (
              getInitials(currentUser?.name)
            )}
            {isEditing && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                <Camera style={{ width: '28px', height: '28px', color: 'white' }} />
              </div>
            )}
          </div>

          {/* Serif font name with gradient first name highlight */}
          <h2 className="font-display" style={{ fontSize: '2.2rem', letterSpacing: '-0.02em', marginBottom: '8px' }}>
            {nameParts.first} {nameParts.last && <span className="italic text-gradient-primary">{nameParts.last}</span>}
          </h2>

          <p style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)' }}>
            {currentUser?.role || 'Guest'}
          </p>
          
          {isPatient && patient && (
            <p className="muted" style={{ fontSize: '12px', marginTop: '6px' }}>
              {$('PROFILE_PATIENT_ID_PREFIX', locale)}{patient.id.slice(0, 8).toUpperCase()}
            </p>
          )}
          {isWorker && (
            <p className="muted" style={{ fontSize: '12px', marginTop: '6px' }}>
              {$('PROFILE_WORKER_ID_PREFIX', locale)}{currentUser?.id.slice(0, 8).toUpperCase()}
            </p>
          )}
        </div>

        {/* Details or Edit Form Container */}
        <div className="glass" style={{ position: 'relative', overflow: 'hidden', borderRadius: '24px', padding: '32px' }}>

          <h3 className="font-display" style={{ fontSize: '1.6rem', letterSpacing: '-0.01em', marginBottom: '24px' }}>
            {isEditing ? $('PROFILE_SECTION_EDIT', locale) : $('PROFILE_SECTION_DETAILS', locale)}
          </h3>

          {!loading && !isEditing && (
            <button
              type="button"
              onClick={handleStartEdit}
              title={$('PROFILE_BTN_EDIT', locale)}
              className="profile-edit-btn-top"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {loading ? (
            <p className="muted text-center" style={{ padding: '24px 0', animation: 'pulse 2s infinite' }}>{$('PROFILE_LOADING', locale)}</p>
          ) : isEditing ? (

            /* ── Edit Profile Form Card ── */
            <div className="form-grid" style={{ gap: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-muted)' }}>
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

              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-muted)' }}>
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

              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-muted)' }}>
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

              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-muted)' }}>
                {$('PROFILE_EDIT_LABEL_HEIGHT', locale)}
                <div className="input-wrapper">
                  <input type="number" className="input" value={editForm.height} onChange={handleChange('height')} placeholder={$('PROFILE_EDIT_PH_HEIGHT', locale)} min="50" max="300" step="0.1" />
                </div>
              </label>

              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-muted)' }}>
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
                  <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-muted)' }}>
                    {$('PROFILE_EDIT_LABEL_VILLAGE', locale)}
                    <div className="input-wrapper">
                      <input type="text" className="input" value={editForm.village} onChange={handleChange('village')} placeholder={$('PROFILE_EDIT_PH_VILLAGE', locale)} />
                    </div>
                  </label>

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

            /* ── Profile Details Grid View ── */
            isPatient && patient ? (
              <div className="detail-cards-grid two-cols">
                
                {/* Gestational Week Card */}
                <div className="detail-card">
                  <p className="detail-card-label">
                    {$('PROFILE_LABEL_PREG_WEEK', locale)}
                  </p>
                  <p className="detail-card-value--accent">
                    {patient.gestational_week || 'N/A'}
                  </p>
                  {patient.lmp_recorded_date != null && patient.initial_gestational_week != null && (
                    <p className="muted" style={{ marginTop: '8px', fontSize: '11px' }}>
                      {$('PREG_WEEK_INITIAL', locale).replace('$W', patient.initial_gestational_week)}{' '}
                      {new Date(patient.lmp_recorded_date).toLocaleDateString(
                        locale === 'bn' ? 'bn-BD' : 'en-GB',
                        { day: 'numeric', month: 'short', year: 'numeric' }
                      )}
                    </p>
                  )}
                </div>

                {/* Risk level badge Card */}
                <div className="detail-card">
                  <p className="detail-card-label">
                    {$('PROFILE_LABEL_RISK', locale)}
                  </p>
                  <div style={{ marginTop: '12px' }}>
                    <span className={`badge ${riskLevelClass(patient.risk_level)}`} style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
                      {patient.risk_level || 'Low'}
                    </span>
                  </div>
                </div>

                {/* Village Card */}
                <div className="detail-card">
                  <p className="detail-card-label">
                    {$('PROFILE_LABEL_VILLAGE', locale)}
                  </p>
                  <p className="detail-card-value">
                    {patient.village || 'N/A'}
                  </p>
                </div>

                {/* Phone Card */}
                <div className="detail-card">
                  <p className="detail-card-label">
                    {$('PROFILE_LABEL_PHONE', locale)}
                  </p>
                  <p className="detail-card-value">
                    {currentUser?.phone || 'N/A'}
                  </p>
                </div>

                {/* Email Card spanning full row */}
                <div className="detail-card" style={{ gridColumn: 'span 2' }}>
                  <p className="detail-card-label">
                    {$('PROFILE_LABEL_EMAIL', locale)}
                  </p>
                  <p className="detail-card-value">
                    {currentUser?.email || 'N/A'}
                  </p>
                </div>

              </div>
            ) : isWorker ? (
              /* Worker details grid */
              <div className="detail-cards-grid two-cols">
                
                {/* Patients Count Card */}
                <div className="detail-card">
                  <p className="detail-card-label">
                    {$('PROFILE_LABEL_ASSIGNED_PATIENTS', locale)}
                  </p>
                  <p className="detail-card-value--accent">
                    {patientCount}
                  </p>
                </div>

                {/* Phone Card */}
                <div className="detail-card">
                  <p className="detail-card-label">
                    {$('PROFILE_LABEL_PHONE', locale)}
                  </p>
                  <p className="detail-card-value">
                    {currentUser?.phone || 'N/A'}
                  </p>
                </div>

                {/* Email Card */}
                <div className="detail-card" style={{ gridColumn: 'span 2' }}>
                  <p className="detail-card-label">
                    {$('PROFILE_LABEL_EMAIL', locale)}
                  </p>
                  <p className="detail-card-value">
                    {currentUser?.email || 'N/A'}
                  </p>
                </div>

              </div>
            ) : isAdmin ? (
              /* Admin details grid */
              <div className="detail-cards-grid two-cols">
                
                {/* System Role Card */}
                <div className="detail-card">
                  <p className="detail-card-label">
                    {$('PROFILE_LABEL_SYSTEM_ROLE', locale)}
                  </p>
                  <p className="detail-card-value">
                    {$('PROFILE_LABEL_ADMIN_VALUE', locale)}
                  </p>
                </div>

                {/* Phone Card */}
                <div className="detail-card">
                  <p className="detail-card-label">
                    {$('PROFILE_LABEL_PHONE', locale)}
                  </p>
                  <p className="detail-card-value">
                    {currentUser?.phone || 'N/A'}
                  </p>
                </div>

                {/* Email Card */}
                <div className="detail-card" style={{ gridColumn: 'span 2' }}>
                  <p className="detail-card-label">
                    {$('PROFILE_LABEL_EMAIL', locale)}
                  </p>
                  <p className="detail-card-value">
                    {currentUser?.email || 'N/A'}
                  </p>
                </div>

              </div>
            ) : (
              /* Registration pending details grid */
              <div className="detail-cards-grid two-cols">

                {/* Profile pending Card */}
                <div className="detail-card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
                  <p className="detail-card-label">
                    {$('PROFILE_LABEL_PROFILE_STATUS', locale)}
                  </p>
                  <p className="detail-card-value" style={{ color: 'var(--color-warning)' }}>
                    {$('PROFILE_LABEL_PENDING', locale)}
                  </p>
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => navigate('/patient/onboarding')}
                    style={{ marginTop: '8px', borderRadius: '9999px', padding: '10px 24px' }}
                  >
                    {$('PROFILE_BTN_COMPLETE_REG', locale)}
                  </button>
                </div>

                {/* Phone Card */}
                <div className="detail-card">
                  <p className="detail-card-label">
                    {$('PROFILE_LABEL_PHONE', locale)}
                  </p>
                  <p className="detail-card-value">
                    {currentUser?.phone || 'N/A'}
                  </p>
                </div>

                {/* Email Card */}
                <div className="detail-card">
                  <p className="detail-card-label">
                    {$('PROFILE_LABEL_EMAIL', locale)}
                  </p>
                  <p className="detail-card-value">
                    {currentUser?.email || 'N/A'}
                  </p>
                </div>

              </div>
            )
          )}
        </div>

        {/* Action button triggers */}
        {isEditing && (
          <div style={{ display: 'flex', gap: '16px', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={saving}
              className="btn btn--primary"
              style={{
                flex: 1,
                height: '48px',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontWeight: '600'
              }}
            >
              <Save className="h-4 w-4" />
              <span>{saving ? $('PROFILE_BTN_SAVING', locale) : $('PROFILE_BTN_SAVE_CHANGES', locale)}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsEditing(false)}
              disabled={saving}
              className="btn btn--secondary"
              style={{
                flex: 1,
                height: '48px',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600',
                border: '1px solid var(--color-border)',
                backgroundColor: 'color-mix(in oklab, var(--color-surface) 60%, transparent)',
                color: 'var(--color-text)'
              }}
            >
              {$('PROFILE_BTN_CANCEL', locale)}
            </button>
          </div>
        )}
      </div>
    </MobileLayout>
  )
}
