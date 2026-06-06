import { useState, useEffect, useMemo } from 'react'
import MobileLayout from '../../components/layout/MobileLayout'
import { useApp } from '../../context/AppContext'
import { patientNavItems } from '../../data/navItems'
import * as api from '../../services/api'
import $ from '../../config/strings'
import {
  FAQ_CATEGORIES,
  LIBRARY_CATEGORIES,
  HOSPITAL_BAG,
  HOSPITAL_BAG_TOTAL,
  HOSPITAL_BAG_STORAGE_KEY,
  trimesterOfWeek,
  TRIMESTER_LABEL_KEY,
} from '../../data/education'

// ─── Sub-components (kept inside this file to keep the new
// feature self-contained and not require any other file change) ───

function PregnancyBanner({ patient, trimester, locale }) {
  if (!patient || !patient.gestational_week) {
    return (
      <div className="edu-banner">
        <div>
          <div className="edu-banner__week">{$('EDU_BANNER_NO_PROFILE', locale)}</div>
        </div>
      </div>
    )
  }
  const tKey = trimester ? TRIMESTER_LABEL_KEY[trimester] : null
  const tLabel = tKey ? $(tKey, locale) : ''
  return (
    <div className="edu-banner">
      <div>
        <div className="edu-banner__week">
          {$('EDU_BANNER_WEEK_PREFIX', locale)} {patient.gestational_week}
        </div>
        {tLabel && <div className="edu-banner__trimester">{tLabel}</div>}
      </div>
      {trimester && (
        <span className="edu-banner__rec">{$('EDU_BANNER_RECOMMENDED', locale)}</span>
      )}
    </div>
  )
}

