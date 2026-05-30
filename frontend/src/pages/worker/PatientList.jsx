import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import MobileLayout from '../../components/layout/MobileLayout'
import { useApp } from '../../context/AppContext'
import { workerNavItems } from '../../data/navItems'
import * as api from '../../services/api'
import $ from '../../config/strings'

export default function PatientList() {
  const { locale } = useApp()
  const [patients, setPatients] = useState(undefined)
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

  // Filter labels map to internal English values for logic
  const filterLabels = [
    { label: $('W_PATIENTS_FILTER_ALL', locale), value: 'All' },
    { label: $('W_PATIENTS_FILTER_HIGH', locale), value: 'High Risk' },
    { label: $('W_PATIENTS_FILTER_MODERATE', locale), value: 'Moderate' },
    { label: $('W_PATIENTS_FILTER_LOW', locale), value: 'Low Risk' },
  ]

  const filtered = (patients || []).filter((p) => {
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

  const getRiskLabel = (riskLevel) => {
    const rl = riskLevel || 'low'
    if (rl === 'high') return $('W_PATIENTS_FILTER_HIGH', locale)
    if (rl === 'moderate') return $('W_PATIENTS_FILTER_MODERATE', locale)
    return $('W_PATIENTS_FILTER_LOW', locale)
  }

  return (
    <MobileLayout title={$('W_PAGE_TITLE_PATIENTS', locale)} navItems={workerNavItems(locale)}>
      {/* ── Search ── */}
      <section className="animate-fade-in">
        <input
          className="input"
          placeholder={$('W_PATIENTS_SEARCH_PH', locale)}
          aria-label={$('W_PATIENTS_SEARCH_PH', locale)}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </section>

      {/* ── Filter Chips ── */}
      <div className="chip-row animate-fade-in">
        {filterLabels.map((f) => (
          <button
            type="button"
            key={f.value}
            className={`chip${activeFilter === f.value ? ' active' : ''}`}
            onClick={() => setActiveFilter(f.value)}
            style={{ font: 'inherit', color: 'inherit' }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Patient List ── */}
      <section className="card animate-fade-in">
        <div className="section-header">
          <h3>{$('W_PATIENTS_HEADING', locale)}</h3>
          <span className="muted">{filtered.length} {$('W_PATIENTS_RESULTS_SUFFIX', locale)}</span>
        </div>
        <div className="list stagger">
          {loading ? (
            <p className="muted" style={{ textAlign: 'center', padding: '2rem 0' }}>{$('W_PATIENTS_LOADING', locale)}</p>
          ) : filtered.map((patient) => (
            <div className="list-item" key={patient.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="avatar">{getInitials(patient.name)}</div>
                <div>
                  <strong>{patient.name}</strong>
                  <p className="muted">
                    {$('W_PATIENTS_WEEK_PREFIX', locale)} {patient.gestational_week || '—'} • {patient.village || $('W_PATIENTS_UNKNOWN', locale)}
                  </p>
                </div>
              </div>
              <div className="inline-actions">
                <span className={`badge badge--${patient.risk_level || 'low'}`}>
                  {getRiskLabel(patient.risk_level)}
                </span>
                <Link className="btn btn--secondary" to={`/worker/patient/${patient.id}`}>
                  {$('W_PATIENTS_VIEW_BTN', locale)}
                </Link>
              </div>
            </div>
          ))}
          {!loading && filtered.length === 0 && (
            <p className="muted" style={{ textAlign: 'center', padding: '2rem 0' }}>
              {$('W_PATIENTS_EMPTY', locale)}
            </p>
          )}
        </div>
      </section>
    </MobileLayout>
  )
}
