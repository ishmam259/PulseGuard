import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MobileLayout from '../../components/layout/MobileLayout'
import { useApp } from '../../context/AppContext'
import { useLocale } from '../../context/LocaleContext'
import * as api from '../../services/api'
import { patientNavItems, workerNavItems } from '../../data/navItems'

export default function Profile() {
  const { currentUser, setCurrentUser, logout, connectivity } = useApp()
  const { t, n } = useLocale()
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
          const patients = await api.getPatients()
          if (patients && patients.length > 0) {
            const details = await api.getPatient(patients[0].id)
            if (details) setPatient(details.patient)
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
    if (!editForm.name.trim()) {
      setError(t('PROFILE_ERROR_NAME_REQUIRED'))
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      // 1. Update user profile (name, email, phone)
      const userRes = await api.updateProfile({
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
      })

      if (!userRes.ok) {
        throw new Error(userRes.error || t('PROFILE_ERROR_UPDATE_USER'))
      }

      // 2. If patient, update patient details (village, gestational_week)
      if (isPatient && patient) {
        const patientRes = await api.updatePatient(patient.id, {
          village: editForm.village,
          gestational_week: editForm.gestational_week ? parseInt(editForm.gestational_week) : null,
        })

        if (!patientRes.ok) {
          throw new Error(patientRes.error || t('PROFILE_ERROR_UPDATE_PATIENT'))
        }

        // Update local patient state
        setPatient(patientRes.patient)
      }

      // 3. Update current user in context
      setCurrentUser(userRes.user)

      setSuccess(t('PROFILE_SUCCESS_UPDATED'))
      setIsEditing(false)
    } catch (err) {
      setError(err.message || t('PROFILE_ERROR_GENERIC'))
    } finally {
      setSaving(false)
    }
  }

  const isPatient = currentUser?.role === 'patient'
  const isWorker = currentUser?.role === 'worker'
  const isAdmin = currentUser?.role === 'admin'

  const navItems = isPatient ? patientNavItems : isWorker ? workerNavItems : []

  return (
    <MobileLayout
      title={t('PROFILE_PAGE_TITLE')}
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
          <h2 className="text-gradient" style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>{currentUser?.name || t('PROFILE_FALLBACK_NAME')}</h2>
          <p className="muted" style={{ textTransform: 'capitalize', fontWeight: '600', fontSize: '0.9rem' }}>
            {currentUser?.role || t('ROLE_GUEST')}
          </p>
          {isPatient && patient && (
            <p className="muted" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>{t('PROFILE_PATIENT_ID', { id: 'PG-' + patient.id.slice(0, 8).toUpperCase() })}</p>
          )}
          {isWorker && (
            <p className="muted" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>{t('PROFILE_WORKER_ID', { id: 'HW-' + currentUser?.id.slice(0, 8).toUpperCase() })}</p>
          )}
        </div>

        {/* Details or Edit Form based on state */}
        <div className="card" style={{ marginTop: '1.25rem', padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.25rem' }}>{isEditing ? t('PROFILE_EDIT_HEADING') : t('PROFILE_DETAILS_HEADING')}</h3>
          
          {loading ? (
            <p className="muted text-center" style={{ padding: '1rem 0' }}>{t('PROFILE_LOADING')}</p>
          ) : isEditing ? (
            /* ── Edit Profile Form ── */
            <div className="form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <label>
                {t('PROFILE_FULL_NAME_LABEL')} *
                <div className="input-wrapper">
                  <input
                    type="text"
                    className="input"
                    value={editForm.name}
                    onChange={handleChange('name')}
                    placeholder={t('PROFILE_NAME_PLACEHOLDER')}
                  />
                </div>
              </label>
              <label>
                {t('PROFILE_EMAIL_LABEL')}
                <div className="input-wrapper">
                  <input
                    type="email"
                    className="input"
                    value={editForm.email}
                    onChange={handleChange('email')}
                    placeholder={t('PROFILE_EMAIL_PLACEHOLDER')}
                  />
                </div>
              </label>
              <label>
                {t('PROFILE_PHONE_LABEL')}
                <div className="input-wrapper">
                  <input
                    type="text"
                    className="input"
                    value={editForm.phone}
                    onChange={handleChange('phone')}
                    placeholder={t('PROFILE_PHONE_PLACEHOLDER')}
                  />
                </div>
              </label>

              {isPatient && patient && (
                <>
                  <label>
                    {t('PROFILE_VILLAGE_LABEL')}
                    <div className="input-wrapper">
                      <input
                        type="text"
                        className="input"
                        value={editForm.village}
                        onChange={handleChange('village')}
                        placeholder={t('PROFILE_VILLAGE_PLACEHOLDER')}
                      />
                    </div>
                  </label>
                  <label>
                    {t('PROFILE_GESTATIONAL_WEEK_LABEL')}
                    <div className="input-wrapper">
                      <input
                        type="number"
                        className="input"
                        value={editForm.gestational_week}
                        onChange={handleChange('gestational_week')}
                        placeholder={t('PROFILE_GESTATIONAL_WEEK_PLACEHOLDER')}
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
                  <span className="profile-detail-label">{t('PROFILE_DETAIL_PREGNANCY_WEEK')}</span>
                  <span className="profile-detail-value--accent">{patient.gestational_week ? n(patient.gestational_week) : t('FALLBACK_NA')}</span>
                </div>
                <div className="profile-detail-card">
                  <span className="profile-detail-label">{t('PROFILE_DETAIL_RISK_LEVEL')}</span>
                  <span className={`badge badge--${(patient.risk_level || 'low').toLowerCase()}`} style={{ marginTop: '0.25rem', alignSelf: 'flex-start' }}>
                    {patient.risk_level || t('RISK_LOW')}
                  </span>
                </div>
                <div className="profile-detail-card">
                  <span className="profile-detail-label">{t('PROFILE_DETAIL_VILLAGE')}</span>
                  <span className="profile-detail-value">{patient.village || t('FALLBACK_NA')}</span>
                </div>
                <div className="profile-detail-card">
                  <span className="profile-detail-label">{t('PROFILE_DETAIL_PHONE')}</span>
                  <span className="profile-detail-value">{currentUser?.phone || t('FALLBACK_NA')}</span>
                </div>
                <div className="profile-detail-card" style={{ gridColumn: 'span 2' }}>
                  <span className="profile-detail-label">{t('PROFILE_DETAIL_EMAIL')}</span>
                  <span className="profile-detail-value--muted">{currentUser?.email || t('FALLBACK_NA')}</span>
                </div>
              </div>
            ) : isWorker ? (
              <div className="profile-details-grid" style={{ marginTop: '1rem' }}>
                <div className="profile-detail-card">
                  <span className="profile-detail-label">{t('PROFILE_DETAIL_ASSIGNED_PATIENTS')}</span>
                  <span className="profile-detail-value--accent">{n(patientCount)}</span>
                </div>
                <div className="profile-detail-card">
                  <span className="profile-detail-label">{t('PROFILE_DETAIL_PHONE')}</span>
                  <span className="profile-detail-value">{currentUser?.phone || t('FALLBACK_NA')}</span>
                </div>
                <div className="profile-detail-card" style={{ gridColumn: 'span 2' }}>
                  <span className="profile-detail-label">{t('PROFILE_DETAIL_EMAIL')}</span>
                  <span className="profile-detail-value--muted">{currentUser?.email || t('FALLBACK_NA')}</span>
                </div>
              </div>
            ) : isAdmin ? (
              <div className="profile-details-grid" style={{ marginTop: '1rem' }}>
                <div className="profile-detail-card">
                  <span className="profile-detail-label">{t('PROFILE_ADMIN_SYSTEM_ROLE')}</span>
                  <span className="profile-detail-value">{t('ROLE_ADMIN')}</span>
                </div>
                <div className="profile-detail-card">
                  <span className="profile-detail-label">{t('PROFILE_DETAIL_PHONE')}</span>
                  <span className="profile-detail-value">{currentUser?.phone || t('FALLBACK_NA')}</span>
                </div>
                <div className="profile-detail-card" style={{ gridColumn: 'span 2' }}>
                  <span className="profile-detail-label">{t('PROFILE_DETAIL_EMAIL')}</span>
                  <span className="profile-detail-value--muted">{currentUser?.email || t('FALLBACK_NA')}</span>
                </div>
              </div>
            ) : (
              <div className="profile-details-grid" style={{ marginTop: '1rem' }}>
                <div className="profile-detail-card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <span className="profile-detail-label">{t('PROFILE_STATUS_LABEL')}</span>
                  <span className="profile-detail-value">{t('PROFILE_STATUS_PENDING')}</span>
                  <button type="button"
                    className="btn btn--primary btn--sm" 
                    style={{ marginTop: '0.5rem', fontSize: '0.85rem', padding: '8px 16px' }}
                    onClick={() => navigate('/patient/onboarding')}
                  >
                    {t('PROFILE_COMPLETE_REGISTRATION')}
                  </button>
                </div>
                <div className="profile-detail-card">
                  <span className="profile-detail-label">{t('PROFILE_DETAIL_PHONE')}</span>
                  <span className="profile-detail-value">{currentUser?.phone || t('FALLBACK_NA')}</span>
                </div>
                <div className="profile-detail-card">
                  <span className="profile-detail-label">{t('PROFILE_DETAIL_EMAIL')}</span>
                  <span className="profile-detail-value--muted">{currentUser?.email || t('FALLBACK_NA')}</span>
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
                {saving ? t('PROFILE_SAVING') : t('PROFILE_SAVE_CHANGES')}
              </button>
              <button
                type="button"
                className="btn btn--secondary"
                style={{ flex: 1 }}
                onClick={() => setIsEditing(false)}
                disabled={saving}
              >
                {t('CANCEL')}
              </button>
            </>
          ) : (
            <>
              <button type="button" className="btn btn--secondary" style={{ flex: 1 }} onClick={handleStartEdit}>
                {t('PROFILE_EDIT_BTN')}
              </button>
              <button type="button" className="btn btn--ghost" style={{ flex: 1 }} onClick={handleLogout}>
                {t('LOGOUT')}
              </button>
            </>
          )}
        </div>
      </div>
    </MobileLayout>
  )
}
