import { useState, useEffect, useCallback, useRef } from 'react'
import MobileLayout from '../../components/layout/MobileLayout'
import { nutritionData } from '../../data/mockData'
import { patientNavItems } from '../../data/navItems'
import $ from '../../config/strings'
import { useApp } from '../../context/AppContext'
import * as api from '../../services/api'

// ── Nutrient display config ──────────────────────────────────────────────────

const MACROS = [
  { key: 'calories_kcal', label: 'Calories / ক্যালোরি',        unit: 'kcal', decimals: 0 },
  { key: 'protein_g',     label: 'Protein / প্রোটিন',           unit: 'g',    decimals: 1 },
  { key: 'carb_g',        label: 'Carbs / কার্বোহাইড্রেট',      unit: 'g',    decimals: 0 },
  { key: 'fat_g',         label: 'Fat / চর্বি',                  unit: 'g',    decimals: 1 },
]

const MICROS = [
  { key: 'iron_mg',        label: 'Iron / আয়রন',                 unit: 'mg',   decimals: 1 },
  { key: 'calcium_mg',     label: 'Calcium / ক্যালসিয়াম',       unit: 'mg',   decimals: 0 },
  { key: 'folic_acid_mcg', label: 'Folic Acid / ফলিক এসিড',     unit: 'mcg',  decimals: 0 },
  { key: 'zinc_mg',        label: 'Zinc / জিঙ্ক',                 unit: 'mg',   decimals: 1 },
  { key: 'vitamin_d_mcg',  label: 'Vit D / ভিটামিন ডি',          unit: 'mcg',  decimals: 1 },
  { key: 'vitamin_c_mg',   label: 'Vit C / ভিটামিন সি',          unit: 'mg',   decimals: 0 },
]

const ALL_NUTRIENTS = [...MACROS, ...MICROS]

const MANUAL_FIELDS = [
  { key: 'calories_kcal',  label: 'Calories',    unit: 'kcal' },
  { key: 'protein_g',      label: 'Protein',     unit: 'g'    },
  { key: 'carb_g',         label: 'Carbs',       unit: 'g'    },
  { key: 'fat_g',          label: 'Fat',         unit: 'g'    },
  { key: 'iron_mg',        label: 'Iron',        unit: 'mg'   },
  { key: 'calcium_mg',     label: 'Calcium',     unit: 'mg'   },
  { key: 'folic_acid_mcg', label: 'Folic Acid',  unit: 'mcg'  },
  { key: 'zinc_mg',        label: 'Zinc',        unit: 'mg'   },
  { key: 'vitamin_d_mcg',  label: 'Vit D',       unit: 'mcg'  },
  { key: 'vitamin_c_mg',   label: 'Vit C',       unit: 'mg'   },
]

const EMPTY_MANUAL = {
  calories_kcal: '', protein_g: '', carb_g: '', fat_g: '',
  iron_mg: '', calcium_mg: '', folic_acid_mcg: '',
  zinc_mg: '', vitamin_d_mcg: '', vitamin_c_mg: '',
}

const MEAL_KEYS = ['breakfast', 'lunch', 'dinner', 'snack']

// food key in FCDB → nutrient key in our schema
const FOOD_NUTRIENT_MAP = {
  calories_kcal: 'energy_kcal',
  protein_g:     'protein_g',
  carb_g:        'carb_g',
  fat_g:         'fat_g',
  iron_mg:       'iron_mg',
  calcium_mg:    'calcium_mg',
  folic_acid_mcg:'folate_mcg',
  zinc_mg:       'zinc_mg',
  vitamin_d_mcg: 'vitamin_d_mcg',
  vitamin_c_mg:  'vitamin_c_mg',
}

function barColor(p) {
  if (p >= 80) return 'var(--color-success, #22c55e)'
  if (p >= 40) return 'var(--color-warning, #f59e0b)'
  return 'var(--color-danger, #ef4444)'
}

