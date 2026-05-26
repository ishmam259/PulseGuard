import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import MobileLayout from '../../components/layout/MobileLayout'
import { useApp } from '../../context/AppContext'
import * as api from '../../services/api'
import { patientNavItems } from '../../data/navItems'

export default function Dashboard() {
  const { currentUser, connectivity } = useApp()
  const [patient, setPatient] = useState(null)
  const [latestVitals, setLatestVitals] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPatientData() {
      try {
        const patients = await api.getPatients()
        if (patients && patients.length > 0) {
          const mainPatient = patients[0]
          const details = await api.getPatient(mainPatient.id)
          if (details) {
            setPatient(details.patient)
            setLatestVitals(details.latestVitals)
          }
        }
      } catch (err) {
        console.error('Failed to load patient dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadPatientData()
  }, [])

  return (
    <MobileLayout
      title="Dashboard"
      status={connectivity}
      navItems={patientNavItems}
      banner={{
        tone: connectivity === 'online' ? 'online' : 'offline',
        message: connectivity === 'online' ? 'Connected — data synced' : 'Offline mode active'
      }}
    >
      <div className="animate-fade-in">
        {loading ? (
          <div className="card text-center" style={{ padding: '2rem' }}>
            <p className="muted animate-pulse">Loading health profile...</p>
          </div>
        ) : !patient ? (
          <div className="card greeting-card">
            <h2>Hello, {currentUser?.name || 'Mother'}</h2>
            <p className="muted" style={{ marginTop: '0.5rem' }}>
              Welcome to PulseGuard! Your digital pregnancy profile is being set up. Please consult your health worker to complete your registration.
            </p>
          </div>
        ) : (
          <div className="card greeting-card">
            <h2>Hello, {patient.name}</h2>
            <p className="muted">Pregnancy Week <strong>{patient.gestational_week || 'N/A'}</strong></p>
            <span className={`badge badge--${(patient.risk_level || 'low').toLowerCase()}`}>
              {(patient.risk_level || 'Low').charAt(0).toUpperCase() + (patient.risk_level || 'low').slice(1)} Risk
            </span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="section-header">
          <h3>Quick Actions</h3>
        </div>
        <div className="grid two">
          <Link to="/patient/daily-check" className="card action-card stagger" style={{ animationDelay: '0s' }}>
            <span className="role-icon"></span>
            <h4>Daily Health Check</h4>
            <p className="muted">Record today's vitals</p>
          </Link>
          <Link to="/patient/ai-chat" className="card action-card stagger" style={{ animationDelay: '0.1s' }}>
            
            <h4>AI Symptom Checker</h4>
            <p className="muted">Chat with PulseGuard AI</p>
          </Link>
          <Link to="/patient/nutrition" className="card action-card stagger" style={{ animationDelay: '0.2s' }}>
            
            <h4>Nutrition Plan</h4>
            <p className="muted">Personalized meal guide</p>
          </Link>
          <Link to="/patient/emergency" className="card action-card alert stagger" style={{ animationDelay: '0.3s' }}>
            
            <h4>Emergency SOS</h4>
            <p className="muted">One-tap emergency alert</p>
          </Link>
        </div>

        {/* Health Summary */}
        <div className="section-header">
          <h3>Health Summary</h3>
        </div>
        <div className="card">
          <div className="summary-grid">
            <div className="kpi-card">
              <span className="muted">Blood Pressure</span>
              <span className="kpi">
                {latestVitals ? `${latestVitals.bp_systolic}/${latestVitals.bp_diastolic}` : '--/--'}
              </span>
            </div>
            <div className="kpi-card">
              <span className="muted">Weight</span>
              <span className="kpi">{latestVitals?.weight_kg ? `${latestVitals.weight_kg} kg` : '--'}</span>
            </div>
            <div className="kpi-card">
              <span className="muted">Temperature</span>
              <span className="kpi">{latestVitals?.temperature_c ? `${latestVitals.temperature_c} °C` : '--'}</span>
            </div>
            <div className="kpi-card">
              <span className="muted">Last Checkup</span>
              <span className="kpi">
                {latestVitals ? new Date(latestVitals.recorded_at).toLocaleDateString() : 'No records yet'}
              </span>
            </div>
          </div>
          {patient && (
            <div style={{ marginTop: '1rem', textAlign: 'right' }}>
              <Link to="/patient/records" className="btn btn--ghost" style={{ fontSize: '0.85rem' }}>
                View All Records →
              </Link>
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  )
}