function ChipRow({ options, value, onChange }) {
  return (
    <div className="chip-row" role="tablist" aria-label="filter">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          role="tab"
          aria-selected={value === opt.id}
          className={'chip' + (value === opt.id ? ' active' : '')}
          onClick={() => onChange(opt.id)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function Chevron() {
  return (
    <svg
      className="edu-accordion__chev"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function FaqItem({ item, isOpen, onToggle, trimester, recKey }) {
  return (
    <div className="edu-accordion" data-open={isOpen ? 'true' : 'false'}>
      <button
        type="button"
        className="edu-accordion__head"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span style={{ flex: 1 }}>
          {item.q}
          {recKey && <span className="edu-tag">★</span>}
          {trimester && <span className="edu-tag">{trimester}</span>}
        </span>
        <Chevron />
      </button>
      <div className="edu-accordion__body" role="region">
        <p>{item.a}</p>
      </div>
    </div>
  )
}

function FaqSection({ trimester, locale }) {
  const [catId, setCatId] = useState('all')
  const [openId, setOpenId] = useState(null)

  const options = useMemo(
    () => [
      { id: 'all', label: $('EDU_FILTER_ALL', locale) },
      ...FAQ_CATEGORIES.map((c) => ({ id: c.id, label: $(c.key, locale) })),
    ],
    [locale]
  )

  const filtered = useMemo(() => {
    const cats =
      catId === 'all'
        ? FAQ_CATEGORIES
        : FAQ_CATEGORIES.filter((c) => c.id === catId)
    const items = []
    cats.forEach((cat) =>
      cat.items.forEach((it, i) => {
        items.push({
          key: cat.id + ':' + i,
          catLabel: $(cat.key, locale),
          item: it,
          isRecommended:
            trimester && it.trimester && it.trimester === trimester,
        })
      })
    )
    // Recommended-first within the visible list
    items.sort((a, b) => (b.isRecommended ? 1 : 0) - (a.isRecommended ? 1 : 0))
    return items
  }, [catId, trimester, locale])

  return (
    <div>
      <ChipRow options={options} value={catId} onChange={setCatId} />
      {filtered.length === 0 ? (
        <p className="muted text-sm" style={{ marginTop: '0.75rem' }}>
          {$('EDU_FAQ_EMPTY', locale)}
        </p>
      ) : (
        <div style={{ marginTop: '0.75rem' }}>
          {filtered.map((row) => (
            <FaqItem
              key={row.key}
              item={row.item}
              isOpen={openId === row.key}
              onToggle={() => setOpenId(openId === row.key ? null : row.key)}
              trimester={row.item.trimester}
              locale={locale}
              recKey={row.isRecommended}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function LibraryArticle({ article, locale, recKey }) {
  const [open, setOpen] = useState(false)
  // Resolve the structured field labels by category id
  const fields = []
  if (article.definition) fields.push({ label: $('EDU_LIB_ARTICLE_DEF', locale), value: article.definition })
  if (article.symptoms) fields.push({ label: $('EDU_LIB_ARTICLE_SYMPTOMS', locale), value: article.symptoms })
  if (article.risk_factors) fields.push({ label: $('EDU_LIB_ARTICLE_RISK_FACTORS', locale), value: article.risk_factors })
  if (article.prevention) fields.push({ label: $('EDU_LIB_ARTICLE_PREVENTION', locale), value: article.prevention })
  if (article.seek_help) fields.push({ label: $('EDU_LIB_ARTICLE_SEEK_HELP', locale), value: article.seek_help })
  if (article.benefits) fields.push({ label: $('EDU_LIB_ARTICLE_BENEFITS', locale), value: article.benefits })
  if (article.precautions) fields.push({ label: $('EDU_LIB_ARTICLE_PRECAUTIONS', locale), value: article.precautions })
  if (article.contraindications) fields.push({ label: $('EDU_LIB_ARTICLE_CONTRAINDICATIONS', locale), value: article.contraindications })
  if (article.meaning) fields.push({ label: $('EDU_LIB_ARTICLE_MEANING', locale), value: article.meaning })
  if (article.why_it_matters) fields.push({ label: $('EDU_LIB_ARTICLE_WHY', locale), value: article.why_it_matters })
  if (article.normal_range) fields.push({ label: $('EDU_LIB_ARTICLE_NORMAL_RANGE', locale), value: article.normal_range })
  // Free-text body articles (categories B/C/F) fall back to `body`
  if (fields.length === 0 && article.body) {
    fields.push({ label: null, value: article.body })
  }

  const title = article.title || article.term
  return (
    <div className="edu-accordion" data-open={open ? 'true' : 'false'}>
      <button
        type="button"
        className="edu-accordion__head"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span style={{ flex: 1 }}>
          {title}
          {recKey && <span className="edu-tag">★</span>}
          {article.trimester && <span className="edu-tag">{article.trimester}</span>}
        </span>
        <Chevron />
      </button>
      <div className="edu-accordion__body" role="region">
        {fields.map((f, i) => (
          <p key={i}>
            {f.label && <strong>{f.label}: </strong>}
            {f.value}
          </p>
        ))}
      </div>
    </div>
  )
}

function LibrarySection({ trimester, locale }) {
  const [catId, setCatId] = useState('all')

  const options = useMemo(
    () => [
      { id: 'all', label: $('EDU_FILTER_ALL', locale) },
      ...LIBRARY_CATEGORIES.map((c) => ({ id: c.id, label: $(c.key, locale) })),
    ],
    [locale]
  )

  const visibleCategories = useMemo(
    () =>
      catId === 'all'
        ? LIBRARY_CATEGORIES
        : LIBRARY_CATEGORIES.filter((c) => c.id === catId),
    [catId]
  )

  return (
    <div>
      <ChipRow options={options} value={catId} onChange={setCatId} />
      {visibleCategories.map((cat) => (
        <div key={cat.id} style={{ marginTop: '1rem' }}>
          <h3 className="text-gradient" style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem' }}>
            {$(cat.key, locale)}
          </h3>
          {cat.articles.map((a) => (
            <LibraryArticle
              key={a.id}
              article={a}
              locale={locale}
              recKey={trimester && a.trimester && a.trimester === trimester}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function ChecklistGroup({ title, items, packed, onToggle }) {
  const groupTotal = items.length
  const groupPacked = items.filter((it) => packed[it.id]).length
  return (
    <div className="card" style={{ marginBottom: '0.75rem' }}>
      <div className="edu-group">
        <span>{title}</span>
        <span className="edu-group__count">
          {groupPacked}/{groupTotal}
        </span>
      </div>
      <div className="edu-check-list">
        {items.map((it) => {
          const isPacked = !!packed[it.id]
          return (
            <div
              key={it.id}
              className="edu-check"
              data-packed={isPacked ? 'true' : 'false'}
              role="checkbox"
              aria-checked={isPacked}
              tabIndex={0}
              onClick={() => onToggle(it.id)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault()
                  onToggle(it.id)
                }
              }}
            >
              <span className="edu-check__box" aria-hidden="true">
                {isPacked && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </span>
              <span className="edu-check__label">{it.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ChecklistSection({ locale }) {
  const [packed, setPacked] = useState(() => {
    try {
      const raw = localStorage.getItem(HOSPITAL_BAG_STORAGE_KEY)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  })

  // Persist on every change
  useEffect(() => {
    try {
      localStorage.setItem(HOSPITAL_BAG_STORAGE_KEY, JSON.stringify(packed))
    } catch {
      /* localStorage might be disabled; non-fatal */
    }
  }, [packed])

  const totalPacked = Object.values(packed).filter(Boolean).length
  const pct = HOSPITAL_BAG_TOTAL === 0 ? 0 : Math.round((totalPacked / HOSPITAL_BAG_TOTAL) * 100)

  function toggle(id) {
    setPacked((prev) => ({ ...prev, [id]: !prev[id] }))
  }
  function reset() {
    if (typeof window !== 'undefined' && window.confirm($('EDU_CHECK_RESET_CONFIRM', locale))) {
      setPacked({})
    }
  }

  const progressText = $('EDU_CHECK_PROGRESS', locale)
    .replace('$X', String(totalPacked))
    .replace('$Y', String(HOSPITAL_BAG_TOTAL))
  const pctText = $('EDU_CHECK_PROGRESS_PCT', locale).replace('$P', String(pct))
  const isComplete = totalPacked === HOSPITAL_BAG_TOTAL && HOSPITAL_BAG_TOTAL > 0

  return (
    <div>
      <div className="card" style={{ marginBottom: '0.75rem' }}>
        <div className="edu-progress-meta">
          <div>
            <strong>{progressText}</strong>
            <span className="muted text-sm" style={{ marginLeft: '0.5rem' }}>· {pctText}</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {isComplete && (
              <span className="badge badge--online">{$('EDU_CHECK_DONE_BADGE', locale)}</span>
            )}
            <button
              type="button"
              className="btn btn--ghost"
              onClick={reset}
              disabled={totalPacked === 0}
              style={{ fontSize: '0.8rem', padding: '4px 10px' }}
            >
              {$('EDU_CHECK_RESET', locale)}
            </button>
          </div>
        </div>
        <div className="edu-progress" aria-label="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className="edu-progress__bar" style={{ width: pct + '%' }} />
        </div>
      </div>

      <ChecklistGroup
        title={$('EDU_LIB_GROUP_MOTHER', locale)}
        items={HOSPITAL_BAG.mother}
        packed={packed}
        onToggle={toggle}
      />
      <ChecklistGroup
        title={$('EDU_LIB_GROUP_BABY', locale)}
        items={HOSPITAL_BAG.baby}
        packed={packed}
        onToggle={toggle}
      />
      <ChecklistGroup
        title={$('EDU_LIB_GROUP_DOCS', locale)}
        items={HOSPITAL_BAG.documents}
        packed={packed}
        onToggle={toggle}
      />
    </div>
  )
}

// ─── Top-level page ─────────────────────────────────────────

export default function Education() {
  const { connectivity, locale } = useApp()
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('faq')

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getMyPatientProfile()
        if (data && data.patient) setPatient(data.patient)
      } catch (err) {
        console.error('Education page: failed to load patient profile', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const trimester = trimesterOfWeek(patient?.gestational_week)

  const tabOptions = useMemo(
    () => [
      { id: 'faq', label: $('EDU_TAB_FAQ', locale) },
      { id: 'library', label: $('EDU_TAB_LIBRARY', locale) },
      { id: 'checklist', label: $('EDU_TAB_CHECKLIST', locale) },
    ],
    [locale]
  )

  return (
    <MobileLayout
      title={$('PAGE_TITLE_EDUCATION', locale)}
      status={connectivity}
      navItems={patientNavItems(locale)}
    >
      <div className="animate-fade-in">
        {loading ? (
          <div className="card text-center" style={{ padding: '1.5rem' }}>
            <p className="muted animate-pulse">{$('EDU_LOADING', locale)}</p>
          </div>
        ) : (
          <>
            <PregnancyBanner patient={patient} trimester={trimester} locale={locale} />

            <div className="section-header" style={{ marginTop: '0.5rem' }}>
              <h3> </h3>
            </div>
            <ChipRow options={tabOptions} value={tab} onChange={setTab} />

            <div style={{ marginTop: '1rem' }}>
              {tab === 'faq' && <FaqSection trimester={trimester} locale={locale} />}
              {tab === 'library' && <LibrarySection trimester={trimester} locale={locale} />}
              {tab === 'checklist' && <ChecklistSection locale={locale} />}
            </div>
          </>
        )}
      </div>
    </MobileLayout>
  )
}
