import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MobileLayout from '../../components/layout/MobileLayout'
import { useApp } from '../../context/AppContext'
import { patientNavItems } from '../../data/navItems'
import * as api from '../../services/api'
import $ from '../../config/strings'
import { weekContent } from '../../data/pregnancyCalendar'
import { trimesterOfWeek, TRIMESTER_LABEL_KEY } from '../../data/education'
import './PregnancyCalendar.css'
import {
  CalendarDays,
  Baby,
  HeartPulse,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Apple,
  Activity,
  Brain,
  ClipboardList,
  Pencil,
} from 'lucide-react'

// ─── Date / time helpers ──────────────────────────────────
const MS_PER_DAY = 86400000
const TOTAL_DAYS = 280 // 40 weeks
const MIN_WEEK = 1
const MAX_WEEK = 42

function toDate(iso) {
  if (!iso) return null
  const d = new Date(iso)
  return Number.isFinite(d.getTime()) ? d : null
}

function fmtDate(d) {
  if (!d) return '—'
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function isoDate(d) {
  if (!d) return ''
  return d.toISOString().slice(0, 10)
}

// Compute live gestational week and day-of-week (1..7) from an LMP date.
// `nowMs` is injected so the calculation is pure (no Date.now() calls).
// Returns null when no LMP is available.
function computeAge(lmpIso, nowMs) {
  const lmp = toDate(lmpIso)
  if (!lmp) return null
  const ms = nowMs - lmp.getTime()
  if (ms < 0) return { week: MIN_WEEK, day: 1, isFuture: true }
  const totalDays = Math.floor(ms / MS_PER_DAY)
  const week = Math.max(MIN_WEEK, Math.min(MAX_WEEK, Math.floor(totalDays / 7) + 1))
  const day = Math.min(7, (totalDays % 7) + 1)
  return { week, day, isFuture: false }
}

// ─── Page ──────────────────────────────────────────────────

export default function PregnancyCalendar() {
  const { connectivity, locale } = useApp()
  const navigate = useNavigate()

  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [editOpen, setEditOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)

  // Load profile on mount
  useEffect(() => {
    let active = true
    async function load() {
      try {
        const data = await api.getMyPatientProfile()
        if (!active) return
        if (data && data.patient) {
          setPatient(data.patient)
          setDraft(data.patient.lmp_date ? isoDate(toDate(data.patient.lmp_date)) : '')
        }
      } catch {
        if (active) setError('Failed to load')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  // Capture "now" once per render via lazy state. Updated by a daily
  // interval so the countdown/pct reflect the current day.
  const [nowMs, setNowMs] = useState(() => Date.now())
  // Snapshot of today's date for the LMP date-picker `max` attribute.
  const [todayIso, setTodayIso] = useState(() => isoDate(new Date()))
  useEffect(() => {
    const tick = () => {
      const ms = Date.now()
      setNowMs(ms)
      setTodayIso(isoDate(new Date(ms)))
    }
    // Refresh at the next local midnight, then every 24h
    const next = 24 * 60 * 60 * 1000 - (Date.now() % (24 * 60 * 60 * 1000))
    const t1 = setTimeout(() => {
      tick()
      const t2 = setInterval(tick, 24 * 60 * 60 * 1000)
      // store handle on window so cleanup can find it
      window.__calInterval = t2
    }, next)
    return () => {
      clearTimeout(t1)
      if (window.__calInterval) {
        clearInterval(window.__calInterval)
        delete window.__calInterval
      }
    }
  }, [])

  // Derived live values
  const age = useMemo(() => computeAge(patient?.lmp_date, nowMs), [patient?.lmp_date, nowMs])
  const week = age?.week ?? 0
  const day = age?.day ?? 0
  const trimester = trimesterOfWeek(week)

  const lmpDate = useMemo(() => toDate(patient?.lmp_date), [patient?.lmp_date])
  const eddDate = useMemo(() => {
    if (!lmpDate) return null
    return new Date(lmpDate.getTime() + TOTAL_DAYS * MS_PER_DAY)
  }, [lmpDate])

  const daysUntilDue = useMemo(() => {
    if (!eddDate) return 0
    return Math.max(0, Math.ceil((eddDate.getTime() - nowMs) / MS_PER_DAY))
  }, [eddDate, nowMs])

  const pct = useMemo(() => {
    if (!age || age.isFuture) return 0
    const daysLived = Math.max(0, (week - 1) * 7 + (day - 1))
    return Math.min(100, Math.round((daysLived / TOTAL_DAYS) * 100))
  }, [age, week, day])

  // Content for the current week, clamped via the data file's selector
  const content = useMemo(() => weekContent(week), [week])
  const isPostTerm = week >= 41

  // Save handler for LMP
  async function handleSave() {
    setFormError(null)
    if (!draft) {
      setFormError($('CAL_ERR_DATE', locale))
      return
    }
    const parsed = toDate(draft)
    if (!parsed) {
      setFormError($('CAL_ERR_DATE', locale))
      return
    }
    if (!patient?.id) {
      setFormError($('CAL_ERR_SAVE', locale))
      return
    }
    setSaving(true)
    try {
      const res = await api.updatePatient(patient.id, { lmp_date: isoDate(parsed) })
      if (res && res.ok !== false && res.patient) {
        setPatient(res.patient)
        setEditOpen(false)
      } else {
        // Fall back to a re-fetch
        const fresh = await api.getMyPatientProfile()
        if (fresh?.patient) setPatient(fresh.patient)
        setEditOpen(false)
      }
    } catch {
      setFormError($('CAL_ERR_SAVE', locale))
    } finally {
      setSaving(false)
    }
  }

  // ─── Render helpers ──────────────────────────────────────

  function renderLoading() {
    return (
      <div className="pc-card text-center" style={{ padding: '1.5rem' }}>
        <p className="muted animate-pulse">{$('CAL_LOADING', locale)}</p>
      </div>
    )
  }

  function renderEmpty() {
    return (
      <div className="pc-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
        <h3 className="pc-title" style={{ marginBottom: '0.5rem' }}>{$('CAL_NO_RECORD_TITLE', locale)}</h3>
        <p className="muted" style={{ marginBottom: '1.25rem' }}>
          {$('CAL_NO_RECORD_BODY', locale)}
        </p>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => navigate('/patient/onboarding')}
        >
          {$('CAL_NO_RECORD_CTA', locale)}
        </button>
      </div>
    )
  }

  function renderDatesCard() {
    return (
      <div className="pc-card">
        <div className="pc-dates-header">
          <div className="pc-icon-title-group">
            <div className="pc-icon-wrapper">
              <CalendarDays />
            </div>
            <div>
              <h3 className="pc-title">{$('CAL_DATES_TITLE', locale)}</h3>
              <div className="pc-dates-info">
                <div>
                  <div className="pc-date-label">{$('CAL_LMP', locale)}</div>
                  <div className="pc-date-value">{fmtDate(lmpDate)}</div>
                </div>
                <div>
                  <div className="pc-date-label">{$('CAL_EDD', locale)}</div>
                  <div className="pc-date-value">{fmtDate(eddDate)}</div>
                </div>
              </div>
            </div>
          </div>
          {!editOpen && (
            <button
              type="button"
              className="pc-btn-edit"
              onClick={() => {
                setFormError(null)
                setEditOpen(true)
              }}
            >
              <Pencil />
              {$('CAL_SET_DATES', locale)}
            </button>
          )}
        </div>

        {editOpen && (
          <div className="pc-edit-form">
            <div className="pc-form-grid">
              <div className="pc-form-field">
                <label htmlFor="lmp-input" className="pc-input-label">{$('CAL_LMP', locale)}</label>
                <input
                  id="lmp-input"
                  type="date"
                  className="pc-date-input"
                  value={draft}
                  max={todayIso}
                  onChange={(e) => setDraft(e.target.value)}
                  aria-label={$('CAL_LMP', locale)}
                />
              </div>
            </div>
            {formError && (
              <div role="alert" className="pc-form-error">
                {formError}
              </div>
            )}
            <div className="pc-form-actions">
              <button
                type="button"
                className="pc-btn-save"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? $('CAL_SAVING', locale) : $('CAL_SAVE', locale)}
              </button>
              <button
                type="button"
                className="pc-btn-cancel"
                onClick={() => {
                  setEditOpen(false)
                  setFormError(null)
                  setDraft(patient?.lmp_date ? isoDate(toDate(patient.lmp_date)) : '')
                }}
                disabled={saving}
              >
                {$('CAL_CANCEL', locale)}
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  function renderSummary() {
    const weekDayText = $('CAL_WEEK_DAY', locale)
      .replace('{W}', String(week))
      .replace('{D}', String(day))
    const pctText = $('CAL_PCT_VALUES', locale).replace('{P}', String(pct))

    const parts = weekDayText.split('•')
    const weekStr = parts[0]?.trim() || ''
    const dayStr = parts[1]?.trim() || ''

    return (
      <div className="pc-week-hero" data-testid="cal-summary">
        <div className="pc-hero-main">
          <div className="pc-hero-left">
            {trimester && (
              <div className="pc-hero-trimester">
                {$(TRIMESTER_LABEL_KEY[trimester], locale)}
              </div>
            )}
            <h2 className="pc-hero-week">
              {weekStr} <span className="pc-hero-week-dot">•</span> <span className="pc-hero-day">{dayStr}</span>
            </h2>
          </div>
          <div className="pc-hero-right">
            <div>
              <div className="pc-hero-stat-value">{daysUntilDue}</div>
              <div className="pc-hero-stat-label">
                {$('CAL_DAYS_UNTIL_DUE', locale)}
              </div>
            </div>
            <div>
              <div className="pc-hero-stat-value percent">{pctText}</div>
              <div className="pc-hero-stat-label">
                {$('CAL_PCT_COMPLETE', locale)}
              </div>
            </div>
          </div>
        </div>
        <div className="pc-hero-progress-track">
          <div
            className="pc-hero-progress-bar"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    )
  }

  function renderBaby() {
    if (!content) return null

    const sizeStr = content.baby.size
    const match = sizeStr.match(/^(.*?)(\s*\(.*?\))\s*$/)
    let displayName = sizeStr
    let displayMetric = ''
    if (match) {
      displayName = match[1]
      displayMetric = match[2]
    }

    return (
      <section className="pc-card">
        <div className="pc-section-heading">
          <Baby />
          <h3>{$('CAL_BABY', locale)}</h3>
        </div>

        <div className="pc-baby-size-card" aria-label={$('CAL_BABY_SIZE', locale)}>
          <div className="pc-baby-size-label">
            {$('CAL_BABY_SIZE', locale)}
          </div>
          <div className="pc-baby-size-value">
            {displayName} {displayMetric && <span className="pc-baby-size-metric">{displayMetric}</span>}
          </div>
        </div>

        <p className="pc-section-summary">{content.baby.caption}</p>

        <div className="pc-sub-heading">
          {$('CAL_BABY_HIGHLIGHTS', locale)}
        </div>
        <div className="pc-pill-container">
          {content.baby.highlights.map((h, i) => (
            <div key={i} className="pc-pill-item">{h}</div>
          ))}
        </div>
      </section>
    )
  }

  function renderBody() {
    if (!content) return null
    return (
      <section className="pc-card">
        <div className="pc-section-heading">
          <HeartPulse />
          <h3>{$('CAL_BODY', locale)}</h3>
        </div>
        <div className="pc-pill-container" style={{ marginTop: '1.25rem' }}>
          {content.body.changes.map((c, i) => (
            <div key={i} className="pc-pill-item">{c}</div>
          ))}
        </div>
      </section>
    )
  }

  function renderSymptoms() {
    if (!content) return null
    return (
      <section className="pc-card">
        <div className="pc-section-heading">
          <h3>{$('CAL_SYMPTOMS_TITLE', locale)}</h3>
        </div>
        <div className="pc-symptoms-grid">
          <div className="pc-symptom-card">
            <div className="pc-symptom-indicator normal" />
            <span className="pc-symptom-badge normal">
              <CheckCircle2 />
              {$('CAL_SYMPTOMS_NORMAL', locale)}
            </span>
            <div className="pc-symptom-list">
              {content.symptoms.normal.map((s, i) => (
                <div key={i} className="pc-symptom-item">{s}</div>
              ))}
            </div>
          </div>

          <div className="pc-symptom-card">
            <div className="pc-symptom-indicator warning" />
            <span className="pc-symptom-badge warning">
              <AlertTriangle />
              {$('CAL_SYMPTOMS_WARNING', locale)}
            </span>
            <div className="pc-symptom-list">
              {content.symptoms.warning.map((s, i) => (
                <div key={i} className="pc-symptom-item">{s}</div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  function renderTips() {
    if (!content) return null
    const tips = [
      { icon: Apple, label: $('CAL_TIPS_NUTRITION', locale), body: content.tips.nutrition[0] },
      { icon: Activity, label: $('CAL_TIPS_EXERCISE', locale), body: content.tips.exercise[0] },
      { icon: Brain, label: $('CAL_TIPS_MENTAL', locale), body: content.tips.mentalHealth[0] },
      { icon: ClipboardList, label: $('CAL_TIPS_PREP', locale), body: content.tips.preparation[0] },
    ]
    return (
      <section style={{ marginTop: '0.75rem' }}>
        <div className="pc-section-heading">
          <Sparkles />
          <h3>{$('CAL_TIPS_TITLE', locale)}</h3>
        </div>
        <div className="pc-tips-grid">
          {tips.map((tip) => {
            const IconComponent = tip.icon
            return (
              <div key={tip.label} className="pc-tip-card">
                <div className="pc-tip-icon-container">
                  <IconComponent />
                </div>
                <div className="pc-tip-label">
                  {tip.label}
                </div>
                <p className="pc-tip-body">{tip.body}</p>
              </div>
            )
          })}
        </div>
      </section>
    )
  }

  function renderPostTerm() {
    return (
      <div role="alert" className="pc-post-term-alert">
        {$('CAL_POST_TERM_NOTICE', locale)}
      </div>
    )
  }

  // ─── Main render ─────────────────────────────────────────

  return (
    <MobileLayout
      title={$('PAGE_TITLE_CALENDAR', locale)}
      status={connectivity}
      navItems={patientNavItems(locale)}
    >
      <div className="animate-fade-in pc-container">
        {loading ? (
          renderLoading()
        ) : error ? (
          <div className="pc-card" style={{ padding: '1rem', color: 'var(--color-danger)' }}>
            {error}
          </div>
        ) : !patient?.lmp_date ? (
          renderEmpty()
        ) : (
          <>
            {renderDatesCard()}
            {renderSummary()}
            {isPostTerm && renderPostTerm()}
            {renderBaby()}
            {renderBody()}
            {renderSymptoms()}
            {renderTips()}
          </>
        )}
      </div>
    </MobileLayout>
  )
}
