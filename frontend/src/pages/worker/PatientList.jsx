import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import MobileLayout from '../../components/layout/MobileLayout'
import * as api from '../../services/api'
import { useLocale } from '../../context/LocaleContext'

export default function PatientList() {
  const { t, n } = useLocale()
  const [patients, setPatients] = useState(undefined)
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('All')
  const [search, setSearch] = useState('')

  const workerNavItems = [
    { label: t('NAV_HOME'), to: '/worker/dashboard', icon: '' },
    { label: t('NAV_PATIENTS'), to: '/worker/patients', icon: '' },
    { label: t('NAV_AI'), to: '/worker/ai-analysis', icon: '' },
    { label: t('NAV_SYNC'), to: '/worker/sync', icon: '' },
    { label: t('NAV_PROFILE'), to: '/worker/profile', icon: '' },
  ]

  const filterItems = [
    { key: 'All', label: t('FILTER_ALL') },
    { key: 'High Risk', label: t('HIGH_RISK') },
    { key: 'Moderate', label: t('MODERATE_RISK') },
    { key: 'Low Risk', label: t('LOW_RISK') },
  ]

  useEffect(() => {
    const load = async () => {
      const data = await api.getPatients()
      setPatients(data)
      setLoading(false)
    }
    load()
  }, [])

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

  return (
    <MobileLayout title={t('PATIENT_LIST_TITLE')} navItems={workerNavItems}>
      {/* ── Search ── */}
      <section className="animate-fade-in">
        <input
          className="input"
          placeholder={t('PATIENT_LIST_SEARCH_PLACEHOLDER')}
          aria-label={t('PATIENT_LIST_SEARCH_PLACEHOLDER')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </section>

      {/* ── Filter Chips ── */}
      <div className="chip-row animate-fade-in">
        {filterItems.map((f) => (
          <button
            type="button"
            key={f.key}
            className={`chip${activeFilter === f.key ? ' active' : ''}`}
            onClick={() => setActiveFilter(f.key)}
            style={{ font: 'inherit', color: 'inherit' }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Patient List ── */}
      <section className="card animate-fade-in">
        <div className="section-header">
          <h3>{t('PATIENT_LIST_HEADING')}</h3>
          <span className="muted">{n(filtered.length)} {t('PATIENT_LIST_RESULTS')}</span>
        </div>
        <div className="list stagger">
          {loading ? (
            <p className="muted" style={{ textAlign: 'center', padding: '2rem 0' }}>{t('PATIENT_LIST_LOADING')}</p>
          ) : filtered.map((patient) => (
            <div className="list-item" key={patient.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="avatar">{getInitials(patient.name)}</div>
                <div>
                  <strong>{patient.name}</strong>
                  <p className="muted">
                    {t('WEEK')} {patient.gestational_week ? n(patient.gestational_week) : '—'} • {patient.village || t('UNKNOWN')}
                  </p>
                </div>
              </div>
              <div className="inline-actions">
                <span className={`badge badge--${patient.risk_level || 'low'}`}>
                  {t('RISK_' + (patient.risk_level || 'low').toUpperCase())}
                </span>
                <Link className="btn btn--secondary" to={`/worker/patient/${patient.id}`}>
                  {t('VIEW')}
                </Link>
              </div>
            </div>
          ))}
          {!loading && filtered.length === 0 && (
            <p className="muted" style={{ textAlign: 'center', padding: '2rem 0' }}>
              {t('PATIENT_LIST_NO_MATCH')}
            </p>
          )}
        </div>
      </section>
    </MobileLayout>
  )
}
