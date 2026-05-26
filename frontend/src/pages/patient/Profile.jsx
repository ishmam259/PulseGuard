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
        <div className="card profile-card" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
          <div className="avatar large" style={{ margin: '0 auto 1rem auto', width: '80px', height: '80px', fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gradient-primary)', color: 'white', borderRadius: '50%' }}>
            {getInitials(currentUser?.name)}
          </div>
          <h2 className="text-gradient">{currentUser?.name || 'User Profile'}</h2>
          <p className="muted" style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>
            {currentUser?.role || 'Guest'} Role
          </p>
          {isPatient && patient && (
            <p className="muted" style={{ fontSize: '0.85rem' }}>Patient ID: PG-{patient.id.slice(0, 8).toUpperCase()}</p>
          )}
          {isWorker && (
            <p className="muted" style={{ fontSize: '0.85rem' }}>Health Worker ID: HW-{currentUser?.id.slice(0, 8).toUpperCase()}</p>
          )}
        </div>

        {/* Details based on Role */}
        <div className="card" style={{ marginTop: '1rem' }}>
          <h3>Profile Details</h3>
          {loading ? (
            <p className="muted text-center" style={{ padding: '1rem 0' }}>Loading profile details...</p>
          ) : isPatient && patient ? (
            <div className="summary-grid">
              <div className="kpi-card">
                <span className="muted">Pregnancy Week</span>
                <span className="kpi">{patient.gestational_week || 'N/A'}</span>
              </div>
              <div className="kpi-card">
                <span className="muted">Risk Level</span>
                <span className={`badge badge--${(patient.risk_level || 'low').toLowerCase()}`} style={{ marginTop: '0.5rem' }}>
                  {patient.risk_level || 'Low'}
                </span>
              </div>
              <div className="kpi-card">
                <span className="muted">Village</span>
                <span className="kpi">{patient.village || 'N/A'}</span>
              </div>
              <div className="kpi-card">
                <span className="muted">Email</span>
                <span className="kpi" style={{ fontSize: '0.85rem', wordBreak: 'break-all' }}>{currentUser?.email || 'N/A'}</span>
              </div>
            </div>
          ) : isWorker ? (
            <div className="summary-grid">
              <div className="kpi-card">
                <span className="muted">Assigned Patients</span>
                <span className="kpi">{patientCount}</span>
              </div>
              <div className="kpi-card">
                <span className="muted">Email</span>
                <span className="kpi" style={{ fontSize: '0.85rem', wordBreak: 'break-all' }}>{currentUser?.email || 'N/A'}</span>
              </div>
            </div>
          ) : (
            <div className="summary-grid">
              <div className="kpi-card">
                <span className="muted">System Role</span>
                <span className="kpi">Administrator</span>
              </div>
              <div className="kpi-card">
                <span className="muted">Email</span>
                <span className="kpi" style={{ fontSize: '0.85rem', wordBreak: 'break-all' }}>{currentUser?.email || 'N/A'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="button-row" style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn--secondary" style={{ flex: 1 }}>Edit Profile</button>
          <button className="btn btn--ghost" onClick={handleLogout} style={{ flex: 1 }}>Logout</button>
        </div>
      </div>
    </MobileLayout>
  )
}