function calcPreview(food, servingUnitName, qty) {
  if (!food || !servingUnitName || !qty) return null
  const serving = food.serving_sizes?.find(s => s.unit_name === servingUnitName)
  if (!serving) return null
  const grams = qty * parseFloat(serving.grams_equivalent)
  const preview = {}
  for (const n of ALL_NUTRIENTS) {
    const foodKey = FOOD_NUTRIENT_MAP[n.key]
    preview[n.key] = Math.round(((parseFloat(food[foodKey]) || 0) / 100) * grams * 10) / 10
  }
  return preview
}

// ── Sub-components ────────────────────────────────────────────────────────────

function AlertBanner({ alert }) {
  const isDanger = alert.severity === 'danger'
  return (
    <div
      className="card"
      style={{
        background: isDanger ? 'var(--color-danger-light, #fee2e2)' : 'var(--color-warning-light, #fef3c7)',
        border: `1.5px solid ${isDanger ? 'var(--color-danger, #ef4444)' : 'var(--color-warning, #f59e0b)'}`,
      }}
    >
      <p style={{ margin: 0, fontWeight: 600, color: isDanger ? 'var(--color-danger, #ef4444)' : 'var(--color-warning, #d97706)', fontSize: '0.9rem' }}>
        {isDanger ? '🔴' : '⚠️'} {alert.message}
      </p>
      {alert.recommendations?.length > 0 && (
        <div className="pill-list" style={{ marginTop: '0.5rem' }}>
          {alert.recommendations.map((r, i) => (
            <span key={i} className="pill" style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem' }}>{r}</span>
          ))}
        </div>
      )}
    </div>
  )
}

