import { useState, useEffect, useCallback, useRef } from 'react'
import MobileLayout from '../../components/layout/MobileLayout'
import { nutritionData } from '../../data/mockData'
import { patientNavItems } from '../../data/navItems'
import $ from '../../config/strings'
import { useApp } from '../../context/AppContext'
import * as api from '../../services/api'
import './Nutrition.css'
import { 
  Flame, Sparkles, Apple, Droplet, Activity, Shield, Layers, Sun, Citrus, 
  Plus, Search, AlertTriangle, Check, CheckCircle2, Info, BookOpen, Utensils,
  Leaf, Sprout, Egg, Fish, GlassWater, Beef
} from 'lucide-react'

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

const NUTRIENT_ICONS = {
  calories_kcal: { icon: Flame, className: 'calories' },
  protein_g:     { icon: Sparkles, className: 'protein' },
  carb_g:        { icon: Apple, className: 'carb' },
  fat_g:         { icon: Droplet, className: 'fat' },
  iron_mg:       { icon: Activity, className: 'iron' },
  calcium_mg:    { icon: Shield, className: 'calcium' },
  folic_acid_mcg:{ icon: Layers, className: 'folic' },
  zinc_mg:       { icon: Sparkles, className: 'zinc' },
  vitamin_d_mcg: { icon: Sun, className: 'vitd' },
  vitamin_c_mg:  { icon: Citrus, className: 'vitc' },
}

