import { useState, useEffect, useMemo } from 'react'
import MobileLayout from '../../components/layout/MobileLayout'
import { useApp } from '../../context/AppContext'
import { patientNavItems } from '../../data/navItems'
import * as api from '../../services/api'
import $ from '../../config/strings'
import './Education.css'
import {
  ChevronDown,
  Sparkles,
  BookOpen,
  Briefcase,
  Star,
  Check,
  RotateCcw,
  Baby,
  HeartPulse,
  FileText,
} from 'lucide-react'
import {
  FAQ_CATEGORIES,
  LIBRARY_CATEGORIES,
  HOSPITAL_BAG,
  HOSPITAL_BAG_TOTAL,
  HOSPITAL_BAG_STORAGE_KEY,
  trimesterOfWeek,
  TRIMESTER_LABEL_KEY,
} from '../../data/education'

function loc(obj, field, locale) {
  return locale === 'bn' && obj[field + '_bn'] ? obj[field + '_bn'] : obj[field]
}

// ─── Sub-components ───

function PregnancyBanner({ patient, trimester, locale }) {
  if (!patient || !patient.gestational_week) {
    return (
      <div className="edu-banner">
        <div className="edu-banner__content">
          <p className="edu-banner__trimester">{$('EDU_BANNER_NO_PROFILE', locale)}</p>
        </div>
      </div>
    )
  }
  const tKey = trimester ? TRIMESTER_LABEL_KEY[trimester] : null
  const tLabel = tKey ? $(tKey, locale) : ''
  return (
    <div className="edu-banner">
      <div className="edu-banner__content">
        <span className="edu-banner__rec">{$('EDU_BANNER_RECOMMENDED', locale)}</span>
        <h2 className="edu-banner__week">
          {$('EDU_BANNER_WEEK_PREFIX', locale)}
          <span className="edu-banner__week-num"> {patient.gestational_week}</span>
        </h2>
        {tLabel && (
          <p className="edu-banner__trimester">
            {tLabel} · {locale === 'bn' ? 'এই সপ্তাহের নির্বাচিত পড়া' : 'curated reads for this week'}
          </p>
        )}
      </div>
      <span className="edu-banner__badge">
        <Star className="edu-banner__badge-icon" />
        {locale === 'bn' ? 'নির্বাচিত' : 'Curated'}
      </span>
    </div>
  )
}

