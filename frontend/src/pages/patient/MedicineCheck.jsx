import { useState, useRef, useEffect } from 'react'
import MobileLayout from '../../components/layout/MobileLayout'
import * as api from '../../services/api'
import { patientNavItems } from '../../data/navItems'
import { medicines, categories, searchMedicines } from '../../data/medicineData'
import $ from '../../config/strings'
import { useApp } from '../../context/AppContext'

const SAFETY_STYLE = {
  SAFE:    { bg: '#dcfce7', color: '#15803d' },
  CAUTION: { bg: '#fef9c3', color: '#b45309' },
  AVOID:   { bg: '#fee2e2', color: '#dc2626' },
}

export default function MedicineCheck() {
  const { locale, connectivity } = useApp()
  const [week, setWeek] = useState(null)

  useEffect(() => {
    async function loadWeek() {
      try {
        const data = await api.getMyPatientProfile()
        if (data && data.patient) {
          setWeek(data.patient.gestational_week)
        }
      } catch (err) {
        console.error('Failed to load patient profile in medicine check:', err)
      }
    }
    loadWeek()
  }, [])

  const [activeTab, setActiveTab] = useState('search')
  const [query, setQuery] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const fileInputRef = useRef(null)

  const isOffline = connectivity === 'offline'

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleCheck = async (e) => {
    e.preventDefault()
    setError(null)
    setResult(null)

    if (activeTab === 'photo' && !imageFile) {
      setError($('MEDICINE_ERR_FAILED', locale))
      return
    }
    if (activeTab === 'search' && !query.trim()) return

    setLoading(true)
    try {
      let payload = { role: 'patient', language: locale }
      if (week) payload.pregnancyWeek = week

      if (activeTab === 'photo') {
        const base64 = imagePreview.split(',')[1]
        payload.imageBase64 = base64
      } else {
        payload.query = query.trim()
      }

      const data = await api.medicineCheck(payload)
      if (data.error) {
        if (data.error === 'offline' || data.offline) {
          setError($('MEDICINE_ERR_OFFLINE', locale))
        } else {
          setError($('MEDICINE_ERR_FAILED', locale))
        }
        if (activeTab === 'search' && query.trim()) {
          const local = searchMedicines(query.trim())
          if (local.length > 0) setResult({ _local: local[0] })
        }
      } else {
        setResult(data)
      }
    } catch {
      setError($('MEDICINE_ERR_FAILED', locale))
    } finally {
      setLoading(false)
    }
  }

  const browseList = selectedCategory
    ? medicines.filter((m) => m.category === selectedCategory)
    : medicines

  return (
    <MobileLayout
      title={$('PAGE_TITLE_MEDICINE_PATIENT', locale)}
      status={connectivity}
      navItems={patientNavItems(locale)}
    >
      <div className="animate-fade-in">

        {/* Week banner */}
        {week ? (
          <div className="card" style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', borderLeft: '4px solid #22c55e', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: '#15803d', fontWeight: 600 }}>
              {$('MEDICINE_WEEK_BANNER', locale)} {week}
            </span>
          </div>
        ) : (
          <div className="card" style={{ background: '#fef9c3', borderLeft: '4px solid #f59e0b', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#b45309' }}>
              Complete your profile to get week-specific advice.
            </span>
          </div>
        )}

        {isOffline ? (
          <div className="card" style={{ background: '#fef3c7', borderLeft: '4px solid #f59e0b', marginBottom: '1rem' }}>
            <p style={{ color: '#b45309', fontSize: '0.85rem', margin: 0 }}>
              {$('MEDICINE_ERR_OFFLINE', locale)}
            </p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              {['search', 'photo'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`btn ${activeTab === tab ? 'btn--primary' : 'btn--secondary'}`}
                  style={{ flex: 1, fontSize: '0.85rem' }}
                  onClick={() => { setActiveTab(tab); setResult(null); setError(null) }}
                >
                  {tab === 'search' ? $('MEDICINE_TAB_SEARCH', locale) : $('MEDICINE_TAB_PHOTO', locale)}
                </button>
              ))}
            </div>

            <form onSubmit={handleCheck}>
              {activeTab === 'search' ? (
                <div className="input-row">
                  <input
                    type="text"
                    className="input"
                    placeholder={$('MEDICINE_PH_SEARCH', locale)}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <button type="submit" className="btn btn--primary" disabled={loading || !query.trim()}>
                    {loading ? $('MEDICINE_LOADING', locale) : $('MEDICINE_BTN_CHECK', locale)}
                  </button>
                </div>
              ) : (
                <div className="card" style={{ textAlign: 'center' }}>
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="medicine preview"
                      style={{ maxHeight: '180px', borderRadius: '8px', marginBottom: '0.75rem', objectFit: 'contain' }}
                    />
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    style={{ display: 'none' }}
                    onChange={handlePhotoChange}
                  />
                  <button
                    type="button"
                    className="btn btn--secondary"
                    style={{ width: '100%', marginBottom: '0.5rem' }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {$('MEDICINE_BTN_PHOTO', locale)}
                  </button>
                  {imageFile && (
                    <button type="submit" className="btn btn--primary" style={{ width: '100%' }} disabled={loading}>
                      {loading ? $('MEDICINE_LOADING', locale) : $('MEDICINE_BTN_CHECK', locale)}
                    </button>
                  )}
                </div>
              )}
            </form>
          </>
        )}

        {/* Error */}
        {error && (
          <div className="card" style={{ background: '#fee2e2', borderLeft: '4px solid #dc2626', marginTop: '1rem' }}>
            <p style={{ color: '#dc2626', margin: 0, fontSize: '0.875rem' }}>{error}</p>
          </div>
        )}

        {/* AI Result */}
        {result && !result._local && (
          <div className="card animate-fade-in" style={{ marginTop: '1rem' }}>
            {result.identified && (
              <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                {$('MEDICINE_IDENTIFIED_AS', locale)} <strong>{result.identified}</strong>
              </p>
            )}
            {result.SAFETY && (() => {
              const s = SAFETY_STYLE[result.SAFETY] || SAFETY_STYLE.CAUTION
              const label = result.SAFETY === 'SAFE'
                ? $('MEDICINE_SAFE', locale)
                : result.SAFETY === 'AVOID'
                  ? $('MEDICINE_AVOID', locale)
                  : $('MEDICINE_CAUTION', locale)
              return (
                <div style={{ background: s.bg, color: s.color, borderRadius: '8px', padding: '0.6rem 1rem', marginBottom: '0.75rem', fontWeight: 700, fontSize: '1rem' }}>
                  {label}
                </div>
              )
            })()}
            {result.REASON && <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>{result.REASON}</p>}
            {result.WEEK_NOTE && result.WEEK_NOTE !== 'N/A' && (
              <p style={{ fontSize: '0.875rem', color: '#1d4ed8', background: '#eff6ff', borderRadius: '6px', padding: '0.5rem 0.75rem', marginBottom: '0.5rem' }}>
                {result.WEEK_NOTE}
              </p>
            )}
            {result.ALTERNATIVES && result.ALTERNATIVES !== 'None needed' && (
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>{$('MEDICINE_ALTERNATIVES', locale)}</strong> {result.ALTERNATIVES}
              </p>
            )}
          </div>
        )}

        {/* Local data result (offline fallback) */}
        {result?._local && (
          <LocalMedicineCard med={result._local} locale={locale} role="patient" />
        )}

        {/* Offline / browse section */}
        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#374151', marginBottom: '0.75rem' }}>
            {$('MEDICINE_OFFLINE_BROWSE', locale)}
          </h3>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <button
              type="button"
              className={`chip${!selectedCategory ? ' chip--active' : ''}`}
              onClick={() => setSelectedCategory(null)}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.key}
                type="button"
                className={`chip${selectedCategory === c.key ? ' chip--active' : ''}`}
                onClick={() => setSelectedCategory(c.key)}
              >
                {locale === 'bn' ? c.labelBn : c.key}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {browseList.map((med) => (
              <LocalMedicineCard key={med.id} med={med} locale={locale} role="patient" />
            ))}
          </div>
        </div>
      </div>
    </MobileLayout>
  )
}

