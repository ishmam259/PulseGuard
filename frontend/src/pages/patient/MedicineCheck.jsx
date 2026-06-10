import { useState, useRef, useEffect } from 'react'
import MobileLayout from '../../components/layout/MobileLayout'
import * as api from '../../services/api'
import { patientNavItems } from '../../data/navItems'
import $ from '../../config/strings'
import { useApp } from '../../context/AppContext'
import { Search, Camera, ShieldCheck, ShieldAlert, ShieldX, Pill } from 'lucide-react'

export default function MedicineCheck() {
  const { locale, connectivity } = useApp()
  const [week, setWeek] = useState(null)
  const [activeTab, setActiveTab] = useState('search')
  const [query, setQuery] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [identified, setIdentified] = useState(null)
  const [safety, setSafety] = useState(null)
  const [safetyLoading, setSafetyLoading] = useState(false)
  const [error, setError] = useState(null)

  // My Medicines state
  const [schedules, setSchedules] = useState(null)
  const [todayDoses, setTodayDoses] = useState({})
  const [schedLoading, setSchedLoading] = useState(false)
  const [pendingSchedule, setPendingSchedule] = useState(null)
  const [dueAlert, setDueAlert] = useState(null)
  const [schedForm, setSchedForm] = useState({ notes: '', timesPerDay: 1, doseTimes: ['08:00'], durationDays: 7 })
  const [schedSubmitting, setSchedSubmitting] = useState(false)

  const fileInputRef = useRef(null)

  const isOffline = connectivity === 'offline'

  useEffect(() => {
    async function loadWeek() {
      try {
        const data = await api.getMyPatientProfile()
        if (data?.patient) setWeek(data.patient.gestational_week)
      } catch (err) {
        console.error('Failed to load patient profile:', err)
      }
    }
    loadWeek()
  }, [])

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleAddToMyMeds = (result) => {
    setResults(null); setError(null); setIdentified(null); setSafety(null); setSafetyLoading(false)
    setPendingSchedule({ name: result.name, description: result.description || null })
    setSchedForm({ notes: '', timesPerDay: 1, doseTimes: ['08:00'], durationDays: 7 })
    setActiveTab('mymeds')
    if (!schedules) loadMyMeds()
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setError(null); setResults(null); setIdentified(null); setSafety(null)
    setSafetyLoading(false)
    setLoading(true)
    try {
      const data = await api.medicineSearch(query.trim())
      if (data.error) {
        setError('Medex is unreachable right now. Try again.')
      } else {
        setResults(data.results || [])
        if ((data.results || []).length === 0) {
          setError(`No medicines found for "${query}". Try a different name.`)
        } else {
          setSafetyLoading(true)
          api.medicineSafety(query.trim(), week, locale)
            .then(s => {
              setSafety(s)
              if (s?.SAFETY) {
                saveCheckToHistory(query.trim(), s)
              }
            })
            .catch(() => {})
            .finally(() => setSafetyLoading(false))
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
    setError(null); setResults(null); setIdentified(null); setSafety(null)
    setSafetyLoading(false)
    setLoading(true)
    try {
      const base64 = imagePreview.split(',')[1]
      const data = await api.medicineCheck({ imageBase64: base64, role: 'patient', pregnancyWeek: week, language: locale })
      if (data.error) {
        setError('Could not identify the medicine. Please search by name.')
      } else {
        setIdentified(data.identified)
        setResults(data.results || [])
        setSafety(data.safety || null)
        if ((data.results || []).length === 0) {
          setError(`No medicines found for "${data.identified}". Try searching by name.`)
        } else if (data.safety?.SAFETY) {
          saveCheckToHistory(data.identified, data.safety)
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
      title={$('PAGE_TITLE_MEDICINE_PATIENT', locale)}
      status={connectivity}
      navItems={patientNavItems(locale)}
    >
      <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>

        {/* Hero banner */}
        <div style={{
          background: 'linear-gradient(135deg, #08030b 0%, #0f0516 40%, #2e0520 70%, #4c0730 88%, #6b0d46 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '28px',
          padding: '36px 32px',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          marginBottom: '24px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ flex: 1, zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                color: 'var(--color-primary-light)',
              }}>
                {locale === 'bn' ? 'ফার্মেসি · নির্দেশিকা' : 'PHARMACY · GUIDED'}
              </span>
            </div>
            
            <h1 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '36px',
              fontWeight: '800',
              color: '#ffffff',
              lineHeight: '1.1',
              margin: '0 0 16px 0',
              letterSpacing: '-0.5px'
            }}>
              {locale === 'bn' ? 'আজ গ্রহণ করা কি' : 'Is it safe'}{' '}
              <span style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                color: 'var(--color-primary-light)',
                background: 'var(--gradient-primary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'block',
                marginTop: '6px',
                fontWeight: '500'
              }}>
                {locale === 'bn' ? 'নিরাপদ হবে?' : 'to take today?'}
              </span>
            </h1>
            <p style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.65)',
              lineHeight: '1.5',
              margin: 0,
              fontWeight: '400',
              maxWidth: '440px'
            }}>
              {locale === 'bn'
                ? 'গর্ভাবস্থায় ওষুধের নিরাপত্তা সেকেন্ডের মধ্যে যাচাই করতে নাম লিখে খুঁজুন অথবা বক্সের ছবি স্ক্যান করুন।'
                : 'Search any medicine by name or scan the box to check pregnancy safety in seconds.'}
            </p>
          </div>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-primary-light)',
            flexShrink: 0,
            zIndex: 2,
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)'
          }}>
            <Pill size={30} />
          </div>
        </div>

        {isOffline ? (
          <div className="card" style={{ background: '#fef3c7', borderLeft: '4px solid #f59e0b', marginBottom: '24px', padding: '16px' }}>
            <p style={{ color: '#b45309', fontSize: '14px', margin: 0, fontWeight: '500' }}>
              {$('MEDICINE_ERR_OFFLINE', locale)}
            </p>
          </div>
        ) : (
          <div className="card" style={{
            padding: '24px',
            borderRadius: '28px',
            background: 'color-mix(in oklab, var(--color-surface) 95%, var(--color-primary-dim))',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '24px'
          }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              {['search', 'photo'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`btn ${activeTab === tab ? 'btn--primary' : 'btn--secondary'}`}
                  style={{ flex: 1, fontSize: '0.85rem' }}
                  onClick={() => { setActiveTab(tab); setResults(null); setError(null); setIdentified(null); setSafety(null); setSafetyLoading(false) }}
                >
                  {tab === 'search' ? $('MEDICINE_TAB_SEARCH', locale) : $('MEDICINE_TAB_PHOTO', locale)}
                </button>
              ))}
            </div>

            {/* Search tab */}
            {activeTab === 'search' && (
              <form onSubmit={handleSearch}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      type="text"
                      className="input"
                      placeholder={locale === 'bn' ? 'যেমন- Napa, Flagyl...' : 'e.g. Napa, Flagyl...'}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      style={{
                        paddingLeft: '20px',
                        paddingRight: '20px',
                        height: '52px',
                        borderRadius: '26px',
                        border: '1px solid var(--color-border)',
                        background: '#fff',
                        fontSize: '15px'
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn--primary"
                    disabled={loading || !query.trim()}
                    style={{
                      height: '52px',
                      padding: '0 24px',
                      borderRadius: '26px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: '600',
                      fontSize: '15px',
                      background: 'var(--gradient-primary)',
                      boxShadow: '0 4px 14px rgba(219, 39, 119, 0.3)'
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner" style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid #fff',
                          borderTopColor: 'transparent',
                          borderRadius: '50%',
                          display: 'inline-block',
                          animation: 'spin 1s linear infinite'
                        }}></span>
                        <span>{locale === 'bn' ? 'অপেক্ষা করুন...' : 'Checking...'}</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={18} />
                        <span>{locale === 'bn' ? 'নিরাপত্তা যাচাই' : 'Check Safety'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Photo tab */}
            {activeTab === 'photo' && (
              <form onSubmit={handlePhotoCheck}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                  <div style={{
                    width: '100%',
                    minHeight: '180px',
                    borderRadius: '20px',
                    border: '2px dashed var(--color-border)',
                    background: 'rgba(255, 255, 255, 0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    overflow: 'hidden'
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="medicine preview"
                        style={{
                          width: '100%',
                          maxHeight: '180px',
                          objectFit: 'contain',
                          borderRadius: '12px'
                        }}
                      />
                    ) : (
                      <div style={{ textAlign: 'center', color: 'var(--color-muted)' }}>
                        <Camera size={36} style={{ marginBottom: '8px', opacity: 0.6 }} />
                        <p style={{ fontSize: '14px', fontWeight: '500', margin: 0 }}>
                          {locale === 'bn' ? 'ছবি তুলতে বা বক্স আপলোড করতে ট্যাপ করুন' : 'Tap to take a photo or upload box'}
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    style={{ display: 'none' }}
                    onChange={handlePhotoChange}
                  />
                  {imageFile && (
                    <button
                      type="submit"
                      className="btn btn--primary"
                      disabled={loading}
                      style={{
                        width: '100%',
                        height: '52px',
                        borderRadius: '26px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontSize: '15px',
                        fontWeight: '600'
                      }}
                    >
                      {loading ? (
                        <>
                          <span className="spinner" style={{
                            width: '16px',
                            height: '16px',
                            border: '2px solid #fff',
                            borderTopColor: 'transparent',
                            borderRadius: '50%',
                            display: 'inline-block',
                            animation: 'spin 1s linear infinite'
                          }}></span>
                          <span>{locale === 'bn' ? 'বিশ্লেষণ করা হচ্ছে...' : 'Analyzing Image...'}</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={18} />
                          <span>{locale === 'bn' ? 'নিরাপত্তা যাচাই' : 'Check Safety'}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            )}
          </>
        )}

        {/* Error */}
        {error && (
          <div className="card" style={{ background: '#fee2e2', borderLeft: '4px solid #dc2626', marginTop: '1rem', padding: '16px' }}>
            <p style={{ color: '#dc2626', margin: 0, fontSize: '14px', fontWeight: '500' }}>{error}</p>
          </div>
        )}

        {/* Identified banner (photo tab) */}
        {identified && (
          <div className="card animate-fade-in" style={{ background: '#eff6ff', borderLeft: '4px solid #3b82f6', marginTop: '1rem', padding: '16px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#1d4ed8' }}>
              {$('MEDICINE_IDENTIFIED_AS', locale)} <strong>{identified}</strong>
            </p>
          </div>
        )}

        {/* Safety card */}
        <SafetyCard safety={safety} loading={safetyLoading} locale={locale} />

        {/* Medex results */}
        {results && results.length > 0 && (
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {results.map((r, i) => (
              <MedexResultCard
                key={i}
                result={r}
                onAddToMyMeds={() => handleAddToMyMeds(r)}
              />
            ))}
          </div>
        )}

        {/* Recent Checks Section */}
        <div style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '700', color: 'var(--color-text)', margin: 0 }}>
              {locale === 'bn' ? 'সাম্প্রতিক অনুসন্ধান' : 'Recent Checks'}
            </h3>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {locale === 'bn' ? 'গত ৭ দিন' : 'LAST 7 DAYS'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentChecks.map((item, index) => {
              const isSafe = item.safety === 'SAFE'
              const isAvoid = item.safety === 'AVOID'
              const isCaution = item.safety === 'CAUTION'
              
              const badgeStyle = isSafe 
                ? { bg: '#e8f8f5', border: '#a3e4d7', color: '#117a65', icon: ShieldCheck, label: locale === 'bn' ? 'নিরাপদ' : 'SAFE' }
                : isAvoid
                  ? { bg: '#fff1f2', border: '#fda4af', color: '#e11d48', icon: ShieldX, label: locale === 'bn' ? 'এড়িয়ে চলুন' : 'AVOID' }
                  : { bg: '#fef9e7', border: '#fcf3cf', color: '#b57914', icon: ShieldAlert, label: locale === 'bn' ? 'সতর্কতা' : 'CAUTION' }

              const BadgeIcon = badgeStyle.icon

              return (
                <div
                  key={index}
                  onClick={() => {
                    setActiveTab('search')
                    setQuery(item.name)
                    setSafety(item.details)
                    setResults(null)
                    setError(null)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderRadius: '20px',
                    background: 'color-mix(in oklab, var(--color-surface) 80%, transparent)',
                    border: '1px solid var(--color-border)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.borderColor = 'var(--color-primary-dim)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-card)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none'
                    e.currentTarget.style.borderColor = 'var(--color-border)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: 'rgba(219, 39, 119, 0.08)',
                      border: '1px solid rgba(219, 39, 119, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-primary)'
                    }}>
                      <Pill size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-text)', margin: 0 }}>
                        {item.name}
                      </h4>
                      <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                        {getRelativeTimeString(item.timestamp)}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '999px',
                    background: badgeStyle.bg,
                    border: `1px solid ${badgeStyle.border}`,
                    color: badgeStyle.color,
                    fontSize: '12px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}>
                    <BadgeIcon size={14} />
                    <span>{badgeStyle.label}</span>
                  </div>
                </div>
              )
            })}
            {recentChecks.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--color-muted)', fontSize: '14px' }}>
                {locale === 'bn' ? 'কোনো সাম্প্রতিক অনুসন্ধান নেই।' : 'No recent safety checks.'}
              </div>
            )}
          </div>
        </div>

      </div>
    </MobileLayout>
  )
}

function SafetyCard({ safety, loading, locale }) {
  if (loading) {
    return (
      <div className="card animate-fade-in" style={{
        marginTop: '20px',
        borderLeft: '4px solid var(--color-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '20px',
        background: 'color-mix(in oklab, var(--color-surface) 90%, transparent)',
        borderRadius: '20px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div className="spinner" style={{
          width: '20px',
          height: '20px',
          border: '2px solid var(--color-primary)',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text-secondary)' }}>
          {locale === 'bn' ? 'গর্ভাবস্থায় ওষুধের নিরাপত্তা পরীক্ষা করা হচ্ছে…' : 'Checking pregnancy safety…'}
        </span>
      </div>
    )
  }
  if (!safety?.SAFETY) return null

  const map = {
    SAFE:    { border: '#10b981', bg: '#ecfdf5', iconBg: '#d1fae5', color: '#065f46', label: locale === 'bn' ? 'নিরাপদ' : 'SAFE' },
    CAUTION: { border: '#f59e0b', bg: '#fffbeb', iconBg: '#fef3c7', color: '#92400e', label: locale === 'bn' ? 'সতর্কতা' : 'CAUTION' },
    AVOID:   { border: '#e11d48', bg: '#fff1f2', iconBg: '#ffe4e6', color: '#be185d', label: locale === 'bn' ? 'এড়িয়ে চলুন' : 'AVOID' },
  }
  const s = map[safety.SAFETY] || map['CAUTION']

  return (
    <div className="card animate-fade-in" style={{
      marginTop: '20px',
      borderLeft: `5px solid ${s.border}`,
      padding: '24px',
      background: s.bg,
      borderRadius: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Badge row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '2rem',
          height: '2rem',
          borderRadius: '50%',
          background: s.iconBg,
          fontSize: '1rem',
          flexShrink: 0,
        }}>{s.icon}</span>
        <span style={{
          fontWeight: 700,
          fontSize: '0.95rem',
          color: s.color,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}>{s.label}</span>
      </div>

      {/* Reason */}
      {safety.REASON && (
        <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--color-text)' }}>
          {safety.REASON}
        </p>
      )}

      {/* Week-specific note */}
      {safety.WEEK_NOTE && safety.WEEK_NOTE !== 'N/A' && (
        <p style={{
          margin: 0,
          fontSize: '0.8rem',
          lineHeight: 1.5,
          color: 'var(--color-muted)',
          paddingLeft: '0.75rem',
          borderLeft: '2px solid var(--color-border)',
        }}>
          {safety.WEEK_NOTE}
        </div>
      )}

      {/* Alternatives (only for AVOID) */}
      {safety.ALTERNATIVES && safety.ALTERNATIVES !== 'None needed' && (
        <div style={{
          marginTop: '6px',
          fontSize: '13px',
          color: 'var(--color-muted)',
          background: 'rgba(255,255,255,0.4)',
          padding: '8px 12px',
          borderRadius: '8px'
        }}>
          <strong style={{ color: 'var(--color-text)' }}>
            {locale === 'bn' ? 'বিকল্প: ' : 'Alternatives: '}
          </strong>
          {safety.ALTERNATIVES}
        </div>
      )}
    </div>
  )
}

function MedexResultCard({ result, onAddToMyMeds }) {
  return (
    <div className="card" style={{
      display: 'flex',
      gap: '16px',
      alignItems: 'flex-start',
      padding: '20px',
      borderRadius: '20px',
      background: 'color-mix(in oklab, var(--color-surface) 95%, transparent)',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {result.imageUrl && (
        <img
          src={result.imageUrl}
          alt={result.name}
          style={{ width: '64px', height: '64px', objectFit: 'contain', flexShrink: 0, borderRadius: '12px', background: '#fff', border: '1px solid var(--color-border)', padding: '4px' }}
        />
      )}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
          <strong style={{ fontSize: '16px', fontWeight: '750', color: 'var(--color-text)' }}>{result.name}</strong>
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--secondary"
            style={{ fontSize: '12px', padding: '6px 14px', height: 'auto', borderRadius: '12px' }}
          >
            Medex →
          </a>
        </div>
        {result.description && (
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: '1.45' }}>
            {result.description.length > 150 ? result.description.slice(0, 150) + '…' : result.description}
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
