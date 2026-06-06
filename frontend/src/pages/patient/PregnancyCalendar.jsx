import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MobileLayout from '../../components/layout/MobileLayout'
import { useApp } from '../../context/AppContext'
import { patientNavItems } from '../../data/navItems'
import * as api from '../../services/api'
import $ from '../../config/strings'
import { weekContent } from '../../data/pregnancyCalendar'
import { trimesterOfWeek, TRIMESTER_LABEL_KEY } from '../../data/education'

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
      <div className="card text-center" style={{ padding: '1.5rem' }}>
        <p className="muted animate-pulse">{$('CAL_LOADING', locale)}</p>
      </div>
    )
  }

  function renderEmpty() {
    return (
      <div className="card" style={{ padding: '1.25rem' }}>
        <h3>{$('CAL_NO_RECORD_TITLE', locale)}</h3>
        <p className="muted" style={{ marginTop: '0.5rem' }}>
          {$('CAL_NO_RECORD_BODY', locale)}
        </p>
        <button
          type="button"
          className="btn btn--primary"
          style={{ marginTop: '1rem' }}
          onClick={() => navigate('/patient/onboarding')}
        >
          {$('CAL_NO_RECORD_CTA', locale)}
        </button>
      </div>
    )
  }

  function renderDatesCard() {
    return (
      <div className="card" style={{ padding: '1rem', marginBottom: '0.75rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div className="section-header" style={{ marginBottom: '0.25rem' }}>
              <h4 style={{ margin: 0 }}>{$('CAL_DATES_TITLE', locale)}</h4>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div className="muted" style={{ fontSize: '0.75rem' }}>{$('CAL_LMP', locale)}</div>
                <div style={{ fontWeight: 600 }}>{fmtDate(lmpDate)}</div>
              </div>
              <div>
                <div className="muted" style={{ fontSize: '0.75rem' }}>{$('CAL_EDD', locale)}</div>
                <div style={{ fontWeight: 600 }}>{fmtDate(eddDate)}</div>
              </div>
            </div>
          </div>
          {!editOpen && (
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                setFormError(null)
                setEditOpen(true)
              }}
            >
              {$('CAL_SET_DATES', locale)}
            </button>
          )}
        </div>

        {editOpen && (
          <div style={{ marginTop: '0.85rem' }}>
            <div className="input-wrapper">
              <input
                type="date"
                className="input"
                value={draft}
                max={todayIso}
                onChange={(e) => setDraft(e.target.value)}
                aria-label={$('CAL_LMP', locale)}
              />
            </div>
            {formError && (
              <div
                role="alert"
                style={{
                  color: 'var(--color-danger)',
                  marginTop: '0.5rem',
                  fontSize: '0.85rem',
                }}
              >
                {formError}
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
              <button
                type="button"
                className="btn btn--primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? $('CAL_SAVING', locale) : $('CAL_SAVE', locale)}
              </button>
              <button
                type="button"
                className="btn btn--ghost"
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
    const daysText = $('CAL_WEEK_DAY_VALUES', locale).replace('{N}', String(daysUntilDue))
    const pctText = $('CAL_PCT_VALUES', locale).replace('{P}', String(pct))

    return (
      <div className="edu-banner" data-testid="cal-summary">
        <div>
          <div className="edu-banner__week">{weekDayText}</div>
          {trimester && (
            <div className="edu-banner__trimester">
              {$(TRIMESTER_LABEL_KEY[trimester], locale)}
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{daysText}</div>
          <div style={{ fontSize: '0.78rem', opacity: 0.92 }}>
            {$('CAL_DAYS_UNTIL_DUE', locale)}
          </div>
          <div
            style={{
              marginTop: '0.35rem',
              fontSize: '0.95rem',
              fontWeight: 700,
            }}
          >
            {pctText}
          </div>
          <div style={{ fontSize: '0.72rem', opacity: 0.92 }}>
            {$('CAL_PCT_COMPLETE', locale)}
          </div>
        </div>
      </div>
    )
  }

  function renderBaby() {
    if (!content) return null
    return (
      <section className="card" style={{ padding: '1rem', marginBottom: '0.75rem' }}>
        <div className="section-header">
          <h3 style={{ margin: 0 }}>{$('CAL_BABY', locale)}</h3>
        </div>

        {/* Hero placeholder — gradient card with the size label. Real fetal
            illustrations can replace this <div> with an <img> when assets
            become available, keyed by week via a static import map. */}
        <div
          aria-label={$('CAL_BABY_SIZE', locale)}
          style={{
            marginTop: '0.6rem',
            marginBottom: '0.6rem',
            height: '120px',
            borderRadius: 'var(--radius-lg)',
            background:
              'linear-gradient(135deg, var(--color-primary-dim), var(--color-secondary-dim))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '0.75rem',
            border: '1px dashed var(--color-border)',
          }}
        >
          <div>
            <div
              className="muted"
              style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}
            >
              {$('CAL_BABY_SIZE', locale)}
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.25rem' }}>
              {content.baby.size}
            </div>
          </div>
        </div>

        <p style={{ marginTop: '0.4rem' }}>{content.baby.caption}</p>

        <div className="muted" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
          {$('CAL_BABY_HIGHLIGHTS', locale)}
        </div>
        <ul className="list" style={{ marginTop: '0.25rem' }}>
          {content.baby.highlights.map((h, i) => (
            <li key={i} className="list-item">{h}</li>
          ))}
        </ul>
      </section>
    )
  }

  function renderBody() {
    if (!content) return null
    return (
      <section className="card" style={{ padding: '1rem', marginBottom: '0.75rem' }}>
        <div className="section-header">
          <h3 style={{ margin: 0 }}>{$('CAL_BODY', locale)}</h3>
        </div>
        <ul className="list" style={{ marginTop: '0.4rem' }}>
          {content.body.changes.map((c, i) => (
            <li key={i} className="list-item">{c}</li>
          ))}
        </ul>
      </section>
    )
  }

  function renderSymptoms() {
    if (!content) return null
    return (
      <section className="card" style={{ padding: '1rem', marginBottom: '0.75rem' }}>
        <div className="section-header">
          <h3 style={{ margin: 0 }}>{$('CAL_SYMPTOMS_TITLE', locale)}</h3>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.75rem',
            marginTop: '0.5rem',
          }}
        >
          <div
            className="card"
            style={{
              padding: '0.75rem',
              borderLeft: '4px solid var(--color-success)',
              background: 'var(--color-success-dim)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                marginBottom: '0.4rem',
              }}
            >
              <span className="badge badge--low">{$('CAL_SYMPTOMS_NORMAL', locale)}</span>
            </div>
            <ul className="list">
              {content.symptoms.normal.map((s, i) => (
                <li key={i} className="list-item">{s}</li>
              ))}
            </ul>
          </div>

          <div
            className="card"
            style={{
              padding: '0.75rem',
              borderLeft: '4px solid var(--color-danger)',
              background: 'var(--color-danger-dim)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                marginBottom: '0.4rem',
              }}
            >
              <span className="badge badge--high">{$('CAL_SYMPTOMS_WARNING', locale)}</span>
            </div>
            <ul className="list">
              {content.symptoms.warning.map((s, i) => (
                <li key={i} className="list-item">{s}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    )
  }

  function renderTips() {
    if (!content) return null
    const groups = [
      { key: 'nutrition', label: $('CAL_TIPS_NUTRITION', locale) },
      { key: 'exercise', label: $('CAL_TIPS_EXERCISE', locale) },
      { key: 'mentalHealth', label: $('CAL_TIPS_MENTAL', locale) },
      { key: 'preparation', label: $('CAL_TIPS_PREP', locale) },
    ]
    return (
      <section className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div className="section-header">
          <h3 style={{ margin: 0 }}>{$('CAL_TIPS_TITLE', locale)}</h3>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.6rem',
            marginTop: '0.5rem',
          }}
        >
          {groups.map((g) => (
            <div
              key={g.key}
              className="card"
              style={{
                padding: '0.75rem',
                background: 'var(--color-surface)',
              }}
            >
              <div
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: 'var(--color-primary)',
                  marginBottom: '0.4rem',
                }}
              >
                {g.label}
              </div>
              <ul className="list">
                {content.tips[g.key].map((t, i) => (
                  <li key={i} className="list-item">{t}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    )
  }

  function renderPostTerm() {
    return (
      <div
        className="card"
        role="alert"
        style={{
          padding: '0.75rem',
          marginBottom: '0.75rem',
          borderLeft: '4px solid var(--color-danger)',
          background: 'var(--color-danger-dim)',
        }}
      >
        <span className="badge badge--high">{$('CAL_POST_TERM_NOTICE', locale)}</span>
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
      <div className="animate-fade-in">
        {loading ? (
          renderLoading()
        ) : error ? (
          <div className="card" style={{ padding: '1rem', color: 'var(--color-danger)' }}>
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
