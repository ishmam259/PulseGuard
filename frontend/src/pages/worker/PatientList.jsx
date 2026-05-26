import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import MobileLayout from '../../components/layout/MobileLayout'
import * as api from '../../services/api'

const workerNavItems = [
  { label: 'Home', to: '/worker/dashboard', icon: '' },
  { label: 'Patients', to: '/worker/patients', icon: '' },
  { label: 'AI', to: '/worker/ai-analysis', icon: '' },
  { label: 'Sync', to: '/worker/sync', icon: '' },
  { label: 'Profile', to: '/worker/profile', icon: '' },
]

const filters = ['All', 'High Risk', 'Moderate', 'Low Risk']

export default function PatientList() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      const data = await api.getPatients()
      setPatients(data)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = patients.filter((p) => {
    const matchesSearch =
      (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.village || '').toLowerCase().includes(search.toLowerCase())

    if (activeFilter === 'All') return matchesSearch
    if (activeFilter === 'High Risk') return matchesSearch && p.risk_level === 'high'
    if (activeFilter === 'Moderate') return matchesSearch && p.risk_level === 'moderate'
    if (activeFilter === 'Low Risk') return matchesSearch && p.risk_level === 'low'
    return matchesSearch
  })

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '??'

  return (
    <MobileLayout title="Patient List" navItems={workerNavItems}>
      {/* ── Search ── */}
      <section className="animate-fade-in">
        <input
          className="input"
          placeholder="Search patient by name or village..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </section>

      {/* ── Filter Chips ── */}
      <div className="chip-row animate-fade-in">
        {filters.map((f) => (
          <span
            key={f}
            className={`chip${activeFilter === f ? ' active' : ''}`}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </span>
        ))}
      </div>

      {/* ── Patient List ── */}
      <section className="card animate-fade-in">
        <div className="section-header">
          <h3>Patients</h3>
          <span className="muted">{filtered.length} results</span>
        </div>
        <div className="list stagger">
          {loading ? (
            <p className="muted" style={{ textAlign: 'center', padding: '2rem 0' }}>Loading patients...</p>
          ) : filtered.map((patient) => (
            <div className="list-item" key={patient.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="avatar">{getInitials(patient.name)}</div>
                <div>
                  <strong>{patient.name}</strong>
                  <p className="muted">
                    Week {patient.gestational_week || '—'} • {patient.village || 'Unknown'}
                  </p>
                </div>
              </div>
              <div className="inline-actions">
                <span className={`badge badge--${patient.risk_level || 'low'}`}>
                  {(patient.risk_level || 'low').charAt(0).toUpperCase() + (patient.risk_level || 'low').slice(1)}
                </span>
                <Link className="btn btn--secondary" to={`/worker/patient/${patient.id}`}>
                  View
                </Link>
              </div>
            </div>
          ))}
          {!loading && filtered.length === 0 && (
            <p className="muted" style={{ textAlign: 'center', padding: '2rem 0' }}>
              No patients match your search.
            </p>
          )}
        </div>
      </section>
    </MobileLayout>
  )
}
