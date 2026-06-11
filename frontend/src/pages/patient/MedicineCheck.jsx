import { useState, useRef, useEffect } from 'react'
import MobileLayout from '../../components/layout/MobileLayout'
import * as api from '../../services/api'
import { patientNavItems } from '../../data/navItems'
import $ from '../../config/strings'
import { useApp } from '../../context/AppContext'
import './MedicineCheck.css'
import { Search, Camera, Bookmark, Pill, Bell, Clock, Calendar, Trash2, ShieldCheck, ShieldAlert, Check } from 'lucide-react'

const DEFAULT_TIMES = ['08:00', '13:00', '18:00', '22:00']

// Helper Functions
const getRelativeTime = (timestamp, locale) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) {
    return locale === 'bn' ? 'এইমাত্র' : 'Just now'
  }
  if (diffMins < 60) {
    return locale === 'bn' ? `${diffMins} মিনিট আগে` : `${diffMins}m ago`
  }
  if (diffHours < 24) {
    return locale === 'bn' ? `${diffHours} ঘণ্টা আগে` : `${diffHours}h ago`
  }
  if (diffDays === 1) {
    return locale === 'bn' ? 'গতকাল' : 'Yesterday'
  }
  if (diffDays < 7) {
    return locale === 'bn' ? `${diffDays} দিন আগে` : `${diffDays}d ago`
  }
  return date.toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-US', {
    day: 'numeric',
    month: 'short',
  })
}

const getRelativeStartDate = (startDateStr, locale) => {
  if (!startDateStr) return ''
  const start = new Date(startDateStr)
  const today = new Date()
  const diffTime = today - start
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  if (diffDays <= 0) {
    return locale === 'bn' ? 'আজ শুরু হয়েছে' : 'Started today'
  }
  if (diffDays < 7) {
    return locale === 'bn' ? `${diffDays} দিন আগে শুরু হয়েছে` : `Started ${diffDays} days ago`
  }
  const diffWeeks = Math.floor(diffDays / 7)
  if (diffWeeks === 1) {
    return locale === 'bn' ? '১ সপ্তাহ আগে শুরু হয়েছে' : 'Started 1 week ago'
  }
  return locale === 'bn' ? `${diffWeeks} সপ্তাহ আগে শুরু হয়েছে` : `Started ${diffWeeks} weeks ago`
}