function NutrientBar({ label, value, rda, unit, decimals }) {
  const pct = rda ? Math.min(100, Math.round((value / rda) * 100)) : 0
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.8rem' }}>
        <span style={{ fontWeight: 500 }}>{label}</span>
        <span className="muted">{value.toFixed(decimals)} / {rda ?? '?'} {unit}</span>
      </div>
      <div style={{ height: '7px', borderRadius: '4px', background: 'var(--color-border, #e5e7eb)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: barColor(pct), borderRadius: '4px', transition: 'width 0.4s ease' }} />
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Nutrition() {
  const { locale, connectivity } = useApp()
  const [activeTab, setActiveTab] = useState('today')

  // Today tab
  const [nutrition, setNutrition]         = useState(null)
  const [loadingDaily, setLoadingDaily]   = useState(false)
  const [patientId, setPatientId]         = useState(null)

  // Weekly tab
  const [weekly, setWeekly]               = useState(null)
  const [loadingWeekly, setLoadingWeekly] = useState(false)

  // Food search
  const [searchQuery, setSearchQuery]         = useState('')
  const [searchResults, setSearchResults]     = useState([])
  const [searchLoading, setSearchLoading]     = useState(false)
  const [selectedFood, setSelectedFood]       = useState(null)
  const [selectedServing, setSelectedServing] = useState('')
  const [quantity, setQuantity]               = useState(1)
  const [selectedMeal, setSelectedMeal]       = useState('breakfast')

  // Manual entry
  const [manualMode, setManualMode]           = useState(false)
  const [manualName, setManualName]           = useState('')
  const [manualNutrients, setManualNutrients] = useState(EMPTY_MANUAL)

  const [adding, setAdding]       = useState(false)

  // Guide tab
  const [selectedTag, setSelectedTag] = useState('All')

  const searchTimerRef = useRef(null)

  // ── Data loading ────────────────────────────────────────────────────────────

  const loadDaily = useCallback(async () => {
    setLoadingDaily(true)
    const [data, profile] = await Promise.all([
      api.getNutritionDaily(),
      api.getMyPatientProfile()
    ])
    setNutrition(data)
    if (profile && profile.patient) setPatientId(profile.patient.id)
    setLoadingDaily(false)
  }, [])

  const loadWeekly = useCallback(async () => {
    setLoadingWeekly(true)
    const data = await api.getNutritionWeekly()
    setWeekly(data)
    setLoadingWeekly(false)
  }, [])

  useEffect(() => {
    if (activeTab === 'today') loadDaily()
    if (activeTab === 'weekly' && !weekly) loadWeekly()
  }, [activeTab]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Food search with debounce ───────────────────────────────────────────────

  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    if (searchQuery.length < 2) {
      setSearchResults([])
      return
    }
    searchTimerRef.current = setTimeout(async () => {
      setSearchLoading(true)
      const foods = await api.searchNutritionFoods(searchQuery)
      setSearchResults(foods)
      setSearchLoading(false)
    }, 300)
    return () => clearTimeout(searchTimerRef.current)
  }, [searchQuery])

  function selectFood(food) {
    setSelectedFood(food)
    setSearchQuery(food.name_bn || food.name_en)
    setSearchResults([])
    const firstServing = food.serving_sizes?.[0]?.unit_name || 'gram'
    setSelectedServing(firstServing)
    setQuantity(1)
  }

  function clearFoodSelection() {
    setSelectedFood(null)
    setSearchQuery('')
    setSearchResults([])
    setSelectedServing('')
    setQuantity(1)
  }

  // ── Logging ─────────────────────────────────────────────────────────────────

  async function handleAddFood() {
    if (adding) return

    let payload
    if (manualMode) {
      if (!manualName.trim()) return
      payload = {
        entry_method: 'direct',
        food_name: manualName.trim(),
        meal_type: selectedMeal,
        ...Object.fromEntries(
          Object.entries(manualNutrients).map(([k, v]) => [k, parseFloat(v) || 0])
        ),
      }
    } else {
      if (!selectedFood || !selectedServing || !quantity) return
      payload = {
        entry_method: 'food_based',
        food_item_id: selectedFood.id,
        quantity: parseFloat(quantity),
        serving_unit: selectedServing,
        meal_type: selectedMeal,
      }
    }
setAdding(true)

const result = await api.logNutrition(payload)
setAdding(false)

    if (result.ok || result.entry) {
      await loadDaily()
      resetAddForm()
    }
    setAdding(false)
  }

  function resetAddForm() {
    clearFoodSelection()
    setManualName('')
    setManualNutrients(EMPTY_MANUAL)
  }

  async function handleDeleteEntry(id) {
    const result = await api.deleteNutritionEntry(id)
    if (result.ok || result.message) await loadDaily()
  }

  // ── Computed ────────────────────────────────────────────────────────────────

  const rda    = nutrition?.rda    || {}
  const totals = nutrition?.totals || {}
  const preview = !manualMode ? calcPreview(selectedFood, selectedServing, quantity) : null

  const MEAL_LABELS = {
    breakfast: $('NUT_MEAL_BREAKFAST', locale),
    lunch:     $('NUT_MEAL_LUNCH',     locale),
    dinner:    $('NUT_MEAL_DINNER',    locale),
    snack:     $('NUT_MEAL_SNACK',     locale),
  }

  // Guide tab helpers (unchanged from original)
  const tagKeys   = ['All', 'Iron Rich', 'Protein', 'Calcium', 'Vitamins']
  const tagLabels = {
    'All':       $('NUTRITION_TAG_ALL',      locale),
    'Iron Rich': $('NUTRITION_TAG_IRON',     locale),
    'Protein':   $('NUTRITION_TAG_PROTEIN',  locale),
    'Calcium':   $('NUTRITION_TAG_CALCIUM',  locale),
    'Vitamins':  $('NUTRITION_TAG_VITAMINS', locale),
  }
  const filterRecommended = (foods, tag) => {
    if (tag === 'All') return foods
    const map = {
      'Iron Rich': ['Leafy Greens (Spinach, Kale)', 'Lentils (Dal)'],
      'Protein':   ['Eggs', 'Fish (Low Mercury)', 'Lentils (Dal)'],
      'Calcium':   ['Yogurt'],
      'Vitamins':  ['Sweet Potatoes', 'Leafy Greens (Spinach, Kale)'],
    }
    return foods.filter((f) => (map[tag] || []).includes(f.name))
  }
  const filterLocal = (foods, tag) => {
    if (tag === 'All') return foods
    const map = {
      'Iron Rich': ['Spinach (Palong Shak)', 'Red Lentils (Masoor Dal)', 'Chickpeas (Chola)'],
      'Protein':   ['Red Lentils (Masoor Dal)', 'Rice + Lentils', 'Chickpeas (Chola)'],
      'Calcium':   ['Milk'],
      'Vitamins':  ['Seasonal Fruits', 'Spinach (Palong Shak)'],
    }
    return foods.filter((f) => (map[tag] || []).includes(f.name))
  }
  const recommendedFoods = filterRecommended(nutritionData.recommended, selectedTag)
  const localFoods       = filterLocal(nutritionData.local, selectedTag)

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <MobileLayout
      title={$('PAGE_TITLE_NUTRITION', locale)}
      status={connectivity}
      navItems={patientNavItems(locale)}
    >
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[
          { key: 'today',  label: locale === 'bn' ? 'আজকের খাবার' : 'Today' },
          { key: 'weekly', label: locale === 'bn' ? 'সাপ্তাহিক'   : 'Weekly' },
          { key: 'guide',  label: $('NUT_TAB_GUIDE', locale)                  },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={`chip ${activeTab === key ? 'active' : ''}`}
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── TODAY TAB ── */}
      {activeTab === 'today' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Deficiency alerts */}
          {nutrition?.alerts?.map((alert, i) => (
            <AlertBanner key={i} alert={alert} />
          ))}

          {/* Daily progress card */}
          <div className="card stagger" style={{ animationDelay: '0s' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
              <h3 className="text-gradient" style={{ margin: 0 }}>{$('NUT_DAILY_SUMMARY', locale)}</h3>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {nutrition?.trimester && (
                  <span className="pill" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', background: 'var(--color-primary-light, #ede9fe)', color: 'var(--color-primary, #7c3aed)', border: '1px solid var(--color-primary, #7c3aed)', fontWeight: 600 }}>
                    T{nutrition.trimester}
                  </span>
                )}
                {nutrition?.bmi_category && (
                  <span className="pill" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', fontWeight: 500 }}>
                    BMI: {nutrition.bmi_category}
                  </span>
                )}
              </div>
            </div>

            {loadingDaily ? (
              <p className="muted">…</p>
            ) : (
              <>
                {/* Macros */}
                <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)', margin: '0 0 0.6rem' }}>
                  {locale === 'bn' ? 'ম্যাক্রো' : 'Macros'}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.1rem' }}>
                  {MACROS.map(({ key, label, unit, decimals }) => (
                    <NutrientBar
                      key={key}
                      label={label}
                      value={parseFloat(totals[key] || 0)}
                      rda={rda[key]}
                      unit={unit}
                      decimals={decimals}
                    />
                  ))}
                </div>

                {/* Micros */}
                <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)', margin: '0 0 0.6rem' }}>
                  {locale === 'bn' ? 'মাইক্রোনিউট্রিয়েন্ট' : 'Micronutrients'}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {MICROS.map(({ key, label, unit, decimals }) => (
                    <NutrientBar
                      key={key}
                      label={label}
                      value={parseFloat(totals[key] || 0)}
                      rda={rda[key]}
                      unit={unit}
                      decimals={decimals}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Add food card */}
          <div className="card stagger" style={{ animationDelay: '0.1s', overflow: 'visible', position: 'relative', zIndex: 5 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <h3 className="text-gradient" style={{ margin: 0 }}>{$('NUT_ADD_FOOD', locale)}</h3>
              <button
                type="button"
                onClick={() => { setManualMode(m => !m); resetAddForm() }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary, #7c3aed)', fontSize: '0.78rem', textDecoration: 'underline', padding: 0 }}
              >
                {manualMode
                  ? (locale === 'bn' ? 'ডাটাবেস থেকে খুঁজুন' : 'Search database')
                  : (locale === 'bn' ? 'ম্যানুয়াল এন্ট্রি'   : 'Manual entry')}
              </button>
            </div>

            {/* Meal type selector */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {MEAL_KEYS.map(k => (
                <button key={k} type="button" className={`chip ${selectedMeal === k ? 'active' : ''}`} onClick={() => setSelectedMeal(k)}>
                  {MEAL_LABELS[k]}
                </button>
              ))}
            </div>

            {/* ── Database mode ── */}
            {!manualMode && (
              <div style={{ position: 'relative' }}>
                {/* Search input */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); if (selectedFood) clearFoodSelection() }}
                  placeholder={locale === 'bn' ? 'যেমন: ভাত, মাছ, ডাল, দুধ…' : 'e.g. ভাত, মাছ, ডাল…'}
                  style={{
                    width: '100%', padding: '0.55rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.9rem',
                    border: `1.5px solid ${selectedFood ? 'var(--color-primary, #7c3aed)' : 'var(--color-border, #e5e7eb)'}`,
                    background: 'transparent', color: 'inherit', outline: 'none', boxSizing: 'border-box',
                  }}
                />

                {/* Search results dropdown */}
                {searchResults.length > 0 && !selectedFood && (
                  <div className="search-results-dropdown">
                    {searchLoading && (
                      <div style={{ padding: '0.6rem 0.75rem', color: 'var(--color-muted)', fontSize: '0.85rem' }}>…</div>
                    )}
                    {searchResults.map((food) => (
                      <button
                        key={food.id}
                        type="button"
                        onClick={() => selectFood(food)}
                        className="search-results-dropdown-item"
                      >
                        <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{food.name_bn || food.name_en}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)', marginTop: '0.1rem' }}>
                          {food.name_en} · {food.category}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {searchLoading && searchResults.length === 0 && !selectedFood && (
                  <p className="muted" style={{ fontSize: '0.8rem', margin: '0.4rem 0 0' }}>…</p>
                )}

                {/* Selected food config */}
                {selectedFood && (
                  <div style={{ marginTop: '0.75rem', padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--color-surface-alt, rgba(0,0,0,0.03))', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{selectedFood.name_bn || selectedFood.name_en}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>{selectedFood.name_en} · {selectedFood.category}</div>
                      </div>
                      <button type="button" onClick={clearFoodSelection} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', fontSize: '1rem', padding: '0 0.25rem' }}>✕</button>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      {/* Quantity */}
                      <input
                        type="number"
                        min="0.1"
                        step="0.5"
                        value={quantity}
                        onChange={e => setQuantity(parseFloat(e.target.value) || 1)}
                        style={{
                          width: '70px', padding: '0.4rem 0.5rem', borderRadius: '0.4rem', fontSize: '0.9rem',
                          border: '1.5px solid var(--color-border)', background: 'transparent', color: 'inherit', outline: 'none',
                        }}
                      />
                      {/* Serving size */}
                      <select
                        value={selectedServing}
                        onChange={e => setSelectedServing(e.target.value)}
                        style={{
                          flex: 1, padding: '0.4rem 0.5rem', borderRadius: '0.4rem', fontSize: '0.85rem',
                          border: '1.5px solid var(--color-border)', background: 'var(--color-surface)', color: 'inherit', outline: 'none',
                        }}
                      >
                        {selectedFood.serving_sizes?.map(s => (
                          <option key={s.unit_name} value={s.unit_name}>{s.display_label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Nutrient preview */}
                    {preview && (
                      <div style={{ marginTop: '0.6rem', display: 'flex', flexWrap: 'wrap', gap: '0.3rem 0.75rem' }}>
                        {[
                          { k: 'calories_kcal', l: 'kcal', d: 0 },
                          { k: 'protein_g',     l: 'g protein', d: 1 },
                          { k: 'iron_mg',       l: 'mg iron', d: 1 },
                          { k: 'calcium_mg',    l: 'mg Ca', d: 0 },
                          { k: 'folic_acid_mcg',l: 'mcg folate', d: 0 },
                        ].map(({ k, l, d }) => (
                          <span key={k} style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                            <strong style={{ color: 'inherit' }}>{preview[k].toFixed(d)}</strong> {l}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Manual mode ── */}
            {manualMode && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                    {locale === 'bn' ? 'খাবারের নাম *' : 'Food name *'}
                  </label>
                  <input
                    type="text"
                    value={manualName}
                    onChange={e => setManualName(e.target.value)}
                    placeholder={locale === 'bn' ? 'যেমন: ডাল ভাত' : 'e.g. Daal Bhaat'}
                    style={{
                      width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.9rem',
                      border: '1.5px solid var(--color-border)', background: 'transparent', color: 'inherit',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
                <p className="muted" style={{ fontSize: '0.75rem', margin: 0 }}>
                  {locale === 'bn' ? 'পুষ্টির তথ্য (ঐচ্ছিক)' : 'Nutrient values (optional)'}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem' }}>
                  {MANUAL_FIELDS.map(({ key, label, unit }) => (
                    <div key={key}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 500, display: 'block', marginBottom: '0.2rem' }}>
                        {label} <span style={{ opacity: 0.6 }}>({unit})</span>
                      </label>
                      <input
                        type="number" min="0" step="any"
                        value={manualNutrients[key]}
                        onChange={e => setManualNutrients(prev => ({ ...prev, [key]: e.target.value }))}
                        placeholder="0"
                        style={{
                          width: '100%', padding: '0.4rem 0.5rem', borderRadius: '0.4rem', fontSize: '0.85rem',
                          border: '1.5px solid var(--color-border)', background: 'transparent',
                          color: 'inherit', outline: 'none', boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              className="btn-primary"
              style={{ width: '100%', marginTop: '0.9rem' }}
              disabled={adding || (manualMode ? !manualName.trim() : !selectedFood)}
              onClick={handleAddFood}
            >
              {adding ? '…' : $('NUT_ADD_FOOD', locale)}
            </button>
          </div>

          {/* Today's log */}
          <div className="card stagger" style={{ animationDelay: '0.2s', position: 'relative', zIndex: 1 }}>
            <h3 className="text-gradient">{$('NUT_TODAYS_LOG', locale)}</h3>
            {loadingDaily ? (
              <p className="muted" style={{ marginTop: '0.5rem' }}>…</p>
            ) : !nutrition?.entries?.length ? (
              <p className="muted" style={{ marginTop: '0.5rem' }}>{$('NUT_EMPTY_LOG', locale)}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                {[...nutrition.entries].reverse().map((entry) => (
                  <div
                    key={entry.id}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                      padding: '0.6rem 0.75rem', borderRadius: '0.5rem',
                      background: 'var(--color-surface-alt, rgba(0,0,0,0.03))',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{entry.food_name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)', marginTop: '0.2rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span className="pill" style={{ padding: '0.1rem 0.4rem', fontSize: '0.68rem' }}>
                          {MEAL_LABELS[entry.meal_type]}
                        </span>
                        <span>{new Date(entry.logged_at).toLocaleTimeString(locale === 'bn' ? 'bn-BD' : 'en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>{parseFloat(entry.calories_kcal || 0).toFixed(0)} kcal</span>
                        {entry.entry_method === 'food_based' && entry.quantity && entry.serving_unit && (
                          <span style={{ opacity: 0.7 }}>{entry.quantity} {entry.serving_unit}</span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteEntry(entry.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger, #ef4444)', fontSize: '0.8rem', padding: '0.25rem 0.5rem', flexShrink: 0 }}
                    >
                      {$('NUT_UNDO', locale)}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── WEEKLY TAB ── */}
      {activeTab === 'weekly' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {loadingWeekly ? (
            <div className="card"><p className="muted">…</p></div>
          ) : !weekly ? (
            <div className="card"><p className="muted">{locale === 'bn' ? 'তথ্য পাওয়া যায়নি' : 'No data available'}</p></div>
          ) : (
            <>
              {/* Period header */}
              <div className="card stagger" style={{ animationDelay: '0s' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <h3 className="text-gradient" style={{ margin: 0 }}>
                    {locale === 'bn' ? 'সাপ্তাহিক রিপোর্ট' : 'Weekly Report'}
                  </h3>
                  <span className="pill" style={{ fontSize: '0.7rem' }}>
                    {weekly.period?.from} → {weekly.period?.to}
                  </span>
                </div>
                <p className="muted" style={{ fontSize: '0.78rem', marginTop: '0.3rem' }}>
                  {weekly.period?.days_tracked} / 7 {locale === 'bn' ? 'দিন ট্র্যাক করা হয়েছে' : 'days tracked'}
                </p>
              </div>

              {/* Weekly averages */}
              <div className="card stagger" style={{ animationDelay: '0.08s' }}>
                <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem' }}>
                  {locale === 'bn' ? '৭ দিনের গড়' : '7-Day Averages'}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {[...MACROS, ...MICROS].map(({ key, label, unit, decimals }) => {
                    const avg = weekly.averages?.[key] || 0
                    const pct = weekly.avg_percentages?.[key] || 0
                    return (
                      <div key={key}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.78rem' }}>
                          <span style={{ fontWeight: 500 }}>{label}</span>
                          <span className="muted">{avg.toFixed(decimals)} {unit} · <strong style={{ color: barColor(pct) }}>{pct}%</strong></span>
                        </div>
                        <div style={{ height: '6px', borderRadius: '3px', background: 'var(--color-border)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${Math.min(100, pct)}%`, background: barColor(pct), borderRadius: '3px' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 7-day table */}
              <div className="card stagger" style={{ animationDelay: '0.16s', overflowX: 'auto' }}>
                <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem' }}>
                  {locale === 'bn' ? 'দৈনিক বিবরণ' : 'Daily Breakdown'}
                </h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <th style={{ textAlign: 'left', padding: '0.3rem 0.4rem', fontWeight: 600 }}>{locale === 'bn' ? 'তারিখ' : 'Date'}</th>
                      {[
                        { key: 'calories_kcal', short: 'Cal%' },
                        { key: 'protein_g',     short: 'Pro%' },
                        { key: 'iron_mg',        short: 'Fe%'  },
                        { key: 'calcium_mg',     short: 'Ca%'  },
                        { key: 'folic_acid_mcg', short: 'Fol%' },
                      ].map(({ key, short }) => (
                        <th key={key} style={{ textAlign: 'center', padding: '0.3rem 0.4rem', fontWeight: 600 }}>{short}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {weekly.daily_breakdown?.map((day) => {
                      const label = new Date(day.date + 'T00:00:00').toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-GB', { month: 'short', day: 'numeric' })
                      return (
                        <tr key={day.date} style={{ borderBottom: '1px solid var(--color-border)' }}>
                          <td style={{ padding: '0.35rem 0.4rem', fontWeight: 500 }}>{label}</td>
                          {[
                            'calories_kcal', 'protein_g', 'iron_mg', 'calcium_mg', 'folic_acid_mcg'
                          ].map(key => {
                            const p = day.percentages?.[key] || 0
                            const bg = p >= 90 ? '#dcfce7' : p >= 70 ? '#fef9c3' : '#fee2e2'
                            const col = p >= 90 ? '#15803d' : p >= 70 ? '#92400e' : '#991b1b'
                            return (
                              <td key={key} style={{ textAlign: 'center', padding: '0.35rem 0.4rem' }}>
                                <span style={{ background: bg, color: col, padding: '0.1rem 0.35rem', borderRadius: '0.25rem', fontSize: '0.72rem', fontWeight: 600 }}>
                                  {p}%
                                </span>
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Strengths */}
              {weekly.strengths?.length > 0 && (
                <div className="card stagger" style={{ animationDelay: '0.24s' }}>
                  <h4 style={{ margin: '0 0 0.6rem', fontSize: '0.9rem', color: 'var(--color-success, #16a34a)' }}>
                    {locale === 'bn' ? '✅ পুষ্টির শক্তি' : '✅ Nutritional Strengths'}
                  </h4>
                  <div className="pill-list">
                    {weekly.strengths.map(s => (
                      <span key={s} className="pill good" style={{ fontSize: '0.78rem' }}>{s.replace('_', ' ')}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Deficiencies + recommendations */}
              {weekly.deficiencies?.length > 0 && (
                <div className="card stagger" style={{ animationDelay: '0.32s', borderLeft: '3px solid var(--color-danger, #ef4444)' }}>
                  <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: 'var(--color-danger, #dc2626)' }}>
                    {locale === 'bn' ? '⚠️ ঘাটতি' : '⚠️ Deficiencies'}
                  </h4>
                  {weekly.deficiencies.map(def => {
                    const rec = weekly.recommendations?.[def]
                    return (
                      <div key={def} style={{ marginBottom: '0.75rem' }}>
                        <p style={{ margin: '0 0 0.35rem', fontWeight: 600, fontSize: '0.85rem', textTransform: 'capitalize' }}>
                          {def.replace('_', ' ')}
                        </p>
                        {rec?.foods?.length > 0 && (
                          <div className="pill-list">
                            {rec.foods.map((f, i) => (
                              <span key={i} className="pill" style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}>{f}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── GUIDE TAB ── */}
      {activeTab === 'guide' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="chip-row" style={{ marginBottom: '1.5rem', overflowX: 'auto', whiteSpace: 'nowrap' }}>
            {tagKeys.map((tagKey) => (
              <button type="button" key={tagKey} className={`chip ${selectedTag === tagKey ? 'active' : ''}`} onClick={() => setSelectedTag(tagKey)}>
                {tagLabels[tagKey]}
              </button>
            ))}
          </div>

          <div className="card stagger" style={{ animationDelay: '0s' }}>
            <h3 className="text-gradient">{$('NUTRITION_SECTION_RECOMMENDED', locale)}</h3>
            <p className="muted">{$('NUTRITION_SECTION_RECOMMENDED_DESC', locale)}</p>
            {recommendedFoods.length === 0 ? (
              <p className="muted" style={{ marginTop: '1rem' }}>{$('NUTRITION_EMPTY_RECOMMENDED', locale)}</p>
            ) : (
              <div className="pill-list" style={{ marginTop: '1rem' }}>
                {recommendedFoods.map((food) => (
                  <span key={food.name} className="pill good" title={locale === 'bn' ? (food.benefitBn || food.benefit) : food.benefit}>
                    {food.icon} {locale === 'bn' ? (food.nameBn || food.name) : food.name} <span style={{ opacity: 0.7, fontSize: '0.8rem' }}>({locale === 'bn' ? (food.benefitBn || food.benefit) : food.benefit})</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="card stagger" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-gradient">{$('NUTRITION_SECTION_AVOID', locale)}</h3>
            <p className="muted">{$('NUTRITION_SECTION_AVOID_DESC', locale)}</p>
            <div className="pill-list" style={{ marginTop: '1rem' }}>
              {nutritionData.avoid.map((food) => (
                <span key={food.name} className="pill warning" title={locale === 'bn' ? (food.reasonBn || food.reason) : food.reason}>
                  {food.icon} {locale === 'bn' ? (food.nameBn || food.name) : food.name} <span style={{ opacity: 0.7, fontSize: '0.8rem' }}>({locale === 'bn' ? (food.reasonBn || food.reason) : food.reason})</span>
                </span>
              ))}
            </div>
          </div>

          <div className="card stagger" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-gradient">{$('NUTRITION_SECTION_LOCAL', locale)}</h3>
            <p className="muted">{$('NUTRITION_SECTION_LOCAL_DESC', locale)}</p>
            {localFoods.length === 0 ? (
              <p className="muted" style={{ marginTop: '1rem' }}>{$('NUTRITION_EMPTY_LOCAL', locale)}</p>
            ) : (
              <div className="pill-list" style={{ marginTop: '1rem' }}>
                {localFoods.map((food) => (
                  <span key={food.name} className="pill" title={locale === 'bn' ? (food.tagBn || food.tag) : food.tag}>
                    {food.icon} {locale === 'bn' ? (food.nameBn || food.name) : food.name} <span style={{ opacity: 0.7, fontSize: '0.8rem' }}>({locale === 'bn' ? (food.tagBn || food.tag) : food.tag})</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </MobileLayout>
  )
}
