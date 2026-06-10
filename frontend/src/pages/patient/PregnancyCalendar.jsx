import { useEffect, useMemo, useState } from 'react'
import MobileLayout from '../../components/layout/MobileLayout'
import { useApp } from '../../context/AppContext'
import { patientNavItems } from '../../data/navItems'
import * as api from '../../services/api'
import $ from '../../config/strings'
import { weekContent, weekContentBn } from '../../data/pregnancyCalendar'
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

  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [editOpen, setEditOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [draftMode, setDraftMode] = useState('lmp')   // 'lmp' | 'week'
  const [draftWeek, setDraftWeek] = useState('')
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
          if (!data.patient.lmp_date) setEditOpen(true)
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
  const contentBn = useMemo(() => weekContentBn(week), [week])
  const isPostTerm = week >= 41

  // Pick Bengali value from flat BN object if locale is 'bn', else fall back to English
  function bn(enValue, bnKey) {
    return locale === 'bn' && contentBn?.[bnKey] ? contentBn[bnKey] : enValue
  }

  // Save handler for LMP date or direct week number
  async function handleSave() {
    setFormError(null)
    if (!patient?.id) {
      setFormError($('CAL_ERR_SAVE', locale))
      return
    }

    let lmpIso
    if (draftMode === 'week') {
      const weeks = parseInt(draftWeek)
      if (!draftWeek || isNaN(weeks) || weeks < 1 || weeks > 42) {
        setFormError(locale === 'bn' ? 'সপ্তাহ ১–৪২ এর মধ্যে হতে হবে' : 'Week must be between 1 and 42')
        return
      }
      const lmpMs = Date.now() - weeks * 7 * 24 * 60 * 60 * 1000
      lmpIso = new Date(lmpMs).toISOString().slice(0, 10)
    } else {
      if (!draft) {
        setFormError($('CAL_ERR_DATE', locale))
        return
      }
      const parsed = toDate(draft)
      if (!parsed) {
        setFormError($('CAL_ERR_DATE', locale))
        return
      }
      lmpIso = isoDate(parsed)
    }

    setSaving(true)
    try {
      const res = await api.updatePatient(patient.id, { lmp_date: lmpIso })
      if (res && res.ok !== false && res.patient) {
        setPatient(res.patient)
        setDraft(lmpIso)
        setEditOpen(false)
      } else {
        const fresh = await api.getMyPatientProfile()
        if (fresh?.patient) {
          setPatient(fresh.patient)
          setDraft(fresh.patient.lmp_date ? isoDate(toDate(fresh.patient.lmp_date)) : '')
        }
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
            {/* Mode toggle */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <button
                type="button"
                onClick={() => { setDraftMode('lmp'); setDraftWeek('') }}
                style={{
                  flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid',
                  borderColor: draftMode === 'lmp' ? 'var(--color-primary)' : 'var(--color-border)',
                  background: draftMode === 'lmp' ? 'color-mix(in oklab, var(--color-primary) 10%, transparent)' : 'transparent',
                  color: draftMode === 'lmp' ? 'var(--color-primary)' : 'var(--color-muted)',
                  fontWeight: draftMode === 'lmp' ? 600 : 400, fontSize: '13px', cursor: 'pointer'
                }}
              >
                {locale === 'bn' ? 'শেষ মাসিক তারিখ' : 'LMP Date'}
              </button>
              <button
                type="button"
                onClick={() => { setDraftMode('week'); setDraft('') }}
                style={{
                  flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid',
                  borderColor: draftMode === 'week' ? 'var(--color-primary)' : 'var(--color-border)',
                  background: draftMode === 'week' ? 'color-mix(in oklab, var(--color-primary) 10%, transparent)' : 'transparent',
                  color: draftMode === 'week' ? 'var(--color-primary)' : 'var(--color-muted)',
                  fontWeight: draftMode === 'week' ? 600 : 400, fontSize: '13px', cursor: 'pointer'
                }}
              >
                {locale === 'bn' ? 'সপ্তাহ নম্বর' : 'Week Number'}
              </button>
            </div>

            <div className="pc-form-grid">
              {draftMode === 'lmp' ? (
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
              ) : (
                <div className="pc-form-field">
                  <label htmlFor="week-input" className="pc-input-label">
                    {locale === 'bn' ? 'বর্তমান গর্ভাবস্থার সপ্তাহ (১–৪২)' : 'Current Pregnancy Week (1–42)'}
                  </label>
                  <input
                    id="week-input"
                    type="number"
                    className="pc-date-input"
                    value={draftWeek}
                    min="1"
                    max="42"
                    onChange={(e) => setDraftWeek(e.target.value)}
                    placeholder={locale === 'bn' ? 'যেমন: ২৫' : 'e.g. 25'}
                    aria-label={locale === 'bn' ? 'সপ্তাহ নম্বর' : 'Week number'}
                  />
                </div>
              )}
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
              {patient?.lmp_date && (
                <button
                  type="button"
                  className="pc-btn-cancel"
                  onClick={() => {
                    setEditOpen(false)
                    setFormError(null)
                    setDraftMode('lmp')
                    setDraftWeek('')
                    setDraft(patient?.lmp_date ? isoDate(toDate(patient.lmp_date)) : '')
                  }}
                  disabled={saving}
                >
                  {$('CAL_CANCEL', locale)}
                </button>
              )}
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

    const sizeStr = bn(content.baby.size, 'size_bn')
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

        <p className="pc-section-summary">{bn(content.baby.caption, 'caption_bn')}</p>

        <div className="pc-sub-heading">
          {$('CAL_BABY_HIGHLIGHTS', locale)}
        </div>
        <div className="pc-pill-container">
          {bn(content.baby.highlights, 'highlights_bn').map((h, i) => (
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
          {bn(content.body.changes, 'changes_bn').map((c, i) => (
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
              {bn(content.symptoms.normal, 'normal_bn').map((s, i) => (
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
              {bn(content.symptoms.warning, 'warning_bn').map((s, i) => (
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
      { icon: Apple, label: $('CAL_TIPS_NUTRITION', locale), body: bn(content.tips.nutrition, 'nutrition_bn')[0] },
      { icon: Activity, label: $('CAL_TIPS_EXERCISE', locale), body: bn(content.tips.exercise, 'exercise_bn')[0] },
      { icon: Brain, label: $('CAL_TIPS_MENTAL', locale), body: bn(content.tips.mentalHealth, 'mentalHealth_bn')[0] },
      { icon: ClipboardList, label: $('CAL_TIPS_PREP', locale), body: bn(content.tips.preparation, 'preparation_bn')[0] },
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
        ) : (
          <>
            {renderDatesCard()}
            {!patient?.lmp_date ? (
              <div className="pc-card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                <p className="muted">{$('CAL_NO_RECORD_BODY', locale)}</p>
              </div>
            ) : (
              <>
                {renderSummary()}
                {isPostTerm && renderPostTerm()}
                {renderBaby()}
                {renderBody()}
                {renderSymptoms()}
                {renderTips()}
              </>
            )}
          </>
        )}
      </div>
    </MobileLayout>
  )
}