function LocalMedicineCard({ med, locale, role }) {
  const [expanded, setExpanded] = useState(false)
  const s = SAFETY_STYLE[med.safetyLevel] || SAFETY_STYLE.CAUTION
  const safetyLabel = med.safetyLevel === 'SAFE' ? (locale === 'bn' ? 'নিরাপদ' : 'Safe')
    : med.safetyLevel === 'AVOID' ? (locale === 'bn' ? 'এড়িয়ে চলুন' : 'Avoid')
    : (locale === 'bn' ? 'সতর্কতা' : 'Caution')

  return (
    <div className="card" style={{ borderLeft: `4px solid ${s.color}`, cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <strong style={{ fontSize: '0.95rem' }}>
            {locale === 'bn' ? med.genericNameBn : med.genericName}
          </strong>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            {(locale === 'bn' ? med.brandNamesBn : med.brandNames).join(', ')}
          </div>
        </div>
        <span style={{ background: s.bg, color: s.color, borderRadius: '999px', padding: '2px 10px', fontSize: '0.75rem', fontWeight: 700 }}>
          {safetyLabel}
        </span>
      </div>
      {expanded && (
        <div style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
          <p style={{ color: '#374151', marginBottom: '0.4rem' }}>
            {locale === 'bn' ? med.safetyNoteBn : med.safetyNote}
          </p>
          <p style={{ color: '#4b5563' }}>
            {locale === 'bn' ? med.patientNoteBn : med.patientNote}
          </p>
          {med.contraindications && (
            <p style={{ color: '#dc2626', fontSize: '0.8rem' }}>
              {locale === 'bn' ? med.contraindicationsBn : med.contraindications}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
