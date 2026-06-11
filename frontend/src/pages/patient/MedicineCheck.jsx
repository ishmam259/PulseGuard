import { useState, useRef, useEffect } from 'react'
import MobileLayout from '../../components/layout/MobileLayout'
import * as api from '../../services/api'
import { patientNavItems } from '../../data/navItems'
import $ from '../../config/strings'
import { useApp } from '../../context/AppContext'

const DEFAULT_TIMES = ['08:00', '13:00', '18:00', '22:00']

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

  // Check for due doses every 60 seconds while on My Medicines tab
  useEffect(() => {
    if (activeTab !== 'mymeds' || !schedules) return
    const toMin = (hhmm) => {
      const [h, m] = hhmm.split(':').map(Number)
      return h * 60 + m
    }
    const check = () => {
      const now = new Date()
      const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      const nowMin = toMin(hhmm)
      for (const sched of schedules) {
        for (const t of (sched.dose_times || [])) {
          const diff = Math.abs(toMin(t) - nowMin)
          if (diff <= 10 && !(todayDoses[sched.id] || []).includes(t)) {
            setDueAlert({ name: sched.medicine_name, time: t })
            return
          }
        }
      }
    }
    check()
    const id = setInterval(check, 60_000)
    return () => clearInterval(id)
  }, [activeTab, schedules, todayDoses])

  const loadMyMeds = () => {
    setSchedLoading(true)
    Promise.all([api.getSchedules(), api.getTodayDoses()])
      .then(([s, d]) => {
        setSchedules(s.schedules || [])
        setTodayDoses(d.doses || {})
      })
      .catch(() => setSchedules([]))
      .finally(() => setSchedLoading(false))
  }

  const handleTabSwitch = (tab) => {
    setActiveTab(tab)
    setResults(null); setError(null); setIdentified(null); setSafety(null)
    setSafetyLoading(false)
    if (tab === 'mymeds' && !schedules) loadMyMeds()
  }

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
            .then(s => setSafety(s))
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
        }
      }
    } catch {
      setError('Service unavailable. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddSchedule = async (e) => {
    e.preventDefault()
    if (!pendingSchedule) return
    setSchedSubmitting(true)
    try {
      const durationDays = Math.max(1, parseInt(schedForm.durationDays) || 7)
      const timesPerDay = Math.min(4, Math.max(1, parseInt(schedForm.timesPerDay) || 1))
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + durationDays)
      const result = await api.addSchedule({
        medicine_name: pendingSchedule.name,
        description: pendingSchedule.description || null,
        notes: schedForm.notes || null,
        times_per_day: timesPerDay,
        dose_times: schedForm.doseTimes.slice(0, timesPerDay),
        end_date: endDate.toISOString().split('T')[0],
      })
      if (result.ok) {
        setPendingSchedule(null)
        setSchedForm({ notes: '', timesPerDay: 1, doseTimes: ['08:00'], durationDays: 7 })
        const [s, d] = await Promise.all([api.getSchedules(), api.getTodayDoses()])
        setSchedules(s.schedules || [])
        setTodayDoses(d.doses || {})
      }
    } catch (err) {
      console.error('Failed to add schedule', err)
    }
    setSchedSubmitting(false)
  }

  const handleDoseTaken = async (scheduleId, scheduledTime) => {
    try {
      const today = new Date().toISOString().split('T')[0]
      await api.logDose({ schedule_id: scheduleId, scheduled_time: scheduledTime, dose_date: today })
      setTodayDoses(prev => ({
        ...prev,
        [scheduleId]: [...(prev[scheduleId] || []), scheduledTime],
      }))
    } catch (err) {
      console.error('Failed to log dose', err)
    }
  }

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      await api.deleteSchedule(scheduleId)
      setSchedules(prev => prev.filter(s => s.id !== scheduleId))
    } catch (err) {
      console.error('Failed to delete schedule', err)
    }
  }

  const t = (en, bn) => (locale === 'en' ? en : bn)

  return (
    <MobileLayout
      title={$('PAGE_TITLE_MEDICINE_PATIENT', locale)}
      status={connectivity}
      navItems={patientNavItems(locale)}
    >
      <div className="animate-fade-in">

        {/* Week banner */}
        {week && (
          <div className="card" style={{ borderLeft: '4px solid #22c55e', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: '#22c55e', fontWeight: 600 }}>
              {$('MEDICINE_WEEK_BANNER', locale)} {week}
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
              {['search', 'photo', 'mymeds'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`btn ${activeTab === tab ? 'btn--primary' : 'btn--secondary'}`}
                  style={{ flex: 1, fontSize: '0.85rem' }}
                  onClick={() => handleTabSwitch(tab)}
                >
                  {tab === 'search'
                    ? $('MEDICINE_TAB_SEARCH', locale)
                    : tab === 'photo'
                    ? $('MEDICINE_TAB_PHOTO', locale)
                    : t('My Medicines', 'আমার ওষুধ')}
                </button>
              ))}
            </div>

            {/* Search tab */}
            {activeTab === 'search' && (
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
            )}

            {/* Photo tab */}
            {activeTab === 'photo' && (
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

            {/* My Medicines tab */}
            {activeTab === 'mymeds' && (
              <div>
                {/* Due-now alert */}
                {dueAlert && (
                  <div className="card animate-fade-in" style={{
                    background: '#eff6ff',
                    borderLeft: '4px solid #3b82f6',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                  }}>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#1d4ed8' }}>
                      ⏰ {t('Time to take', 'ওষুধ খাওয়ার সময়')}{' '}
                      <strong>{dueAlert.name}</strong> ({dueAlert.time})
                    </p>
                    <button
                      onClick={() => setDueAlert(null)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1d4ed8', fontSize: '1.2rem', lineHeight: 1, padding: '0 2px', flexShrink: 0 }}
                    >×</button>
                  </div>
                )}

                {/* Scheduling form (triggered from result cards) */}
                {pendingSchedule && (
                  <div className="card animate-fade-in" style={{ marginBottom: '1rem', borderTop: '3px solid var(--color-primary)', padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <strong style={{ fontSize: '0.95rem' }}>{t('Schedule', 'সময়সূচি')}: {pendingSchedule.name}</strong>
                      <button
                        type="button"
                        onClick={() => setPendingSchedule(null)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', fontSize: '1.2rem', lineHeight: 1 }}
                      >×</button>
                    </div>
                    {pendingSchedule.description && (
                      <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)', margin: '0 0 0.75rem', lineHeight: 1.4 }}>
                        {pendingSchedule.description.length > 160
                          ? pendingSchedule.description.slice(0, 160) + '…'
                          : pendingSchedule.description}
                      </p>
                    )}
                    <form onSubmit={handleAddSchedule}>
                      <div style={{ marginBottom: '0.6rem' }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-muted)', display: 'block', marginBottom: '0.25rem' }}>
                          {t('Notes', 'নোট')}
                        </label>
                        <input
                          className="input"
                          type="text"
                          value={schedForm.notes}
                          onChange={e => setSchedForm(p => ({ ...p, notes: e.target.value }))}
                          placeholder={t('e.g. after meal', 'যেমন খাবার পরে')}
                          style={{ fontSize: '0.85rem' }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.75rem' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-muted)', display: 'block', marginBottom: '0.25rem' }}>
                            {t('Times/day', 'দিনে কতবার')}
                          </label>
                          <input
                            className="input"
                            type="number"
                            min={1}
                            max={4}
                            value={schedForm.timesPerDay}
                            onChange={e => {
                              const raw = e.target.value
                              const parsed = parseInt(raw)
                              if (!raw || isNaN(parsed)) {
                                setSchedForm(p => ({ ...p, timesPerDay: raw }))
                                return
                              }
                              const n = Math.min(4, Math.max(1, parsed))
                              const times = Array.from({ length: n }, (_, i) => schedForm.doseTimes[i] || DEFAULT_TIMES[i])
                              setSchedForm(p => ({ ...p, timesPerDay: n, doseTimes: times }))
                            }}
                            style={{ fontSize: '0.85rem' }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-muted)', display: 'block', marginBottom: '0.25rem' }}>
                            {t('Duration (days)', 'কতদিন')}
                          </label>
                          <input
                            className="input"
                            type="number"
                            min={1}
                            max={365}
                            value={schedForm.durationDays}
                            onChange={e => setSchedForm(p => ({ ...p, durationDays: e.target.value }))}
                            style={{ fontSize: '0.85rem' }}
                          />
                        </div>
                      </div>
                      <div style={{ marginBottom: '0.75rem' }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-muted)', display: 'block', marginBottom: '0.35rem' }}>
                          {t('Dose times', 'ডোজের সময়')}
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {schedForm.doseTimes.map((t_val, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>{i + 1}:</span>
                              <input
                                type="time"
                                value={t_val}
                                onChange={e => {
                                  const times = [...schedForm.doseTimes]
                                  times[i] = e.target.value
                                  setSchedForm(p => ({ ...p, doseTimes: times }))
                                }}
                                style={{
                                  padding: '0.25rem 0.4rem',
                                  borderRadius: '6px',
                                  border: '1px solid var(--color-border)',
                                  background: 'var(--color-input, var(--color-surface))',
                                  color: 'var(--color-text)',
                                  fontSize: '0.85rem',
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="btn btn--primary"
                        style={{ width: '100%' }}
                        disabled={schedSubmitting}
                      >
                        {schedSubmitting
                          ? t('Adding…', 'যোগ করা হচ্ছে…')
                          : t('Add to My Medicines', 'আমার ওষুধে যোগ করুন')}
                      </button>
                    </form>
                  </div>
                )}

                {/* Schedule list */}
                {schedLoading ? (
                  <p className="muted text-center" style={{ padding: '1.5rem 0' }}>{$('MEDICINE_LOADING', locale)}</p>
                ) : !schedules || (schedules.length === 0 && !pendingSchedule) ? (
                  <div className="card" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                      {t(
                        'Search for a medicine above, then tap + My Medicines to schedule it here.',
                        'উপরে ওষুধ খুঁজুন, তারপর "+ আমার ওষুধ" ট্যাপ করুন।'
                      )}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {schedules.map(sched => (
                      <ScheduleCard
                        key={sched.id}
                        sched={sched}
                        todayDoses={todayDoses}
                        onDoseTaken={handleDoseTaken}
                        onDelete={() => handleDeleteSchedule(sched.id)}
                        locale={locale}
                      />
                    ))}
                  </div>
                )}
              </div>
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

        {/* Safety card */}
        <SafetyCard safety={safety} loading={safetyLoading} locale={locale} />

        {/* Medex results */}
        {results && results.length > 0 && (
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {results.map((r, i) => (
              <MedexResultCard
                key={i}
                result={r}
                onAddToMyMeds={() => handleAddToMyMeds(r)}
              />
            ))}
          </div>
        )}

      </div>
    </MobileLayout>
  )
}

function SafetyCard({ safety, loading, locale }) {
  if (loading) {
    return (
      <div className="card animate-fade-in" style={{
        marginTop: '1rem',
        borderLeft: '4px solid var(--color-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '1rem 1.25rem',
      }}>
        <span style={{ fontSize: '1.2rem', opacity: 0.5 }}>⏳</span>
        <span style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>
          {locale === 'bn' ? 'নিরাপত্তা পরীক্ষা করা হচ্ছে…' : 'Checking pregnancy safety…'}
        </span>
      </div>
    )
  }
  if (!safety?.SAFETY) return null

  const map = {
    SAFE:    { border: '#16a34a', iconBg: '#dcfce7', icon: '✅', color: '#15803d', label: locale === 'bn' ? 'নিরাপদ'         : 'SAFE'    },
    CAUTION: { border: '#d97706', iconBg: '#fef3c7', icon: '⚠️', color: '#92400e', label: locale === 'bn' ? 'সতর্কতার সাথে' : 'CAUTION' },
    AVOID:   { border: '#dc2626', iconBg: '#fee2e2', icon: '🚫', color: '#991b1b', label: locale === 'bn' ? 'এড়িয়ে চলুন'    : 'AVOID'   },
  }
  const s = map[safety.SAFETY] || map['CAUTION']

  return (
    <div className="card animate-fade-in" style={{
      marginTop: '1rem',
      borderLeft: `4px solid ${s.border}`,
      padding: '1rem 1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.6rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '2rem', height: '2rem', borderRadius: '50%',
          background: s.iconBg, fontSize: '1rem', flexShrink: 0,
        }}>{s.icon}</span>
        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: s.color, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          {s.label}
        </span>
      </div>
      {safety.REASON && (
        <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--color-text)' }}>{safety.REASON}</p>
      )}
      {safety.WEEK_NOTE && safety.WEEK_NOTE !== 'N/A' && (
        <p style={{ margin: 0, fontSize: '0.8rem', lineHeight: 1.5, color: 'var(--color-muted)', paddingLeft: '0.75rem', borderLeft: '2px solid var(--color-border)' }}>
          {safety.WEEK_NOTE}
        </p>
      )}
      {safety.ALTERNATIVES && safety.ALTERNATIVES !== 'None needed' && (
        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-muted)' }}>
          <strong style={{ color: 'var(--color-text)' }}>
            {locale === 'bn' ? 'বিকল্প: ' : 'Alternatives: '}
          </strong>
          {safety.ALTERNATIVES}
        </p>
      )}
    </div>
  )
}

function MedexResultCard({ result, onAddToMyMeds }) {
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
        <div style={{ display: 'flex', gap: '0.5rem', alignSelf: 'flex-end', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button
            className="btn btn--secondary"
            style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem' }}
            onClick={onAddToMyMeds}
          >
            + My Medicines
          </button>
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--primary"
            style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem' }}
          >
            View on Medex →
          </a>
        </div>
      </div>
    </div>
  )
}

function ScheduleCard({ sched, todayDoses, onDoseTaken, onDelete, locale }) {
  const takenToday = todayDoses[sched.id] || []
  const totalToday = (sched.dose_times || []).length
  const endDate = new Date(sched.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

  return (
    <div className="card" style={{ borderTop: '3px solid var(--color-primary)', padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '0.75rem 1rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <span style={{ flex: 1, fontWeight: 700, fontSize: '0.95rem' }}>{sched.medicine_name}</span>
          {sched.dosage && (
            <span style={{
              fontSize: '0.7rem',
              background: 'rgba(var(--color-primary-rgb, 219,39,119), 0.1)',
              color: 'var(--color-primary)',
              padding: '1px 7px',
              borderRadius: '4px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}>{sched.dosage}</span>
          )}
          <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
            {locale === 'bn' ? 'পর্যন্ত ' : 'until '}{endDate}
          </span>
          <button
            onClick={onDelete}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', fontSize: '1.1rem', lineHeight: 1, padding: '0 2px', flexShrink: 0 }}
            title="Remove"
          >×</button>
        </div>

        {/* Description */}
        {sched.description && (
          <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)', margin: '0 0 0.4rem', lineHeight: 1.4 }}>
            {sched.description.length > 120 ? sched.description.slice(0, 120) + '…' : sched.description}
          </p>
        )}

        {/* Notes */}
        {sched.notes && (
          <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)', margin: '0 0 0.5rem', fontStyle: 'italic' }}>
            {sched.notes}
          </p>
        )}

        {/* Dose slots */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
          {(sched.dose_times || []).map((t, i) => {
            const taken = takenToday.includes(t)
            return taken ? (
              <span key={i} style={{
                fontSize: '0.78rem', padding: '3px 10px', borderRadius: '20px',
                background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', fontWeight: 600,
              }}>✓ {t}</span>
            ) : (
              <button
                key={i}
                onClick={() => onDoseTaken(sched.id, t)}
                style={{
                  fontSize: '0.78rem', padding: '3px 10px', borderRadius: '20px',
                  background: 'var(--color-surface)', color: 'var(--color-text)',
                  border: '1px solid var(--color-border)', cursor: 'pointer', fontWeight: 500,
                }}
              >{t}</button>
            )
          })}
          <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)', marginLeft: 'auto' }}>
            {takenToday.length}/{totalToday} {locale === 'bn' ? 'আজ' : 'today'}
          </span>
        </div>
      </div>
    </div>
  )
}