const getDurationDays = (start, end) => {
  if (!start || !end) return 0
  const sDate = new Date(start)
  const eDate = new Date(end)
  const diffTime = Math.abs(eDate - sDate)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

const getSafetyLabel = (status, locale) => {
  if (status === 'SAFE') return locale === 'bn' ? 'নিরাপদ' : 'SAFE'
  if (status === 'CAUTION') return locale === 'bn' ? 'সতর্কতা' : 'CAUTION'
  if (status === 'AVOID') return locale === 'bn' ? 'এড়িয়ে চলুন' : 'AVOID'
  return status
}

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

  // Form structured dose + type states
  const [formDose, setFormDose] = useState('1000 mg')
  const [formSelected, setFormSelected] = useState('Tablet')

  // History logs states
  const [logs, setLogs] = useState([])
  const [logsLoading, setLogsLoading] = useState(false)

  const fileInputRef = useRef(null)
  const isOffline = connectivity === 'offline'

  const forms = [
    { id: 'Tablet', en: 'Tablet', bn: 'ট্যাবলেট' },
    { id: 'Capsule', en: 'Capsule', bn: 'ক্যাপসুল' },
    { id: 'Syrup', en: 'Syrup', bn: 'সিরাপ' },
    { id: 'Injection', en: 'Injection', bn: 'ইনজেকশন' },
    { id: 'Drops', en: 'Drops', bn: 'ড্রপস' },
  ]

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
    loadLogs()
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

  const loadLogs = () => {
    setLogsLoading(true)
    api.getMedicineLogs()
      .then(data => {
        setLogs(data.logs || [])
      })
      .catch(err => {
        console.error('Failed to load medicine logs:', err)
      })
      .finally(() => {
        setLogsLoading(false)
      })
  }

  const handleTabSwitch = (tab) => {
    setActiveTab(tab)
    setResults(null); setError(null); setIdentified(null); setSafety(null)
    setSafetyLoading(false)
    if (tab === 'mymeds') {
      loadMyMeds()
      loadLogs()
    }
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
    setFormDose('1000 mg')
    setFormSelected('Tablet')
    setActiveTab('mymeds')
    loadMyMeds()
    loadLogs()
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
          const safetyResult = await api.medicineSafety(query.trim(), week, locale)
          setSafety(safetyResult)
          if (safetyResult && safetyResult.SAFETY) {
            await api.logMedicine({
              medicine_name: query.trim(),
              safety_status: safetyResult.SAFETY,
              safety_reason: safetyResult.REASON,
              gestational_week: week,
              source: 'search',
              description: data.results[0]?.description || null,
              week_note: safetyResult.WEEK_NOTE,
              alternatives: safetyResult.ALTERNATIVES
            })
            loadLogs()
          }
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
        } else if (data.safety && data.safety.SAFETY) {
          await api.logMedicine({
            medicine_name: data.identified,
            safety_status: data.safety.SAFETY,
            safety_reason: data.safety.REASON,
            gestational_week: week,
            source: 'photo',
            description: data.results[0]?.description || null,
            week_note: data.safety.WEEK_NOTE,
            alternatives: data.safety.ALTERNATIVES
          })
          loadLogs()
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

      const finalDosage = `${formDose} • ${formSelected}`

      const result = await api.addSchedule({
        medicine_name: pendingSchedule.name,
        description: pendingSchedule.description || null,
        notes: schedForm.notes || null,
        times_per_day: timesPerDay,
        dose_times: schedForm.doseTimes.slice(0, timesPerDay),
        dosage: finalDosage,
        end_date: endDate.toISOString().split('T')[0],
      })
      if (result.ok) {
        setPendingSchedule(null)
        setSchedForm({ notes: '', timesPerDay: 1, doseTimes: ['08:00'], durationDays: 7 })
        setFormDose('1000 mg')
        setFormSelected('Tablet')
        const [s, d] = await Promise.all([api.getSchedules(), api.getTodayDoses()])
        setSchedules(s.schedules || [])
        setTodayDoses(d.doses || {})
      }
    } catch (err) {
      console.error('Failed to add schedule', err)
    }
    setSchedSubmitting(false)
  }

  const handleTimesPerDayChange = (val) => {
    const n = Math.min(4, Math.max(1, val))
    const times = Array.from({ length: n }, (_, i) => schedForm.doseTimes[i] || DEFAULT_TIMES[i])
    setSchedForm(p => ({ ...p, timesPerDay: n, doseTimes: times }))
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

  // Calc stats
  const activeCount = schedules ? schedules.length : 0
  const dosesPerDay = schedules ? schedules.reduce((sum, s) => sum + (s.dose_times?.length || 0), 0) : 0
  const longestDays = schedules && schedules.length > 0
    ? Math.max(...schedules.map(s => getDurationDays(s.start_date, s.end_date)))
    : 0

  return (
    <MobileLayout
      title={$('PAGE_TITLE_MEDICINE_PATIENT', locale)}
      status={connectivity}
      navItems={patientNavItems(locale)}
    >
      <div className="animate-fade-in med-page-container">

        {/* Hero Card */}
        <div className="med-hero-card">
          <div className="med-hero-content">
            <span className="med-hero-tag">{t('PHARMACY • GUIDED', 'ফার্মেসী • গাইডেড')}</span>
            <h1 className="med-hero-title">
              {t('Is it safe', 'এটি কি')} <br />
              <span className="text-highlight">{t('to take today?', 'নেওয়া নিরাপদ?')}</span>
            </h1>
            <p className="med-hero-desc">
              {t(
                'Search any medicine by name or scan the box to check pregnancy safety in seconds.',
                'সেকেন্ডের মধ্যে গর্ভাবস্থার নিরাপত্তা পরীক্ষা করতে নাম দিয়ে ওষুধ খুঁজুন বা বক্সটি স্ক্যান করুন।'
              )}
            </p>
          </div>
          <div className="med-hero-icon-container">
            <div className="med-hero-icon-bg">
              <Pill className="med-hero-icon" size={36} />
            </div>
          </div>
        </div>


        {isOffline ? (
          <div className="card" style={{ background: '#fef3c7', borderLeft: '4px solid #f59e0b', padding: '12px 20px', borderRadius: '16px' }}>
            <p style={{ color: '#b45309', fontSize: '0.85rem', margin: 0 }}>
              {$('MEDICINE_ERR_OFFLINE', locale)}
            </p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="med-tabs">
              {['search', 'photo', 'mymeds'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`med-tab-btn ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => handleTabSwitch(tab)}
                >
                  {tab === 'search' && <Search size={14} />}
                  {tab === 'photo' && <Camera size={14} />}
                  {tab === 'mymeds' && <Bookmark size={14} />}
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
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div className="input-wrapper" style={{ flex: 1 }}>
                    <Search className="input-icon" size={20} />
                    <input
                      type="text"
                      className="input"
                      placeholder={$('MEDICINE_PH_SEARCH', locale)}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn--primary" style={{ height: '48px', borderRadius: '9999px', padding: '0 24px' }} disabled={loading || !query.trim()}>
                    {loading ? $('MEDICINE_LOADING', locale) : $('MEDICINE_BTN_CHECK', locale)}
                  </button>
                </div>
              </form>
            )}

            {/* Photo tab */}
            {activeTab === 'photo' && (
              <form onSubmit={handlePhotoCheck}>
                <div className="med-schedule-card" style={{ textAlign: 'center', gap: '1rem', padding: '2rem 1.5rem' }}>
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="medicine preview"
                      style={{ maxHeight: '180px', borderRadius: '16px', margin: '0 auto 0.5rem', objectFit: 'contain', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}
                    />
                  ) : (
                    <div style={{ padding: '1rem', opacity: 0.5 }}>
                      <Camera size={48} style={{ margin: '0 auto', color: 'var(--color-muted)' }} />
                    </div>
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
                    style={{ width: '100%', borderRadius: '9999px' }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera size={16} />
                    {$('MEDICINE_BTN_PHOTO', locale)}
                  </button>
                  {imageFile && (
                    <button type="submit" className="btn btn--primary" style={{ width: '100%', borderRadius: '9999px', color: '#FFFFFF' }} disabled={loading}>
                      {loading ? $('MEDICINE_LOADING', locale) : $('MEDICINE_BTN_CHECK', locale)}
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* My Medicines tab */}
            {activeTab === 'mymeds' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Stats Cards */}
                <div className="med-stats-grid">
                  <div className="med-stat-card">
                    <div className="med-stat-header">
                      <span className="med-stat-label">{t('ACTIVE', 'সক্রিয়')}</span>
                      <div className="med-stat-icon-wrapper">
                        <Pill size={14} />
                      </div>
                    </div>
                    <span className="med-stat-val">{activeCount}</span>
                  </div>
                  <div className="med-stat-card">
                    <div className="med-stat-header">
                      <span className="med-stat-label">{t('DOSES / DAY', 'প্রতিদিন ডোজ')}</span>
                      <div className="med-stat-icon-wrapper">
                        <Bell size={14} />
                      </div>
                    </div>
                    <span className="med-stat-val">{dosesPerDay}</span>
                  </div>
                  <div className="med-stat-card">
                    <div className="med-stat-header">
                      <span className="med-stat-label">{t('LONGEST (DAYS)', 'সর্বোচ্চ দিন')}</span>
                      <div className="med-stat-icon-wrapper">
                        <Calendar size={14} />
                      </div>
                    </div>
                    <span className="med-stat-val">{longestDays}</span>
                  </div>
                </div>

                {/* Due-now alert */}
                {dueAlert && (
                  <div className="card animate-fade-in" style={{
                    background: '#eff6ff',
                    borderLeft: '4px solid #3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: '16px'
                  }}>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#1d4ed8' }}>
                      ⏰ {t('Time to take', 'ওষুধ খাওয়ার সময়')}{' '}
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
                  <div className="med-form-card animate-fade-in">
                    <div className="med-form-header-banner">
                      <span className="med-form-tag">{t('NEW SCHEDULE', 'নতুন সময়সূচি')}</span>
                      <strong className="med-form-title">{t('Add a medicine to your routine', 'আপনার রুটিনে একটি ওষুধ যোগ করুন')}</strong>
                    </div>

                    <form onSubmit={handleAddSchedule} className="med-form-grid">
                      {/* Name */}
                      <div className="med-form-field">
                        <span className="med-field-label">{t('MEDICINE NAME', 'ওষুধের নাম')}</span>
                        <input
                          type="text"
                          className="med-input-styled"
                          style={{ opacity: 0.8, cursor: 'not-allowed' }}
                          value={pendingSchedule.name}
                          readOnly
                          disabled
                        />
                      </div>

                      {/* Dose */}
                      <div className="med-form-field">
                        <span className="med-field-label">{t('DOSE', 'ডোজ')}</span>
                        <input
                          type="text"
                          className="med-input-styled"
                          value={formDose}
                          onChange={e => setFormDose(e.target.value)}
                          placeholder="e.g. 500 mg"
                        />
                      </div>

                      {/* Form */}
                      <div className="med-form-field full-width">
                        <span className="med-field-label">{t('FORM', 'ধরণ')}</span>
                        <div className="form-tabs">
                          {forms.map(form => (
                            <button
                              key={form.id}
                              type="button"
                              className={`form-tab-btn ${formSelected === form.id ? 'active' : ''}`}
                              onClick={() => setFormSelected(form.id)}
                            >
                              {t(form.en, form.bn)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="med-form-field full-width">
                        <span className="med-field-label">{t('NOTES', 'নোট')}</span>
                        <input
                          className="med-input-styled"
                          type="text"
                          value={schedForm.notes}
                          onChange={e => setSchedForm(p => ({ ...p, notes: e.target.value }))}
                          placeholder={t('e.g. after meal', 'যেমন খাবার পরে')}
                        />
                      </div>

                      {/* Times/day */}
                      <div className="med-form-field">
                        <span className="med-field-label">{t('TIMES / DAY', 'দিনে কতবার')}</span>
                        <div className="counter-control">
                          <button
                            type="button"
                            className="counter-btn"
                            onClick={() => handleTimesPerDayChange(schedForm.timesPerDay - 1)}
                            disabled={schedForm.timesPerDay <= 1}
                          >-</button>
                          <span className="counter-val">{schedForm.timesPerDay}</span>
                          <button
                            type="button"
                            className="counter-btn"
                            onClick={() => handleTimesPerDayChange(schedForm.timesPerDay + 1)}
                            disabled={schedForm.timesPerDay >= 4}
                          >+</button>
                        </div>
                      </div>

                      {/* Duration */}
                      <div className="med-form-field">
                        <span className="med-field-label">{t('DURATION (DAYS)', 'কতদিন (দিন)')}</span>
                        <input
                          className="med-input-styled"
                          type="number"
                          min={1}
                          max={365}
                          value={schedForm.durationDays}
                          onChange={e => setSchedForm(p => ({ ...p, durationDays: e.target.value }))}
                        />
                      </div>

                      {/* Dose times */}
                      <div className="med-form-field full-width">
                        <span className="med-field-label">{t('DOSE TIMES', 'ডোজের সময়')}</span>
                        <div className="time-pickers-container">
                          {schedForm.doseTimes.map((t_val, i) => (
                            <div key={i} className="time-picker-item">
                              <Clock className="time-picker-icon" size={14} />
                              <span className="time-picker-label">{i + 1}:</span>
                              <input
                                type="time"
                                className="time-picker-input"
                                value={t_val}
                                onChange={e => {
                                  const times = [...schedForm.doseTimes]
                                  times[i] = e.target.value
                                  setSchedForm(p => ({ ...p, doseTimes: times }))
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="med-form-field full-width" style={{ marginTop: '0.5rem' }}>
                        <button
                          type="submit"
                          className="btn btn--primary"
                          style={{ width: '100%', borderRadius: '9999px', color: '#FFFFFF' }}
                          disabled={schedSubmitting}
                        >
                          {schedSubmitting
                            ? t('Adding…', 'যোগ করা হচ্ছে…')
                            : t('+ Add to My Medicines', '+ আমার ওষুধে যোগ করুন')}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Schedule list */}
                {schedLoading ? (
                  <p className="muted text-center" style={{ padding: '2rem 0' }}>{$('MEDICINE_LOADING', locale)}</p>
                ) : (
                  <div className="med-schedules-section">
                    <div className="med-schedules-header">
                      <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700 }}>{t('My Medicines', 'আমার ওষুধ')}</h3>
                      <span className="muted text-sm" style={{ fontWeight: 600 }}>
                        {activeCount} {t('ACTIVE', 'সক্রিয়')}
                      </span>
                    </div>

                    {!schedules || (schedules.length === 0 && !pendingSchedule) ? (
                      <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1rem', borderRadius: '20px' }}>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-muted)' }}>
                          {t(
                            'Search for a medicine above, then tap + My Medicines to schedule it here.',
                            'উপরে ওষুধ খুঁজুন, তারপর "+ আমার ওষুধ" ট্যাপ করুন।'
                          )}
                        </p>
                      </div>
                    ) : (
                      <div className="med-schedules-grid">
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

                {/* Recent Checks Section */}
                <div className="med-recent-section">
                  <div className="med-recent-header">
                    <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700 }}>{t('Recent Checks', 'সাম্প্রতিক পরীক্ষা')}</h3>
                    <span className="muted text-sm" style={{ fontWeight: 600 }}>{t('LAST 7 DAYS', 'গত ৭ দিন')}</span>
                  </div>

                  <div className="med-recent-card">
                    {logsLoading ? (
                      <p className="muted text-center" style={{ padding: '1rem 0' }}>{t('Loading history…', 'ইতিহাস লোড করা হচ্ছে…')}</p>
                    ) : !logs || logs.length === 0 ? (
                      <p className="muted text-center" style={{ padding: '1rem 0', margin: 0 }}>
                        {t('No recent medicine safety checks.', 'কোন সাম্প্রতিক ওষুধের নিরাপত্তা পরীক্ষা নেই।')}
                      </p>
                    ) : (
                      <div className="med-recent-list">
                        {logs.slice(0, 5).map((logItem) => {
                          const status = logItem.safety_status || 'CAUTION'
                          let statusClass = 'med-safety-badge--caution'
                          if (status === 'SAFE') statusClass = 'med-safety-badge--safe'
                          if (status === 'AVOID') statusClass = 'med-safety-badge--avoid'

                          return (
                            <div key={logItem.id} className="med-recent-row">
                              <div className="med-recent-info">
                                <div className="med-recent-icon-wrapper">
                                  <Pill size={16} />
                                </div>
                                <div className="med-recent-meta">
                                  <span className="med-recent-name">{logItem.medicine_name}</span>
                                  <span className="med-recent-time">
                                    {getRelativeTime(logItem.logged_at, locale)}
                                  </span>
                                </div>
                              </div>
                              <span className={`med-safety-badge ${statusClass}`}>
                                {getSafetyLabel(status, locale)}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}
          </>
        )}

        {/* Error */}
        {error && (
          <div className="card" style={{ background: '#fee2e2', borderLeft: '4px solid #dc2626', padding: '12px 20px', borderRadius: '16px' }}>
            <p style={{ color: '#dc2626', margin: 0, fontSize: '0.875rem' }}>{error}</p>
          </div>
        )}

        {/* Identified banner (photo tab) */}
        {identified && (
          <div className="card animate-fade-in" style={{ background: '#eff6ff', borderLeft: '4px solid #3b82f6', padding: '12px 20px', borderRadius: '16px' }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#1d4ed8' }}>
              {$('MEDICINE_IDENTIFIED_AS', locale)} <strong>{identified}</strong>
            </p>
          </div>
        )}

        {/* Safety card */}
        <SafetyCard safety={safety} loading={safetyLoading} locale={locale} />

        {/* Medex results */}
        {results && results.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {results.map((r, i) => (
              <MedexResultCard
                key={i}
                result={r}
                onAddToMyMeds={() => handleAddToMyMeds(r)}
                locale={locale}
              />
            ))}
          </div>
        )}

      </div>
    </MobileLayout>
  )
}

function SafetyCard({ safety, loading, locale }) {
  const t = (en, bn) => (locale === 'en' ? en : bn)

  if (loading) {
    return (
      <div className="med-schedule-card" style={{
        marginTop: '1rem',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '1rem',
        padding: '1.25rem 1.5rem',
      }}>
        <Clock className="animate-pulse" size={24} style={{ color: 'var(--color-primary)' }} />
        <span style={{ fontSize: '14px', color: 'var(--color-muted)', fontWeight: 600 }}>
          {locale === 'bn' ? 'নিরাপত্তা পরীক্ষা করা হচ্ছে…' : 'Checking pregnancy safety…'}
        </span>
      </div>
    )
  }
  if (!safety?.SAFETY) return null

  const status = safety.SAFETY
  let badgeClass = 'med-safety-badge--caution'
  let cardStyle = { borderLeft: '4px solid var(--color-warning)' }

  if (status === 'SAFE') {
    badgeClass = 'med-safety-badge--safe'
    cardStyle = { borderLeft: '4px solid var(--color-success)', boxShadow: '0 8px 30px -10px color-mix(in oklab, var(--color-success) 20%, transparent)' }
  } else if (status === 'AVOID') {
    badgeClass = 'med-safety-badge--avoid'
    cardStyle = { borderLeft: '4px solid var(--color-danger)', boxShadow: '0 8px 30px -10px color-mix(in oklab, var(--color-danger) 20%, transparent)' }
  } else {
    cardStyle = { borderLeft: '4px solid var(--color-warning)', boxShadow: '0 8px 30px -10px color-mix(in oklab, var(--color-warning) 20%, transparent)' }
  }

  return (
    <div className="med-schedule-card" style={{ ...cardStyle, marginTop: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`med-safety-badge ${badgeClass}`}>
            {getSafetyLabel(status, locale)}
          </span>
        </div>
      </div>
      {safety.REASON && (
        <p style={{ margin: 0, fontSize: '13.5px', lineHeight: 1.6, color: 'var(--color-text)', fontWeight: 500 }}>
          {safety.REASON}
        </p>
      )}
      {safety.WEEK_NOTE && safety.WEEK_NOTE !== 'N/A' && (
        <p style={{ margin: 0, fontSize: '12px', lineHeight: 1.5, color: 'var(--color-muted)', paddingLeft: '0.75rem', borderLeft: '2px solid var(--color-border)' }}>
          {safety.WEEK_NOTE}
        </p>
      )}
      {safety.ALTERNATIVES && safety.ALTERNATIVES !== 'None needed' && (
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-muted)' }}>
          <strong style={{ color: 'var(--color-text)', fontWeight: 600 }}>
            {locale === 'bn' ? 'বিকল্প: ' : 'Alternatives: '}
          </strong>
          {safety.ALTERNATIVES}
        </p>
      )}
    </div>
  )
}

function MedexResultCard({ result, onAddToMyMeds, locale }) {
  const t = (en, bn) => (locale === 'en' ? en : bn)
  return (
    <div className="med-schedule-card" style={{ gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        {result.imageUrl && (
          <img
            src={result.imageUrl}
            alt={result.name}
            style={{ width: '64px', height: '64px', objectFit: 'contain', flexShrink: 0, borderRadius: '12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '4px' }}
          />
        )}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <strong style={{ fontSize: '15px', color: 'var(--color-text)' }}>{result.name}</strong>
          {result.description && (
            <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.45 }}>
              {result.description.length > 120 ? result.description.slice(0, 120) + '…' : result.description}
            </p>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
        <button
          className="btn btn--secondary"
          style={{ fontSize: '12px', padding: '8px 16px', borderRadius: '12px' }}
          onClick={onAddToMyMeds}
        >
          {t('+ My Medicines', '+ আমার ওষুধ')}
        </button>
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn--primary"
          style={{ fontSize: '12px', padding: '8px 16px', borderRadius: '12px', color: '#FFFFFF' }}
        >
          {t('View on Medex →', 'মেডেক্সে দেখুন →')}
        </a>
      </div>
    </div>
  )
}

function ScheduleCard({ sched, todayDoses, onDoseTaken, onDelete, locale }) {
  const takenToday = todayDoses[sched.id] || []
  const totalToday = (sched.dose_times || []).length
  const duration = getDurationDays(sched.start_date, sched.end_date)
  const relativeStart = getRelativeStartDate(sched.start_date, locale)
  const t = (en, bn) => (locale === 'en' ? en : bn)

  return (
    <div className="med-schedule-card">
      <div className="med-card-header">
        <div className="med-card-icon-wrapper">
          <Pill size={20} />
        </div>
        <div className="med-card-meta">
          <span className="med-card-title">{sched.medicine_name}</span>
          {sched.dosage && (
            <span className="med-card-subtitle">{sched.dosage}</span>
          )}
        </div>
        <button
          onClick={onDelete}
          className="med-card-delete-btn"
          title={t('Remove', 'মুছে ফেলুন')}
        >
          <Trash2 size={16} />
        </button>
      </div>

      {sched.description && (
        <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)', margin: '0', lineHeight: 1.4 }}>
          {sched.description.length > 120 ? sched.description.slice(0, 120) + '…' : sched.description}
        </p>
      )}

      {sched.notes && (
        <div className="med-card-notes">
          {sched.notes}
        </div>
      )}

      <div className="med-card-doses">
        {(sched.dose_times || []).map((time, idx) => {
          const taken = takenToday.includes(time)
          return taken ? (
            <span key={idx} className="dose-badge dose-badge--taken">
              <Check size={12} /> {time}
            </span>
          ) : (
            <button
              key={idx}
              onClick={() => onDoseTaken(sched.id, time)}
              className="dose-badge dose-badge--pending"
              title={t('Click to log dose', 'ডোজ লগ করতে ট্যাপ করুন')}
            >
              <Clock size={12} /> {time}
            </button>
          )
        })}
        <span className="med-doses-count-status" style={{ marginLeft: 'auto', alignSelf: 'center' }}>
          {takenToday.length}/{totalToday} {t('today', 'আজ')}
        </span>
      </div>

      <div className="med-card-footer">
        <span className="med-card-duration-badge">
          <Calendar size={12} /> {duration} {t('days', 'দিন')}
        </span>
        <span className="med-card-started-time">
          {relativeStart}
        </span>
      </div>
    </div>
  )
}
