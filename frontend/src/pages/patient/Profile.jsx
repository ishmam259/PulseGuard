import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MobileLayout from '../../components/layout/MobileLayout'
import { useApp } from '../../context/AppContext'
import * as api from '../../services/api'
import { patientNavItems, workerNavItems } from '../../data/navItems'

export default function Profile() {
  const { currentUser, logout, connectivity } = useApp()
  const navigate = useNavigate()
  const [patient, setPatient] = useState(null)
  const [patientCount, setPatientCount] = useState(0)
  const [loading, setLoading] = useState(true)

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

  const isPatient = currentUser?.role === 'patient'
  const isWorker = currentUser?.role === 'worker'
  const isAdmin = currentUser?.role === 'admin'

  const navItems = isPatient ? patientNavItems : isWorker ? workerNavItems : []

  return (
    <MobileLayout
      title="Profile"
      status={connectivity}
      navItems={navItems}
    >
      <div className="animate-fade-in">
        {/* Profile Card */}
        <div className="card profile-card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
          <div className="avatar large" style={{ margin: '0 auto 1.25rem auto', width: '88px', height: '88px', fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gradient-primary)', color: 'white', borderRadius: '50%', boxShadow: '0 0 24px rgba(36, 174, 124, 0.3)' }}>
            {getInitials(currentUser?.name)}
          </div>
          <h2 className="text-gradient" style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>{currentUser?.name || 'User Profile'}</h2>
          <p className="muted" style={{ textTransform: 'capitalize', fontWeight: '600', fontSize: '0.9rem' }}>
            {currentUser?.role || 'Guest'}
          </p>
          {isPatient && patient && (
            <p className="muted" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Patient ID: PG-{patient.id.slice(0, 8).toUpperCase()}</p>
          )}
          {isWorker && (
            <p className="muted" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Health Worker ID: HW-{currentUser?.id.slice(0, 8).toUpperCase()}</p>
          )}
        </div>

        {/* Details based on Role */}
        <div className="card" style={{ marginTop: '1.25rem', padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.25rem' }}>Profile Details</h3>
          {loading ? (
            <p className="muted text-center" style={{ padding: '1rem 0' }}>Loading profile details...</p>
          ) : isPatient && patient ? (
            <div className="profile-details-grid">
              <div className="profile-detail-card">
                <span className="profile-detail-label">Pregnancy Week</span>
                <span className="profile-detail-value--accent">{patient.gestational_week || 'N/A'}</span>
              </div>
              <div className="profile-detail-card">
                <span className="profile-detail-label">Risk Level</span>
                <span className={`badge badge--${(patient.risk_level || 'low').toLowerCase()}`} style={{ marginTop: '0.25rem', alignSelf: 'flex-start' }}>
                  {patient.risk_level || 'Low'}
                </span>
              </div>
              <div className="profile-detail-card">
                <span className="profile-detail-label">Village</span>
                <span className="profile-detail-value">{patient.village || 'N/A'}</span>
              </div>
              <div className="profile-detail-card">
                <span className="profile-detail-label">Email</span>
                <span className="profile-detail-value--muted">{currentUser?.email || 'N/A'}</span>
              </div>
            </div>
          ) : isWorker ? (
            <div className="profile-details-grid">
              <div className="profile-detail-card">
                <span className="profile-detail-label">Assigned Patients</span>
                <span className="profile-detail-value--accent">{patientCount}</span>
              </div>
              <div className="profile-detail-card">
                <span className="profile-detail-label">Email</span>
                <span className="profile-detail-value--muted">{currentUser?.email || 'N/A'}</span>
              </div>
            </div>
          ) : (
            <div className="profile-details-grid">
              <div className="profile-detail-card">
                <span className="profile-detail-label">System Role</span>
                <span className="profile-detail-value">Administrator</span>
              </div>
              <div className="profile-detail-card">
                <span className="profile-detail-label">Email</span>
                <span className="profile-detail-value--muted">{currentUser?.email || 'N/A'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="profile-actions">
          <button className="btn btn--secondary">Edit Profile</button>
          <button className="btn btn--ghost" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </MobileLayout>
  )
}