const GUIDE_ICONS = {
  leaf: Leaf,
  sprout: Sprout,
  egg: Egg,
  fish: Fish,
  apple: Apple,
  milk: GlassWater,
  chicken: Beef,
  sparkles: Sparkles,
  citrus: Citrus,
  warning: AlertTriangle,
  local: Utensils
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
  const bg = isDanger ? 'var(--color-danger-dim, rgba(239, 68, 68, 0.08))' : 'var(--color-warning-dim, rgba(245, 158, 11, 0.08))'
  const borderCol = isDanger ? 'var(--color-danger)' : 'var(--color-warning)'
  const textCol = isDanger ? 'var(--color-danger-light)' : 'var(--color-warning)'

  return (
    <div className="nut-alert" style={{ background: bg, borderColor: borderCol }}>
      <div className="nut-alert-icon">
        {isDanger ? <AlertTriangle style={{ color: 'var(--color-danger)' }} /> : <Info style={{ color: 'var(--color-warning)' }} />}
      </div>
      <div className="nut-alert-content">
        <p className="nut-alert-message" style={{ color: textCol }}>{alert.message}</p>
        {alert.recommendations?.length > 0 && (
          <div className="nut-alert-rec-list">
            {alert.recommendations.map((r, i) => (
              <span key={i} className="nut-alert-pill">{r}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function CircularProgress({ percentage, size = 80, strokeWidth = 8, color = 'var(--color-primary)' }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle
        stroke="var(--color-border)"
        fill="transparent"
        strokeWidth={strokeWidth}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        stroke={color}
        fill="transparent"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        r={radius}
        cx={size / 2}
        cy={size / 2}
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
    </svg>
  )
}

function NutrientStatCard({ label, value, rda, unit, decimals, icon: IconComponent, iconClass, locale }) {
  const pct = rda ? Math.min(100, Math.round((value / rda) * 100)) : 0
  const fillCol = barColor(pct)

  return (
    <div className="nut-stat-card">
      <div className="nut-stat-header">
        <div className="nut-stat-info">
          <span className="nut-stat-label">{label}</span>
          <span className="nut-stat-val">
            {value.toFixed(decimals)}{' '}
            <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-muted)' }}>{unit}</span>
          </span>
        </div>
      </div>
      <div className="nut-bar-container">
        <div className="nut-bar-track">
          <div className="nut-bar-fill" style={{ width: `${pct}%`, backgroundColor: fillCol }} />
        </div>
        <div className="nut-bar-footer">
          <span>{pct}%</span>
          <span>
            {locale === 'bn' ? 'লক্ষ্য:' : 'Goal:'}{' '}
            <strong>
              {rda ?? '?'}{' '}
              <span style={{ fontSize: '0.7rem', fontWeight: 500, textTransform: 'none' }}>{unit}</span>
            </strong>
          </span>
        </div>
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

  // Calorie calculations
  const totalCalories = parseFloat(totals.calories_kcal || 0)
  const targetCalories = rda.calories_kcal || 2200
  const calPercent = Math.min(100, Math.round((totalCalories / targetCalories) * 100))

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <MobileLayout
      title={$('PAGE_TITLE_NUTRITION', locale)}
      status={connectivity}
      navItems={patientNavItems(locale)}
    >
      <div className="nut-container animate-fade-in">
        
        {/* Premium Hero Banner */}
        <div className="nut-hero">
          <div className="nut-hero-content">
            <div className="nut-hero-tag">NUTRITION • {locale === 'bn' ? 'আজ' : 'TODAY'}</div>
            <h2 className="nut-hero-title">
              {locale === 'bn' ? <>ভালো খান, <em>দুজনের যত্ন নিন।</em></> : <>Eat well, <em>nourish two.</em></>}
            </h2>
            <p className="nut-hero-desc">
              {locale === 'bn' ? 'গর্ভাবস্থার জন্য উপযুক্ত ম্যাক্রো, মাইক্রো এবং পুষ্টিকর খাবার ট্র্যাক করুন।' : 'Track macros, micros and meals tuned for pregnancy.'}
            </p>
          </div>
          <div className="nut-hero-icon-wrapper">
            <Apple style={{ width: '2.5rem', height: '2.5rem' }} />
          </div>
        </div>

        {/* Tab switcher */}
        <div className="nut-tab-bar">
          {[
            { key: 'today',  label: locale === 'bn' ? 'আজকের খাবার' : 'Today' },
            { key: 'weekly', label: locale === 'bn' ? 'সাপ্তাহিক'   : 'Weekly' },
            { key: 'guide',  label: $('NUT_TAB_GUIDE', locale)                  },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className={`nut-tab-button ${activeTab === key ? 'active' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── TODAY TAB ── */}
        {activeTab === 'today' && (
          <div className="nut-today-grid">
            
            {/* Left Column: Intake Dashboard */}
            <div className="nut-nutrients-section">
              {/* Deficiency alerts */}
              {nutrition?.alerts?.map((alert, i) => (
                <AlertBanner key={i} alert={alert} />
              ))}

              <div className="nut-section-card">
                <div className="nut-section-header">
                  <div className="nut-section-title-wrapper">
                    <Activity />
                    <h3 className="nut-section-title">{$('NUT_DAILY_SUMMARY', locale)}</h3>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {nutrition?.trimester && (
                      <span className="pill" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', background: 'var(--color-primary-dim)', color: 'var(--color-primary)', border: '1px solid var(--color-primary-glow)', fontWeight: 700 }}>
                        Trimester {nutrition.trimester}
                      </span>
                    )}
                    {nutrition?.bmi_category && (
                      <span className="pill" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', fontWeight: 600, background: 'var(--color-surface-active)', border: '1px solid var(--color-border)' }}>
                        BMI: {nutrition.bmi_category}
                      </span>
                    )}
                  </div>
                </div>

                {loadingDaily ? (
                  <p className="muted animate-pulse" style={{ textAlign: 'center', padding: '2rem 0' }}>…</p>
                ) : (
                  <>
                    {/* Calories Ring widget */}
                    <div className="nut-cal-hero">
                      <div className="nut-cal-details">
                        <div className="nut-cal-title-group">
                          <Flame />
                          <span className="nut-cal-label">{locale === 'bn' ? 'আজকের ক্যালোরি' : 'Today\'s Calories'}</span>
                        </div>
                        <div className="nut-cal-number">
                          {totalCalories.toFixed(0)}{' '}
                          <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-muted)' }}>kcal</span>
                        </div>
                        <div className="nut-cal-target">
                          {locale === 'bn' ? 'লক্ষ্য:' : 'Goal:'} <strong>{targetCalories} kcal</strong>
                        </div>
                      </div>
                      <div className="nut-circle-container">
                        <CircularProgress percentage={calPercent} color="var(--color-primary)" />
                        <span className="nut-circle-percent">{calPercent}%</span>
                      </div>
                    </div>

                    {/* Macros breakdown */}
                    <h4 className="nut-section-subtitle">{locale === 'bn' ? 'ম্যাক্রোনিউট্রিয়েন্ট' : 'Macros'}</h4>
                    <div className="nut-macro-grid">
                      {MACROS.filter(m => m.key !== 'calories_kcal').map(({ key, label, unit, decimals }) => {
                        const item = NUTRIENT_ICONS[key] || { icon: Info, className: '' }
                        return (
                          <NutrientStatCard
                            key={key}
                            label={locale === 'bn' ? label.split('/')[1]?.trim() || label : label.split('/')[0]?.trim() || label}
                            value={parseFloat(totals[key] || 0)}
                            rda={rda[key]}
                            unit={unit}
                            decimals={decimals}
                            icon={item.icon}
                            iconClass={item.className}
                            locale={locale}
                          />
                        )
                      })}
                    </div>

                    {/* Micronutrients breakdown */}
                    <h4 className="nut-section-subtitle">{locale === 'bn' ? 'মাইক্রোনিউট্রিয়েন্ট' : 'Micronutrients'}</h4>
                    <div className="nut-micro-grid">
                      {MICROS.map(({ key, label, unit, decimals }) => {
                        const item = NUTRIENT_ICONS[key] || { icon: Info, className: '' }
                        return (
                          <NutrientStatCard
                            key={key}
                            label={locale === 'bn' ? label.split('/')[1]?.trim() || label : label.split('/')[0]?.trim() || label}
                            value={parseFloat(totals[key] || 0)}
                            rda={rda[key]}
                            unit={unit}
                            decimals={decimals}
                            icon={item.icon}
                            iconClass={item.className}
                            locale={locale}
                          />
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right Column: Add Food and Log */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Add Food card */}
              <div className="nut-section-card">
                <div className="nut-section-header">
                  <div className="nut-section-title-wrapper">
                    <Plus />
                    <h3 className="nut-section-title">{$('NUT_ADD_FOOD', locale)}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setManualMode(m => !m); resetAddForm() }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'underline', padding: 0 }}
                  >
                    {manualMode
                      ? (locale === 'bn' ? 'ডাটাবেস থেকে খুঁজুন' : 'Search database')
                      : (locale === 'bn' ? 'ম্যানুয়াল এন্ট্রি'   : 'Manual entry')}
                  </button>
                </div>

                {/* Meal selector */}
                <div className="nut-segmented-wrapper">
                  {MEAL_KEYS.map(k => (
                    <button
                      key={k}
                      type="button"
                      className={`nut-segmented-item ${selectedMeal === k ? 'active' : ''}`}
                      onClick={() => setSelectedMeal(k)}
                    >
                      {MEAL_LABELS[k]}
                    </button>
                  ))}
                </div>

                {/* DB Mode Search */}
                {!manualMode && (
                  <div className="nut-search-container">
                    <div className="nut-search-input-wrapper">
                      <Search />
                      <input
                        type="text"
                        className="nut-search-input"
                        value={searchQuery}
                        onChange={e => { setSearchQuery(e.target.value); if (selectedFood) clearFoodSelection() }}
                        placeholder={locale === 'bn' ? 'যেমন: ভাত, মাছ, ডাল, দুধ…' : 'e.g. rice, fish, dal…'}
                      />
                    </div>

                    {/* Results dropdown */}
                    {searchResults.length > 0 && !selectedFood && (
                      <div className="nut-dropdown">
                        {searchResults.map((food) => (
                          <button
                            key={food.id}
                            type="button"
                            onClick={() => selectFood(food)}
                            className="nut-dropdown-item"
                          >
                            <span className="nut-dropdown-item-title">{food.name_bn || food.name_en}</span>
                            <span className="nut-dropdown-item-sub">{food.name_en} · {food.category}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Quantity spinner and impact preview */}
                    {selectedFood && (
                      <div className="nut-selection-card">
                        <div className="nut-selection-header">
                          <div>
                            <div className="nut-selection-title">{selectedFood.name_bn || selectedFood.name_en}</div>
                            <div className="nut-selection-subtitle">{selectedFood.name_en} · {selectedFood.category}</div>
                          </div>
                          <button type="button" className="nut-btn-close" onClick={clearFoodSelection}>✕</button>
                        </div>

                        <div className="nut-qty-row">
                          <input
                            type="number"
                            min="0.1"
                            step="0.5"
                            className="nut-qty-input"
                            value={quantity}
                            onChange={e => setQuantity(parseFloat(e.target.value) || 1)}
                          />
                          <select
                            className="nut-select-input"
                            value={selectedServing}
                            onChange={e => setSelectedServing(e.target.value)}
                          >
                            {selectedFood.serving_sizes?.map(s => (
                              <option key={s.unit_name} value={s.unit_name}>{s.display_label}</option>
                            ))}
                          </select>
                        </div>

                        {preview && (
                          <div className="nut-impact-grid">
                            {[
                              { k: 'calories_kcal', l: 'kcal', d: 0 },
                              { k: 'protein_g',     l: 'g prot', d: 1 },
                              { k: 'iron_mg',       l: 'mg iron', d: 1 },
                              { k: 'calcium_mg',    l: 'mg Ca', d: 0 },
                              { k: 'folic_acid_mcg',l: 'mcg fol', d: 0 },
                            ].map(({ k, l, d }) => (
                              <div key={k} className="nut-impact-item">
                                <strong>{preview[k].toFixed(d)}</strong> {l}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Manual entry Mode */}
                {manualMode && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div className="nut-field-group">
                      <label className="nut-field-label">{locale === 'bn' ? 'খাবারের নাম *' : 'Food name *'}</label>
                      <input
                        type="text"
                        className="nut-text-input"
                        value={manualName}
                        onChange={e => setManualName(e.target.value)}
                        placeholder={locale === 'bn' ? 'যেমন: ডাল ভাত' : 'e.g. Daal Bhaat'}
                      />
                    </div>

                    <div className="nut-manual-grid">
                      {MANUAL_FIELDS.map(({ key, label, unit }) => (
                        <div className="nut-field-group" key={key}>
                          <label className="nut-field-label" style={{ fontSize: '0.75rem' }}>
                            {label} <span style={{ opacity: 0.65 }}>({unit})</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            className="nut-text-input"
                            value={manualNutrients[key]}
                            onChange={e => setManualNutrients(prev => ({ ...prev, [key]: e.target.value }))}
                            placeholder="0"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  className="nut-btn-submit"
                  style={{ marginTop: '1.25rem' }}
                  disabled={adding || (manualMode ? !manualName.trim() : !selectedFood)}
                  onClick={handleAddFood}
                >
                  {adding ? '…' : (
                    <>
                      <Plus style={{ width: '1.15rem', height: '1.15rem' }} />
                      {$('NUT_ADD_FOOD', locale)}
                    </>
                  )}
                </button>
              </div>

              {/* Log Timeline card */}
              <div className="nut-section-card">
                <div className="nut-section-header" style={{ marginBottom: '1rem' }}>
                  <div className="nut-section-title-wrapper">
                    <Utensils />
                    <h3 className="nut-section-title">{$('NUT_TODAYS_LOG', locale)}</h3>
                  </div>
                </div>

                {loadingDaily ? (
                  <p className="muted animate-pulse" style={{ textAlign: 'center', padding: '1.5rem 0' }}>…</p>
                ) : !nutrition?.entries?.length ? (
                  <p className="muted" style={{ textAlign: 'center', padding: '1.5rem 0' }}>{$('NUT_EMPTY_LOG', locale)}</p>
                ) : (
                  <div className="nut-log-timeline">
                    {[...nutrition.entries].reverse().map((entry) => (
                      <div key={entry.id} className="nut-log-row">
                        <div className="nut-log-left">
                          <div className="nut-log-meal-icon">
                            <Utensils />
                          </div>
                          <div className="nut-log-info">
                            <div className="nut-log-name">{entry.food_name}</div>
                            <div className="nut-log-badges">
                              <span className="nut-log-badge meal">{MEAL_LABELS[entry.meal_type]}</span>
                              <span className="nut-log-badge">{parseFloat(entry.calories_kcal || 0).toFixed(0)} kcal</span>
                              {entry.entry_method === 'food_based' && entry.quantity && entry.serving_unit && (
                                <span className="nut-log-badge">{entry.quantity} {entry.serving_unit}</span>
                              )}
                              <span className="nut-log-time">
                                {new Date(entry.logged_at).toLocaleTimeString(locale === 'bn' ? 'bn-BD' : 'en-GB', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="nut-btn-delete"
                          onClick={() => handleDeleteEntry(entry.id)}
                        >
                          {$('NUT_UNDO', locale)}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── WEEKLY TAB ── */}
        {activeTab === 'weekly' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {loadingWeekly ? (
              <div className="nut-section-card"><p className="muted animate-pulse" style={{ textAlign: 'center', padding: '2rem 0' }}>…</p></div>
            ) : !weekly ? (
              <div className="nut-section-card"><p className="muted" style={{ textAlign: 'center', padding: '2rem 0' }}>{locale === 'bn' ? 'তথ্য পাওয়া যায়নি' : 'No data available'}</p></div>
            ) : (
              <>
                {/* Period meta card */}
                <div className="nut-section-card">
                  <div className="nut-weekly-meta-row">
                    <div>
                      <h3 className="nut-section-title">{locale === 'bn' ? 'সাপ্তাহিক রিপোর্ট' : 'Weekly Report'}</h3>
                      <p className="muted" style={{ marginTop: '0.25rem' }}>
                        {weekly.period?.days_tracked} / 7 {locale === 'bn' ? 'দিন ট্র্যাক করা হয়েছে' : 'days tracked'}
                      </p>
                    </div>
                    <span className="nut-period-badge">
                      {weekly.period?.from} → {weekly.period?.to}
                    </span>
                  </div>
                </div>

                {/* 7-day Averages card */}
                <div className="nut-section-card">
                  <div className="nut-section-header">
                    <div className="nut-section-title-wrapper">
                      <Activity />
                      <h3 className="nut-section-title">{locale === 'bn' ? '৭ দিনের গড়' : '7-Day Averages'}</h3>
                    </div>
                  </div>
                  
                  <div className="nut-micro-grid">
                    {[...MACROS, ...MICROS].map(({ key, label, unit, decimals }) => {
                      const avg = weekly.averages?.[key] || 0
                      const pct = weekly.avg_percentages?.[key] || 0
                      const item = NUTRIENT_ICONS[key] || { icon: Info, className: '' }
                      return (
                        <NutrientStatCard
                          key={key}
                          label={locale === 'bn' ? label.split('/')[1]?.trim() || label : label.split('/')[0]?.trim() || label}
                          value={avg}
                          rda={rda[key]}
                          unit={unit}
                          decimals={decimals}
                          icon={item.icon}
                          iconClass={item.className}
                          locale={locale}
                        />
                      )
                    })}
                  </div>
                </div>

                {/* Breakdown table card */}
                <div className="nut-section-card nut-table-card">
                  <div className="nut-section-header">
                    <div className="nut-section-title-wrapper">
                      <Utensils />
                      <h3 className="nut-section-title">{locale === 'bn' ? 'দৈনিক বিবরণ' : 'Daily Breakdown'}</h3>
                    </div>
                  </div>
                  <table className="nut-table">
                    <thead>
                      <tr>
                        <th>{locale === 'bn' ? 'তারিখ' : 'Date'}</th>
                        {[
                          { key: 'calories_kcal', short: 'Cal%' },
                          { key: 'protein_g',     short: 'Pro%' },
                          { key: 'iron_mg',        short: 'Fe%'  },
                          { key: 'calcium_mg',     short: 'Ca%'  },
                          { key: 'folic_acid_mcg', short: 'Fol%' },
                        ].map(({ key, short }) => (
                          <th key={key} style={{ textAlign: 'center' }}>{short}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {weekly.daily_breakdown?.map((day) => {
                        const label = new Date(day.date + 'T00:00:00').toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-GB', { month: 'short', day: 'numeric' })
                        return (
                          <tr key={day.date}>
                            <td style={{ fontWeight: 600 }}>{label}</td>
                            {[
                              'calories_kcal', 'protein_g', 'iron_mg', 'calcium_mg', 'folic_acid_mcg'
                            ].map(key => {
                              const p = day.percentages?.[key] || 0
                              const bg = p >= 90 ? 'var(--color-success-dim, #dcfce7)' : p >= 70 ? 'var(--color-warning-dim, #fef9c3)' : 'var(--color-danger-dim, #fee2e2)'
                              const col = p >= 90 ? 'var(--color-success, #15803d)' : p >= 70 ? 'var(--color-warning, #92400e)' : 'var(--color-danger-light, #991b1b)'
                              return (
                                <td key={key} style={{ textAlign: 'center' }}>
                                  <span className="nut-table-badge" style={{ background: bg, color: col }}>
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

                {/* Strengths & Deficiencies */}
                <div className="nut-status-grid">
                  {/* Strengths */}
                  {weekly.strengths?.length > 0 && (
                    <div className="nut-section-card">
                      <div className="nut-section-header">
                        <div className="nut-section-title-wrapper">
                          <CheckCircle2 style={{ color: 'var(--color-success)' }} />
                          <h3 className="nut-section-title" style={{ color: 'var(--color-success)' }}>
                            {locale === 'bn' ? '✅ পুষ্টির শক্তি' : '✅ Nutritional Strengths'}
                          </h3>
                        </div>
                      </div>
                      <div className="nut-pill-list">
                        {weekly.strengths.map(s => (
                          <span key={s} className="nut-pill-item good">
                            <Check style={{ width: '1.15rem', height: '1.15rem' }} />
                            {s.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Deficiencies */}
                  {weekly.deficiencies?.length > 0 && (
                    <div className="nut-section-card" style={{ borderLeft: '4px solid var(--color-danger)' }}>
                      <div className="nut-section-header">
                        <div className="nut-section-title-wrapper">
                          <AlertTriangle style={{ color: 'var(--color-danger)' }} />
                          <h3 className="nut-section-title" style={{ color: 'var(--color-danger)' }}>
                            {locale === 'bn' ? '⚠️ ঘাটতি' : '⚠️ Deficiencies'}
                          </h3>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                        {weekly.deficiencies.map(def => {
                          const rec = weekly.recommendations?.[def]
                          return (
                            <div key={def} className="nut-def-item">
                              <div className="nut-def-header">
                                <AlertTriangle />
                                {def.replace('_', ' ')}
                              </div>
                              {rec?.foods?.length > 0 && (
                                <div className="nut-carousel">
                                  {rec.foods.map((f, i) => (
                                    <span key={i} className="nut-carousel-card">{f}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── GUIDE TAB ── */}
        {activeTab === 'guide' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Category selection */}
            <div className="nut-segmented-wrapper">
              {tagKeys.map((tagKey) => (
                <button
                  type="button"
                  key={tagKey}
                  className={`nut-segmented-item ${selectedTag === tagKey ? 'active' : ''}`}
                  onClick={() => setSelectedTag(tagKey)}
                >
                  {tagLabels[tagKey]}
                </button>
              ))}
            </div>

            {/* Recommended items grid */}
            <div className="nut-section-card">
              <div className="nut-section-header">
                <div className="nut-section-title-wrapper">
                  <div className="nut-header-circle success">
                    <CheckCircle2 />
                  </div>
                  <div>
                    <h3 className="nut-section-title">{$('NUTRITION_SECTION_RECOMMENDED', locale)}</h3>
                    <p className="muted" style={{ fontSize: '0.85rem', marginTop: '0.15rem' }}>{$('NUTRITION_SECTION_RECOMMENDED_DESC', locale)}</p>
                  </div>
                </div>
              </div>

              {recommendedFoods.length === 0 ? (
                <p className="muted" style={{ textAlign: 'center', padding: '1.5rem 0' }}>{$('NUTRITION_EMPTY_RECOMMENDED', locale)}</p>
              ) : (
                <div className="nut-guide-grid">
                  {recommendedFoods.map((food) => {
                    const IconComponent = GUIDE_ICONS[food.icon] || Utensils;
                    return (
                      <div key={food.name} className="nut-guide-card good">
                        <div className="nut-guide-card-top">
                          <div className="nut-guide-icon-box">
                            <IconComponent />
                          </div>
                          <div className="nut-guide-card-header-info">
                            <div className="nut-guide-name">{locale === 'bn' ? (food.nameBn || food.name) : food.name}</div>
                            <span className="nut-guide-badge success">{locale === 'bn' ? 'প্রস্তাবিত' : 'RECOMMENDED'}</span>
                          </div>
                        </div>
                        <p className="nut-guide-card-detail">
                          <strong>{locale === 'bn' ? 'উপকারিতা:' : 'Benefit:'}</strong> {locale === 'bn' ? (food.benefitBn || food.benefit) : food.benefit}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Avoid items grid */}
            <div className="nut-section-card" style={{ borderTop: '4px solid var(--color-danger)' }}>
              <div className="nut-section-header">
                <div className="nut-section-title-wrapper">
                  <div className="nut-header-circle danger">
                    <AlertTriangle />
                  </div>
                  <div>
                    <h3 className="nut-section-title">{$('NUTRITION_SECTION_AVOID', locale)}</h3>
                    <p className="muted" style={{ fontSize: '0.85rem', marginTop: '0.15rem' }}>{$('NUTRITION_SECTION_AVOID_DESC', locale)}</p>
                  </div>
                </div>
              </div>

              <div className="nut-guide-grid">
                {nutritionData.avoid.map((food) => {
                  const IconComponent = GUIDE_ICONS[food.icon] || Utensils;
                  return (
                    <div key={food.name} className="nut-guide-card avoid">
                      <div className="nut-guide-card-top">
                        <div className="nut-guide-icon-box">
                          <IconComponent />
                        </div>
                        <div className="nut-guide-card-header-info">
                          <div className="nut-guide-name">{locale === 'bn' ? (food.nameBn || food.name) : food.name}</div>
                          <span className="nut-guide-badge danger">{locale === 'bn' ? 'বর্জনীয়' : 'AVOID'}</span>
                        </div>
                      </div>
                      <p className="nut-guide-card-detail">
                        <strong>{locale === 'bn' ? 'কারণ:' : 'Reason:'}</strong> {locale === 'bn' ? (food.reasonBn || food.reason) : food.reason}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Local options grid */}
            <div className="nut-section-card">
              <div className="nut-section-header">
                <div className="nut-section-title-wrapper">
                  <div className="nut-header-circle primary">
                    <BookOpen />
                  </div>
                  <div>
                    <h3 className="nut-section-title">{$('NUTRITION_SECTION_LOCAL', locale)}</h3>
                    <p className="muted" style={{ fontSize: '0.85rem', marginTop: '0.15rem' }}>{$('NUTRITION_SECTION_LOCAL_DESC', locale)}</p>
                  </div>
                </div>
              </div>

              {localFoods.length === 0 ? (
                <p className="muted" style={{ textAlign: 'center', padding: '1.5rem 0' }}>{$('NUTRITION_EMPTY_LOCAL', locale)}</p>
              ) : (
                <div className="nut-guide-grid">
                  {localFoods.map((food) => {
                    const IconComponent = GUIDE_ICONS[food.icon] || Utensils;
                    return (
                      <div key={food.name} className="nut-guide-card local">
                        <div className="nut-guide-card-top">
                          <div className="nut-guide-icon-box">
                            <IconComponent />
                          </div>
                          <div className="nut-guide-card-header-info">
                            <div className="nut-guide-name">{locale === 'bn' ? (food.nameBn || food.name) : food.name}</div>
                            <span className="nut-guide-badge primary">{locale === 'bn' ? 'স্থানীয় খাবার' : 'LOCAL FOOD'}</span>
                          </div>
                        </div>
                        <p className="nut-guide-card-detail">
                          <strong>{locale === 'bn' ? 'পুষ্টি:' : 'Nutrition:'}</strong> {locale === 'bn' ? (food.tagBn || food.tag) : food.tag}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>


          </div>
        )}
      </div>
    </MobileLayout>
  )
}
