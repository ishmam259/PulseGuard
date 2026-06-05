import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MobileLayout from '../../components/layout/MobileLayout'
import { useApp } from '../../context/AppContext'
import * as api from '../../services/api'
import { patientNavItems, workerNavItems } from '../../data/navItems'
import $ from '../../config/strings'
import { Pencil, LogOut, Check, ShieldAlert, Save } from 'lucide-react'

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
        const patientUpdate = { village: editForm.village }
        if (!patient.lmp_date && editForm.gestational_week) {
          patientUpdate.gestational_week = parseInt(editForm.gestational_week)
        }
        const patientRes = await api.updatePatient(patient.id, patientUpdate)

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

  const inputStyle = {
    height: '48px',
    borderRadius: '16px',
    border: '1px solid var(--color-border)',
    backgroundColor: 'color-mix(in oklab, var(--color-surface) 60%, transparent)',
    padding: '0 16px',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    color: 'var(--color-text)',
    marginTop: '8px'
  }

  return (
    <MobileLayout
      title={$('PAGE_TITLE_PROFILE', locale)}
      status={connectivity}
      navItems={navItems}
    >
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
          <div className="absolute top-0 left-0 h-full w-1 bg-[var(--gradient-primary)]" style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '4px', background: 'var(--gradient-primary)' }} />
          
          {/* Circular gradient initials avatar */}
          <div className="relative" style={{ display: 'grid', height: '96px', width: '96px', placeItems: 'center', borderRadius: '50%', background: 'var(--gradient-primary)', fontSize: '24px', fontWeight: 'bold', color: 'white', boxShadow: 'var(--shadow-glow-primary)', margin: '0 auto 20px' }}>
            {getInitials(currentUser?.name)}
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
          <div className="absolute top-0 left-0 h-full w-1 bg-[var(--gradient-primary)]" style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '4px', background: 'var(--gradient-primary)' }} />
          
          <h3 className="font-display" style={{ fontSize: '1.6rem', letterSpacing: '-0.01em', marginBottom: '24px' }}>
            {isEditing ? $('PROFILE_SECTION_EDIT', locale) : $('PROFILE_SECTION_DETAILS', locale)}
          </h3>

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
                    value={editForm.name}
                    onChange={handleChange('name')}
                    placeholder={$('PROFILE_EDIT_PH_NAME', locale)}
                    style={inputStyle}
                  />
                </div>
              </label>
              
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-muted)' }}>
                {$('PROFILE_EDIT_LABEL_EMAIL', locale)}
                <div className="input-wrapper">
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={handleChange('email')}
                    placeholder={$('PROFILE_EDIT_PH_EMAIL', locale)}
                    style={inputStyle}
                  />
                </div>
              </label>

              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-muted)' }}>
                {$('PROFILE_EDIT_LABEL_PHONE', locale)}
                <div className="input-wrapper">
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={handleChange('phone')}
                    placeholder={$('PROFILE_EDIT_PH_PHONE', locale)}
                    style={inputStyle}
                  />
                </div>
              </label>

              {isPatient && patient && (
                <>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-muted)' }}>
                    {$('PROFILE_EDIT_LABEL_VILLAGE', locale)}
                    <div className="input-wrapper">
                      <input
                        type="text"
                        value={editForm.village}
                        onChange={handleChange('village')}
                        placeholder={$('PROFILE_EDIT_PH_VILLAGE', locale)}
                        style={inputStyle}
                      />
                    </div>
                  </label>

                  {!patient.lmp_date && (
                    <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-muted)' }}>
                      {$('PROFILE_EDIT_LABEL_WEEK', locale)}
                      <div className="input-wrapper">
                        <input
                          type="number"
                          value={editForm.gestational_week}
                          onChange={handleChange('gestational_week')}
                          placeholder={$('PROFILE_EDIT_PH_WEEK', locale)}
                          min="1"
                          max="45"
                          style={inputStyle}
                        />
                      </div>
                    </label>
                  )}
                </>
              )}
            </div>
          ) : (
            
            /* ── Profile Details Grid View ── */
            isPatient && patient ? (
              <div className="detail-cards-grid">
                
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
                    <span className={`badge ${riskLevelClass(patient.risk_level)}`} style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em' }}>
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
              <div className="detail-cards-grid">
                
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
              <div className="detail-cards-grid">
                
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
              <div className="detail-cards-grid">
                
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
        <div style={{ display: 'flex', gap: '16px', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          {isEditing ? (
            <>
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
            </>
          ) : (
            <>
              <button 
                type="button" 
                onClick={handleStartEdit}
                className="btn btn--secondary"
                style={{
                  flex: 1,
                  height: '48px',
                  borderRadius: '9999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontWeight: '600',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'color-mix(in oklab, var(--color-surface) 60%, transparent)',
                  color: 'var(--color-text)'
                }}
              >
                <Pencil className="h-4 w-4" />
                <span>{$('PROFILE_BTN_EDIT', locale)}</span>
              </button>
              
              <button 
                type="button" 
                onClick={handleLogout}
                className="btn btn--secondary"
                style={{
                  flex: 1,
                  height: '48px',
                  borderRadius: '9999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontWeight: '600',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'color-mix(in oklab, var(--color-surface) 60%, transparent)',
                  color: 'var(--color-destructive)'
                }}
              >
                <LogOut className="h-4 w-4" />
                <span>{$('PROFILE_BTN_LOGOUT', locale)}</span>
              </button>
            </>
          )}
        </div>

      </div>
    </MobileLayout>
  )
}
