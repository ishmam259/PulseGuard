import { useState, useRef } from 'react'
import MobileLayout from '../../components/layout/MobileLayout'
import * as api from '../../services/api'
import { workerNavItems } from '../../data/navItems'
import $ from '../../config/strings'
import { useApp } from '../../context/AppContext'

export default function MedicineVerify() {
  const { locale, connectivity } = useApp()
  const [activeTab, setActiveTab] = useState('search')
  const [query, setQuery] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [identified, setIdentified] = useState(null)
  const [error, setError] = useState(null)
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

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setError(null)
    setResults(null)
    setIdentified(null)
    setLoading(true)
    try {
      const data = await api.medicineSearch(query.trim())
      if (data.error) {
        setError('Medex is unreachable right now. Try again.')
      } else {
        setResults(data.results || [])
        if ((data.results || []).length === 0) {
          setError(`No medicines found for "${query}". Try a different name.`)
        }
      }
    } catch {
      setError('Medex is unreachable right now. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoCheck = async (e) => {
    e.preventDefault()
    if (!imageFile) return
    setError(null)
    setResults(null)
    setIdentified(null)
    setLoading(true)
    try {
      const base64 = imagePreview.split(',')[1]
      const data = await api.medicineCheck({ imageBase64: base64, role: 'worker', language: locale })
      if (data.error) {
        setError('Could not identify the medicine. Please search by name.')
      } else {
        setIdentified(data.identified)
        setResults(data.results || [])
        if ((data.results || []).length === 0) {
          setError(`No medicines found for "${data.identified}". Try searching by name.`)
        }
      }
    } catch {
      setError('Service unavailable. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <MobileLayout
      title={$('PAGE_TITLE_MEDICINE_WORKER', locale)}
      status={connectivity}
      navItems={workerNavItems(locale)}
    >
      <div className="animate-fade-in">

        <div className="card" style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', borderLeft: '4px solid #3b82f6', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#1d4ed8' }}>
            Search the Medex clinical database (21,000+ medicines) for dosage and safety guidance.
          </span>
        </div>

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
                  onClick={() => { setActiveTab(tab); setResults(null); setError(null); setIdentified(null) }}
                >
                  {tab === 'search' ? $('MEDICINE_TAB_SEARCH', locale) : $('MEDICINE_TAB_PHOTO', locale)}
                </button>
              ))}
            </div>

            {activeTab === 'search' ? (
              <form onSubmit={handleSearch}>
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
              </form>
            ) : (
              <form onSubmit={handlePhotoCheck}>
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
              </form>
            )}
          </>
        )}

        {/* Error */}
        {error && (
          <div className="card" style={{ background: '#fee2e2', borderLeft: '4px solid #dc2626', marginTop: '1rem' }}>
            <p style={{ color: '#dc2626', margin: 0, fontSize: '0.875rem' }}>{error}</p>
          </div>
        )}

        {/* Identified banner (photo tab) */}
        {identified && (
          <div className="card animate-fade-in" style={{ background: '#eff6ff', borderLeft: '4px solid #3b82f6', marginTop: '1rem' }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#1d4ed8' }}>
              {$('MEDICINE_IDENTIFIED_AS', locale)} <strong>{identified}</strong>
            </p>
          </div>
        )}

        {/* Medex results */}
        {results && results.length > 0 && (
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {results.map((r, i) => (
              <MedexResultCard key={i} result={r} />
            ))}
          </div>
        )}

      </div>
    </MobileLayout>
  )
}

function MedexResultCard({ result }) {
  return (
    <div className="card" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
      {result.imageUrl && (
        <img
          src={result.imageUrl}
          alt={result.name}
          style={{ width: '64px', height: '64px', objectFit: 'contain', flexShrink: 0, borderRadius: '6px' }}
        />
      )}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <strong style={{ fontSize: '0.95rem' }}>{result.name}</strong>
        {result.description && (
          <p style={{ fontSize: '0.8rem', opacity: 0.65, margin: 0, lineHeight: 1.4 }}>
            {result.description.length > 120 ? result.description.slice(0, 120) + '…' : result.description}
          </p>
        )}
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn--primary"
          style={{ alignSelf: 'flex-end', fontSize: '0.8rem', padding: '0.3rem 0.75rem' }}
        >
          View on Medex →
        </a>
      </div>
    </div>
  )
}