function ChipRow({ options, value, onChange }) {
  return (
    <div className="edu-chip-row" role="tablist" aria-label="filter">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          role="tab"
          aria-selected={value === opt.id}
          className={'edu-chip-btn' + (value === opt.id ? ' active' : '')}
          onClick={() => onChange(opt.id)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function FaqItem({ item, isOpen, onToggle, trimester, recKey, locale }) {
  return (
    <div className={`edu-accordion-item ${isOpen ? 'open' : ''}`}>
      <button
        type="button"
        className="edu-accordion-trigger"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="edu-accordion-title" style={{ flex: 1, minWidth: 0, lineHeight: 1.4 }}>{loc(item, 'q', locale)}</span>
        <span className="edu-accordion-meta" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {recKey && (
            <span className="edu-tag-rec" title={locale === 'bn' ? 'প্রস্তাবিত' : 'Recommended'}>
              <Star />
            </span>
          )}
          {trimester && (
            <span className="edu-tag-trimester">
              {locale === 'bn'
                ? trimester === 'first'
                  ? '১ম ত্রৈমাসিক'
                  : trimester === 'second'
                    ? '২য় ত্রৈমাসিক'
                    : '৩য় ত্রৈমাসিক'
                : trimester}
            </span>
          )}
          <ChevronDown className="edu-accordion-chevron" />
        </span>
      </button>
      {isOpen && (
        <div className="edu-accordion-content" role="region">
          <p>{loc(item, 'a', locale)}</p>
        </div>
      )}
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
        <div className="edu-faq-grid animate-fade-in">
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
  
  const fields = []
  if (article.definition) fields.push({ label: $('EDU_LIB_ARTICLE_DEF', locale), value: loc(article, 'definition', locale) })
  if (article.symptoms) fields.push({ label: $('EDU_LIB_ARTICLE_SYMPTOMS', locale), value: loc(article, 'symptoms', locale) })
  if (article.risk_factors) fields.push({ label: $('EDU_LIB_ARTICLE_RISK_FACTORS', locale), value: loc(article, 'risk_factors', locale) })
  if (article.prevention) fields.push({ label: $('EDU_LIB_ARTICLE_PREVENTION', locale), value: loc(article, 'prevention', locale) })
  if (article.seek_help) fields.push({ label: $('EDU_LIB_ARTICLE_SEEK_HELP', locale), value: loc(article, 'seek_help', locale) })
  if (article.benefits) fields.push({ label: $('EDU_LIB_ARTICLE_BENEFITS', locale), value: loc(article, 'benefits', locale) })
  if (article.precautions) fields.push({ label: $('EDU_LIB_ARTICLE_PRECAUTIONS', locale), value: loc(article, 'precautions', locale) })
  if (article.contraindications) fields.push({ label: $('EDU_LIB_ARTICLE_CONTRAINDICATIONS', locale), value: loc(article, 'contraindications', locale) })
  if (article.meaning) fields.push({ label: $('EDU_LIB_ARTICLE_MEANING', locale), value: loc(article, 'meaning', locale) })
  if (article.why_it_matters) fields.push({ label: $('EDU_LIB_ARTICLE_WHY', locale), value: loc(article, 'why_it_matters', locale) })
  if (article.normal_range) fields.push({ label: $('EDU_LIB_ARTICLE_NORMAL_RANGE', locale), value: loc(article, 'normal_range', locale) })

  if (fields.length === 0 && article.body) {
    fields.push({ label: null, value: loc(article, 'body', locale) })
  }

  const title = loc(article, article.title !== undefined ? 'title' : 'term', locale)
  return (
    <div className={`edu-accordion-item ${open ? 'open' : ''}`}>
      <button
        type="button"
        className="edu-accordion-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="edu-accordion-title" style={{ flex: 1, minWidth: 0, lineHeight: 1.4 }}>{title}</span>
        <span className="edu-accordion-meta" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {recKey && (
            <span className="edu-tag-rec" title={locale === 'bn' ? 'প্রস্তাবিত' : 'Recommended'}>
              <Star />
            </span>
          )}
          {article.trimester && (
            <span className="edu-tag-trimester">
              {locale === 'bn'
                ? article.trimester === 'first'
                  ? '১ম ত্রৈমাসিক'
                  : article.trimester === 'second'
                    ? '২য় ত্রৈমাসিক'
                    : '৩য় ত্রৈমাসিক'
                : article.trimester}
            </span>
          )}
          <ChevronDown className="edu-accordion-chevron" />
        </span>
      </button>
      {open && (
        <div className="edu-accordion-content" role="region">
          {fields.map((f, i) => (
            <p key={i}>
              {f.label && <strong>{f.label}: </strong>}
              {f.value}
            </p>
          ))}
        </div>
      )}
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
        <div key={cat.id} className="edu-lib-section animate-fade-in">
          <div className="edu-lib-section-header">
            <h3 className="edu-lib-section-title">
              {$(cat.key, locale)}
            </h3>
            <span className="edu-lib-section-count">
              {cat.articles.length} {locale === 'bn' ? 'নিবন্ধ' : 'articles'}
            </span>
          </div>
          <div className="edu-accordion-container">
            {cat.articles.map((a) => (
              <LibraryArticle
                key={a.id}
                article={a}
                locale={locale}
                recKey={trimester && a.trimester && a.trimester === trimester}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ChecklistGroup({ title, items, icon: Icon, packed, onToggle, locale }) {
  const groupTotal = items.length
  const groupPacked = items.filter((it) => packed[it.id]).length
  return (
    <div className="edu-checklist-card">
      <div className="edu-checklist-card-header">
        <div className="edu-checklist-card-title-group">
          <span className="edu-checklist-card-icon">
            <Icon />
          </span>
          <h4 className="edu-checklist-card-title">{title}</h4>
        </div>
        <span className="edu-checklist-card-count">
          {groupPacked}/{groupTotal}
        </span>
      </div>
      <div className="edu-checklist-items">
        {items.map((it) => {
          const isPacked = !!packed[it.id]
          return (
            <button
              key={it.id}
              type="button"
              className={`edu-checklist-item-btn ${isPacked ? 'packed' : ''}`}
              onClick={() => onToggle(it.id)}
            >
              <span className="edu-checklist-checkbox">
                {isPacked && <Check size={12} strokeWidth={3} />}
              </span>
              <span className="edu-checklist-item-text">{loc(it, 'label', locale)}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ChecklistSection({ locale }) {
  const [packed, setPacked] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadChecklist() {
      try {
        const data = await api.getChecklist()
        const packedMap = {}
        data.forEach(item => {
          packedMap[item.item_id] = item.is_packed
        })
        setPacked(packedMap)
      } catch (err) {
        console.error('Failed to load checklist:', err)
      } finally {
        setLoading(false)
      }
    }
    loadChecklist()
  }, [])

  const totalPacked = Object.values(packed).filter(Boolean).length
  const pct = HOSPITAL_BAG_TOTAL === 0 ? 0 : Math.round((totalPacked / HOSPITAL_BAG_TOTAL) * 100)

  async function toggle(id) {
    const newVal = !packed[id]
    // Optimistic update
    setPacked((prev) => ({ ...prev, [id]: newVal }))
    
    try {
      await api.toggleChecklistItem(id, newVal)
    } catch (err) {
      console.error('Failed to toggle checklist item:', err)
      // Rollback on error
      setPacked((prev) => ({ ...prev, [id]: !newVal }))
    }
  }

  function reset() {
    if (typeof window !== 'undefined' && window.confirm($('EDU_CHECK_RESET_CONFIRM', locale))) {
      // Resetting on the server would require a bulk update or delete endpoint. 
      // For now, we can toggle them individually or leave as is. 
      // Let's implement a simple loop for reset.
      Object.keys(packed).forEach(async (id) => {
        if (packed[id]) {
          setPacked(prev => ({ ...prev, [id]: false }))
          await api.toggleChecklistItem(id, false)
        }
      })
    }
  }

  if (loading) {
    return <p className="muted text-sm text-center">{$('EDU_LOADING', locale)}</p>
  }

  const progressText = $('EDU_CHECK_PROGRESS', locale)
    .replace('$X', String(totalPacked))
    .replace('$Y', String(HOSPITAL_BAG_TOTAL))
  const pctText = $('EDU_CHECK_PROGRESS_PCT', locale).replace('$P', String(pct))
  const isComplete = totalPacked === HOSPITAL_BAG_TOTAL && HOSPITAL_BAG_TOTAL > 0

  return (
    <div className="animate-fade-in">
      <div className="edu-progress-card">
        <div className="edu-progress-header">
          <div>
            <h3 className="edu-progress-title">
              {progressText}
              <span className="edu-progress-meta-percentage">· {pctText}</span>
            </h3>
            <p className="edu-progress-sub">
              {locale === 'bn'
                ? 'ব্যাগ গোছানোর সাথে সাথে আপনার প্রয়োজনীয় জিনিসগুলো চিহ্নিত করুন।'
                : 'Check items off as you pack your hospital bag.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {isComplete && (
              <span className="edu-banner__badge" style={{ background: 'var(--color-success-dim)', color: 'var(--color-success)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                <Check size={12} strokeWidth={3} style={{ marginRight: '4px' }} />
                {$('EDU_CHECK_DONE_BADGE', locale)}
              </span>
            )}
            <button
              type="button"
              className="edu-reset-btn"
              onClick={reset}
              disabled={totalPacked === 0}
            >
              <RotateCcw size={14} />
              {$('EDU_CHECK_RESET', locale)}
            </button>
          </div>
        </div>
        <div className="edu-progress-bar-container">
          <div className="edu-progress-bar" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="edu-checklist-grid">
        <ChecklistGroup
          title={$('EDU_LIB_GROUP_MOTHER', locale)}
          items={HOSPITAL_BAG.mother}
          icon={HeartPulse}
          packed={packed}
          onToggle={toggle}
          locale={locale}
        />
        <ChecklistGroup
          title={$('EDU_LIB_GROUP_BABY', locale)}
          items={HOSPITAL_BAG.baby}
          icon={Baby}
          packed={packed}
          onToggle={toggle}
          locale={locale}
        />
        <ChecklistGroup
          title={$('EDU_LIB_GROUP_DOCS', locale)}
          items={HOSPITAL_BAG.documents}
          icon={FileText}
          packed={packed}
          onToggle={toggle}
          locale={locale}
        />
      </div>
    </div>
  )
}

// ─── Top-level page ───

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

  const tabs = useMemo(
    () => [
      { id: 'faq', label: $('EDU_TAB_FAQ', locale), icon: Sparkles },
      { id: 'library', label: $('EDU_TAB_LIBRARY', locale), icon: BookOpen },
      { id: 'checklist', label: $('EDU_TAB_CHECKLIST', locale), icon: Briefcase },
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

            <div className="edu-tabs">
              {tabs.map((tb) => {
                const Icon = tb.icon
                const active = tab === tb.id
                return (
                  <button
                    key={tb.id}
                    type="button"
                    onClick={() => setTab(tb.id)}
                    className={`edu-tab-btn ${active ? 'active' : ''}`}
                  >
                    <Icon />
                    {tb.label}
                  </button>
                )
              })}
            </div>

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
