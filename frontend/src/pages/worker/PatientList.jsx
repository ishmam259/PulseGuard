import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import MobileLayout from '../../components/layout/MobileLayout'
import { useApp } from '../../context/AppContext'
import { workerNavItems } from '../../data/navItems'
import * as api from '../../services/api'
import $ from '../../config/strings'
import { Search, Filter, MapPin, ArrowRight } from 'lucide-react'

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

  const getFilterCount = (filterValue) => {
    if (!patients) return 0
    if (filterValue === 'All') return patients.length
    if (filterValue === 'High Risk') return patients.filter(p => p.risk_level === 'high').length
    if (filterValue === 'Moderate') return patients.filter(p => p.risk_level === 'moderate').length
    if (filterValue === 'Low Risk') return patients.filter(p => p.risk_level === 'low').length
    return 0
  }

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
      {/* ── Search & Filter Unified Bar ── */}
      <div className="glass animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', borderRadius: '24px', gap: '16px', marginBottom: '32px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, position: 'relative' }}>
          <Search className="h-5 w-5 text-muted" style={{ position: 'absolute', left: '16px', color: 'var(--color-muted)' }} />
          <input
            className="input"
            placeholder={$('W_PATIENTS_SEARCH_PH', locale)}
            aria-label={$('W_PATIENTS_SEARCH_PH', locale)}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '44px', borderRadius: '9999px', border: '1px solid var(--color-border)', height: '44px', width: '100%', backgroundColor: 'var(--color-surface)' }}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Filter className="h-5 w-5" style={{ color: 'var(--color-muted)', marginRight: '4px' }} />
          <div style={{ display: 'flex', gap: '8px' }}>
            {filterLabels.map((f) => {
              const count = getFilterCount(f.value)
              const isActive = activeFilter === f.value
              
              let labelText = ''
              if (f.value === 'All') labelText = locale === 'en' ? `All ${count}` : `সব ${count}`
              else if (f.value === 'High Risk') labelText = locale === 'en' ? `High ${count}` : `উচ্চ ${count}`
              else if (f.value === 'Moderate') labelText = locale === 'en' ? `Moderate ${count}` : `মাঝারি ${count}`
              else if (f.value === 'Low Risk') labelText = locale === 'en' ? `Low ${count}` : `কম ${count}`

              return (
                <button
                  type="button"
                  key={f.value}
                  className={`chip${isActive ? ' active' : ''}`}
                  onClick={() => setActiveFilter(f.value)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: '600',
                    border: '1px solid var(--color-border)',
                    backgroundColor: isActive ? 'var(--color-primary-dim)' : 'var(--color-surface)',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-muted)',
                    borderColor: isActive ? 'var(--color-primary)' : 'var(--color-border)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {labelText}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Patient Cards Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }} className="stagger">
        {loading ? (
          <p className="muted" style={{ gridColumn: 'span 3', textAlign: 'center', padding: '4rem 0', animation: 'pulse 2s infinite' }}>
            {$('W_PATIENTS_LOADING', locale)}
          </p>
        ) : filtered.map((patient) => {
          const initials = getInitials(patient.name)
          const riskLevel = patient.risk_level || 'low'
          
          let riskColor = 'var(--color-success)'
          let riskBg = 'rgba(16, 185, 129, 0.08)'
          if (riskLevel === 'high') {
            riskColor = 'var(--color-danger)'
            riskBg = 'rgba(220, 38, 38, 0.08)'
          } else if (riskLevel === 'moderate') {
            riskColor = 'var(--color-warning)'
            riskBg = 'rgba(249, 115, 22, 0.08)'
          }

          const riskScorePercentage = ((patient.risk_score || 0) * 100).toFixed(0)

          return (
            <div
              key={patient.id}
              className="glass"
              style={{
                borderRadius: '24px',
                padding: '24px',
                borderLeft: `4px solid ${riskColor}`,
                borderTopLeftRadius: '4px',
                borderBottomLeftRadius: '4px',
                backgroundColor: 'var(--color-surface)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '220px',
                transition: 'all 0.2s',
                boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.01)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(219, 39, 119, 0.06)',
                      color: 'var(--color-primary)',
                      fontWeight: '700',
                      fontSize: '14px'
                    }}>
                      {initials}
                    </div>
                    <div>
                      <h4 className="font-display" style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--color-text)', margin: 0, lineHeight: 1.2 }}>
                        {patient.name}
                      </h4>
                      <p className="muted" style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '2px', margin: '2px 0 0' }}>
                        {$('W_PATIENTS_WEEK_PREFIX', locale)} {patient.gestational_week || '—'}
                      </p>
                    </div>
                  </div>
                  
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    fontSize: '11px',
                    fontWeight: '700',
                    backgroundColor: riskBg,
                    color: riskColor,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {getRiskLabel(patient.risk_level)}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '24px' }}>
                  <MapPin className="h-4 w-4" style={{ color: 'var(--color-muted)' }} />
                  <span>{patient.village || $('W_PATIENTS_UNKNOWN', locale)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--color-muted)', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    RISK SCORE
                  </span>
                  <p className="font-display" style={{ fontSize: '1.8rem', fontWeight: '700', color: riskColor, margin: 0, lineHeight: 1 }}>
                    {riskScorePercentage}%
                  </p>
                </div>

                <Link
                  className="btn btn--secondary hover-pink-btn"
                  to={`/worker/patient/${patient.id}`}
                  style={{
                    borderRadius: '9999px',
                    padding: '8px 20px',
                    fontSize: '13px',
                    fontWeight: '600',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s'
                  }}
                >
                  <span>Open</span>
                  <ArrowRight className="h-4 w-4" style={{ height: '14px', width: '14px' }} />
                </Link>
              </div>
            </div>
          )
        })}
      </div>
      {!loading && filtered.length === 0 && (
        <p className="muted" style={{ textAlign: 'center', padding: '4rem 0', gridColumn: 'span 3' }}>
          {$('W_PATIENTS_EMPTY', locale)}
        </p>
      )}
    </MobileLayout>
  )
}
