import { useState, useEffect, useCallback } from 'react'
import MobileLayout from '../../components/layout/MobileLayout'
import { nutritionData } from '../../data/mockData'
import { patientNavItems } from '../../data/navItems'
import $ from '../../config/strings'
import { useApp } from '../../context/AppContext'
import * as api from '../../services/api'

function getRDA(week) {
  if (week == null || week <= 0)  return { calories_kcal: 2200, protein_g: 71, iron_mg: 27, folic_acid_mcg: 600, calcium_mg: 1000 }
  if (week <= 12) return { calories_kcal: 1800, protein_g: 71, iron_mg: 27, folic_acid_mcg: 600, calcium_mg: 1000 }
  if (week <= 27) return { calories_kcal: 2200, protein_g: 71, iron_mg: 27, folic_acid_mcg: 600, calcium_mg: 1000 }
  return            { calories_kcal: 2400, protein_g: 71, iron_mg: 27, folic_acid_mcg: 600, calcium_mg: 1000 }
}

function getTrimester(week) {
  if (week == null || week <= 0) return null
  if (week <= 12) return 1
  if (week <= 27) return 2
  return 3
}

const FOOD_PRESETS = [
  { name_en: 'Red Lentil Dal (1 cup)',       name_bn: 'মসুর ডাল (১ কাপ)',            calories: 230, protein: 18,   iron: 6.6, folic_acid: 179, calcium: 38,  meals: ['breakfast', 'lunch', 'dinner'] },
  { name_en: 'Cooked Rice (1 cup)',           name_bn: 'ভাত (১ কাপ)',                 calories: 206, protein: 4.3,  iron: 1.9, folic_acid: 8,   calcium: 16,  meals: ['lunch', 'dinner'] },
  { name_en: 'Spinach cooked (1 cup)',        name_bn: 'পালং শাক রান্না (১ কাপ)',     calories: 41,  protein: 5.4,  iron: 6.4, folic_acid: 263, calcium: 245, meals: ['lunch', 'dinner'] },
  { name_en: 'Egg (1 large)',                 name_bn: 'ডিম (১টি)',                   calories: 72,  protein: 6.3,  iron: 0.9, folic_acid: 24,  calcium: 28,  meals: ['breakfast', 'lunch'] },
  { name_en: 'Hilsa Fish (100g)',             name_bn: 'ইলিশ মাছ (১০০ গ্রাম)',       calories: 217, protein: 21,   iron: 1.3, folic_acid: 10,  calcium: 180, meals: ['lunch', 'dinner'] },
  { name_en: 'Boiled Chicken (100g)',         name_bn: 'সিদ্ধ মুরগি (১০০ গ্রাম)',    calories: 165, protein: 31,   iron: 1.3, folic_acid: 9,   calcium: 15,  meals: ['lunch', 'dinner'] },
  { name_en: 'Milk (1 cup)',                  name_bn: 'দুধ (১ কাপ)',                 calories: 122, protein: 8.1,  iron: 0.1, folic_acid: 12,  calcium: 305, meals: ['breakfast', 'snack'] },
  { name_en: 'Banana (1 medium)',             name_bn: 'কলা (১টি মাঝারি)',            calories: 105, protein: 1.3,  iron: 0.3, folic_acid: 24,  calcium: 6,   meals: ['breakfast', 'snack'] },
  { name_en: 'Orange (1 medium)',             name_bn: 'কমলা (১টি)',                  calories: 62,  protein: 1.2,  iron: 0.1, folic_acid: 40,  calcium: 52,  meals: ['breakfast', 'snack'] },
  { name_en: 'Chickpeas cooked (1 cup)',      name_bn: 'ছোলা রান্না (১ কাপ)',         calories: 269, protein: 14.5, iron: 4.7, folic_acid: 282, calcium: 80,  meals: ['lunch', 'dinner'] },
  { name_en: 'Sweet Potato (1 medium)',       name_bn: 'মিষ্টি আলু (১টি)',            calories: 103, protein: 2.3,  iron: 0.8, folic_acid: 18,  calcium: 43,  meals: ['breakfast', 'snack'] },
  { name_en: 'Yogurt (1 cup)',                name_bn: 'দই (১ কাপ)',                  calories: 150, protein: 8.5,  iron: 0.1, folic_acid: 17,  calcium: 296, meals: ['breakfast', 'snack'] },
  { name_en: 'Pumpkin cooked (1 cup)',        name_bn: 'কুমড়া রান্না (১ কাপ)',       calories: 49,  protein: 1.8,  iron: 1.4, folic_acid: 21,  calcium: 37,  meals: ['lunch', 'dinner'] },
  { name_en: 'Sesame Seeds (2 tbsp)',         name_bn: 'তিল (২ চামচ)',                calories: 103, protein: 3.2,  iron: 2.1, folic_acid: 17,  calcium: 176, meals: ['breakfast', 'snack'] },
  { name_en: 'Chicken Liver (100g)',          name_bn: 'মুরগির কলিজা (১০০ গ্রাম)',   calories: 119, protein: 17,   iron: 8.9, folic_acid: 588, calcium: 11,  meals: ['lunch', 'dinner'] },
  { name_en: 'Mung Bean Dal (1 cup)',         name_bn: 'মুগ ডাল (১ কাপ)',             calories: 212, protein: 14.2, iron: 2.8, folic_acid: 320, calcium: 55,  meals: ['breakfast', 'lunch', 'dinner'] },
  { name_en: 'Jackfruit (1 cup)',             name_bn: 'কাঁঠাল (১ কাপ)',              calories: 155, protein: 2.8,  iron: 1.0, folic_acid: 22,  calcium: 56,  meals: ['lunch', 'snack'] },
  { name_en: 'Roti / Chapati (2 pieces)',     name_bn: 'রুটি (২টি)',                  calories: 170, protein: 4.9,  iron: 1.8, folic_acid: 22,  calcium: 22,  meals: ['breakfast', 'lunch', 'dinner'] },
  { name_en: 'Catfish / Magur (100g)',        name_bn: 'মাগুর মাছ (১০০ গ্রাম)',      calories: 105, protein: 18,   iron: 1.5, folic_acid: 25,  calcium: 45,  meals: ['lunch', 'dinner'] },
  { name_en: 'Bitter Gourd cooked (1 cup)',   name_bn: 'করলা রান্না (১ কাপ)',         calories: 24,  protein: 1.0,  iron: 0.8, folic_acid: 72,  calcium: 20,  meals: ['lunch', 'dinner'] },
  { name_en: 'Mustard Greens (1 cup)',        name_bn: 'সরিষা শাক (১ কাপ)',           calories: 36,  protein: 3.2,  iron: 1.8, folic_acid: 290, calcium: 142, meals: ['lunch', 'dinner'] },
  { name_en: 'Broccoli cooked (1 cup)',       name_bn: 'ব্রকলি রান্না (১ কাপ)',      calories: 55,  protein: 3.7,  iron: 1.0, folic_acid: 168, calcium: 62,  meals: ['lunch', 'dinner'] },
  { name_en: 'Almond (1 oz / 28g)',           name_bn: 'বাদাম (২৮ গ্রাম)',            calories: 164, protein: 6,    iron: 1.0, folic_acid: 12,  calcium: 76,  meals: ['breakfast', 'snack'] },
  { name_en: 'Dried Dates (3 pieces)',        name_bn: 'খেজুর (৩টি)',                 calories: 67,  protein: 0.6,  iron: 0.5, folic_acid: 10,  calcium: 15,  meals: ['breakfast', 'snack'] },
  { name_en: 'Green Papaya (1 cup)',          name_bn: 'কাঁচা পেঁপে (১ কাপ)',         calories: 55,  protein: 0.9,  iron: 0.3, folic_acid: 38,  calcium: 34,  meals: ['snack'] },
]

const EMPTY_CUSTOM = { calories: '', protein: '', iron: '', folic_acid: '', calcium: '' }

export default function Nutrition() {
  const { locale, connectivity } = useApp()
  const [activeTab, setActiveTab] = useState('guide')

  // Guide tab
  const [selectedTag, setSelectedTag] = useState('All')

  // Tracker tab — preset mode
  const [nutrition, setNutrition] = useState(null)
  const [gestationalWeek, setGestationalWeek] = useState(null)
  const [selectedMeal, setSelectedMeal] = useState('breakfast')
  const [selectedFood, setSelectedFood] = useState(null)
  const [adding, setAdding] = useState(false)
  const [loadingTracker, setLoadingTracker] = useState(false)

  // Tracker tab — custom mode
  const [customMode, setCustomMode] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customNutrients, setCustomNutrients] = useState(EMPTY_CUSTOM)

  const tagKeys = ['All', 'Iron Rich', 'Protein', 'Calcium', 'Vitamins']
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

  const loadTracker = useCallback(async () => {
    setLoadingTracker(true)
    const [data, profile] = await Promise.all([
      api.getNutritionDaily(),
      api.getMyPatientProfile(),
    ])
    setNutrition(data)
    if (profile?.patient?.gestational_week != null) {
      setGestationalWeek(Number(profile.patient.gestational_week))
    }
    setLoadingTracker(false)
  }, [])

  useEffect(() => {
    if (activeTab === 'tracker') loadTracker()
  }, [activeTab, loadTracker])

  function handleMealChange(meal) {
    setSelectedMeal(meal)
    setSelectedFood(null)
    setCustomMode(false)
    setCustomName('')
    setCustomNutrients(EMPTY_CUSTOM)
  }

  function toggleCustomMode() {
    setCustomMode(prev => !prev)
    setSelectedFood(null)
    setCustomName('')
    setCustomNutrients(EMPTY_CUSTOM)
  }

  async function handleAddFood() {
    if (adding) return

    let payload
    if (customMode) {
      if (!customName.trim()) return
      payload = {
        food_name:      customName.trim(),
        meal_type:      selectedMeal,
        calories_kcal:  parseFloat(customNutrients.calories)  || 0,
        protein_g:      parseFloat(customNutrients.protein)   || 0,
        iron_mg:        parseFloat(customNutrients.iron)      || 0,
        folic_acid_mcg: parseFloat(customNutrients.folic_acid) || 0,
        calcium_mg:     parseFloat(customNutrients.calcium)   || 0,
      }
    } else {
      if (!selectedFood) return
      payload = {
        food_name:      selectedFood.name_en,
        meal_type:      selectedMeal,
        calories_kcal:  selectedFood.calories,
        protein_g:      selectedFood.protein,
        iron_mg:        selectedFood.iron,
        folic_acid_mcg: selectedFood.folic_acid,
        calcium_mg:     selectedFood.calcium,
      }
    }

    setAdding(true)

    if (!connectivity) {
      const queue = JSON.parse(localStorage.getItem('pg_offline_queue:v1') || '[]')
      queue.push({ type: 'nutrition_log', payload, timestamp: new Date().toISOString() })
      localStorage.setItem('pg_offline_queue:v1', JSON.stringify(queue))
      setAdding(false)
      setSelectedFood(null)
      setCustomName('')
      setCustomNutrients(EMPTY_CUSTOM)
      return
    }

    const result = await api.logNutrition(payload)
    if (result.ok) {
      await loadTracker()
      setSelectedFood(null)
      setCustomName('')
      setCustomNutrients(EMPTY_CUSTOM)
    }
    setAdding(false)
  }

  async function handleDeleteEntry(id) {
    const result = await api.deleteNutritionEntry(id)
    if (result.ok) await loadTracker()
  }

  const rda = getRDA(gestationalWeek)
  const trimester = getTrimester(gestationalWeek)

  function pct(value, rdaKey) {
    return Math.min(100, Math.round((value / rda[rdaKey]) * 100))
  }

  function barColor(p) {
    if (p >= 80) return 'var(--color-success, #22c55e)'
    if (p >= 40) return 'var(--color-warning, #f59e0b)'
    return 'var(--color-danger, #ef4444)'
  }

  const MEAL_LABELS = {
    breakfast: $('NUT_MEAL_BREAKFAST', locale),
    lunch:     $('NUT_MEAL_LUNCH',     locale),
    dinner:    $('NUT_MEAL_DINNER',    locale),
    snack:     $('NUT_MEAL_SNACK',     locale),
  }

  const NUTRIENTS = [
    { key: 'calories_kcal',  rdaKey: 'calories_kcal',  label: $('NUT_FIELD_CALORIES', locale), unit: 'kcal', decimals: 0 },
    { key: 'protein_g',      rdaKey: 'protein_g',      label: $('NUT_FIELD_PROTEIN',  locale), unit: 'g',    decimals: 1 },
    { key: 'iron_mg',        rdaKey: 'iron_mg',        label: $('NUT_FIELD_IRON',     locale), unit: 'mg',   decimals: 1 },
    { key: 'folic_acid_mcg', rdaKey: 'folic_acid_mcg', label: $('NUT_FIELD_FOLIC',    locale), unit: 'mcg',  decimals: 0 },
    { key: 'calcium_mg',     rdaKey: 'calcium_mg',     label: $('NUT_FIELD_CALCIUM',  locale), unit: 'mg',   decimals: 0 },
  ]

  const CUSTOM_FIELDS = [
    { key: 'calories',  label: $('NUT_FIELD_CALORIES', locale), unit: 'kcal' },
    { key: 'protein',   label: $('NUT_FIELD_PROTEIN',  locale), unit: 'g'    },
    { key: 'iron',      label: $('NUT_FIELD_IRON',     locale), unit: 'mg'   },
    { key: 'folic_acid',label: $('NUT_FIELD_FOLIC',    locale), unit: 'mcg'  },
    { key: 'calcium',   label: $('NUT_FIELD_CALCIUM',  locale), unit: 'mg'   },
  ]

  const filteredPresets = FOOD_PRESETS.filter(f => f.meals.includes(selectedMeal))

  const recommendedFoods = filterRecommended(nutritionData.recommended, selectedTag)
  const localFoods = filterLocal(nutritionData.local, selectedTag)

  const addDisabled = adding || (customMode ? !customName.trim() : !selectedFood)

  return (
    <MobileLayout
      title={$('PAGE_TITLE_NUTRITION', locale)}
      status={connectivity}
      navItems={patientNavItems(locale)}
    >
      {/* Tab toggle */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {['guide', 'tracker'].map(tab => (
          <button
            key={tab}
            type="button"
            className={`chip ${activeTab === tab ? 'active' : ''}`}
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'guide' ? $('NUT_TAB_GUIDE', locale) : $('NUT_TAB_TRACKER', locale)}
          </button>
        ))}
      </div>

      {/* ── GUIDE TAB ── */}
      {activeTab === 'guide' && (
        <div className="animate-fade-in">
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

      {/* ── TRACKER TAB ── */}
      {activeTab === 'tracker' && (
        <div className="animate-fade-in">

          {/* Alert banners */}
          {nutrition?.alerts?.low_iron_3d && (
            <div className="card stagger" style={{ animationDelay: '0s', background: 'var(--color-danger-light, #fee2e2)', border: '1.5px solid var(--color-danger, #ef4444)', marginBottom: '0.75rem' }}>
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-danger, #ef4444)' }}>
                {$('NUT_ALERT_LOW_IRON', locale)}
              </p>
              <p style={{ margin: '0.3rem 0 0', fontSize: '0.85rem', color: 'var(--color-danger, #ef4444)' }}>
                {$('NUT_ALERT_ANEMIA_RISK', locale)}
              </p>
            </div>
          )}
          {nutrition?.alerts?.low_folic_3d && (
            <div className="card stagger" style={{ animationDelay: '0.05s', background: 'var(--color-warning-light, #fef3c7)', border: '1.5px solid var(--color-warning, #f59e0b)', marginBottom: '0.75rem' }}>
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-warning, #d97706)' }}>
                {$('NUT_ALERT_LOW_FOLIC', locale)}
              </p>
            </div>
          )}
          {nutrition?.alerts?.low_calcium_3d && (
            <div className="card stagger" style={{ animationDelay: '0.1s', background: 'var(--color-warning-light, #fef3c7)', border: '1.5px solid var(--color-warning, #f59e0b)', marginBottom: '0.75rem' }}>
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-warning, #d97706)' }}>
                {$('NUT_ALERT_LOW_CALCIUM', locale)}
              </p>
            </div>
          )}

          {/* Daily progress */}
          <div className="card stagger" style={{ animationDelay: '0.15s' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
              <h3 className="text-gradient" style={{ margin: 0 }}>{$('NUT_DAILY_SUMMARY', locale)}</h3>
              {trimester && (
                <span className="pill" style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem', background: 'var(--color-primary-light, #ede9fe)', color: 'var(--color-primary, #7c3aed)', border: '1px solid var(--color-primary, #7c3aed)', fontWeight: 600 }}>
                  T{trimester} · {$(`NUT_TRIMESTER_${trimester}`, locale)}
                </span>
              )}
            </div>
            {loadingTracker ? (
              <p className="muted" style={{ marginTop: '0.5rem' }}>…</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.75rem' }}>
                {NUTRIENTS.map(({ key, rdaKey, label, unit, decimals }) => {
                  const val = parseFloat(nutrition?.totals?.[key] || 0)
                  const p = pct(val, rdaKey)
                  return (
                    <div key={key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.875rem' }}>
                        <span style={{ fontWeight: 500 }}>{label}</span>
                        <span className="muted">{val.toFixed(decimals)} / {rda[rdaKey]} {unit}</span>
                      </div>
                      <div style={{ height: '8px', borderRadius: '4px', background: 'var(--color-border, #e5e7eb)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${p}%`, background: barColor(p), borderRadius: '4px', transition: 'width 0.4s ease' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Quick add */}
          <div className="card stagger" style={{ animationDelay: '0.25s' }}>
            <h3 className="text-gradient">{$('NUT_ADD_FOOD', locale)}</h3>

            {/* Meal type */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.75rem', marginBottom: '1rem' }}>
              {Object.entries(MEAL_LABELS).map(([key, label]) => (
                <button key={key} type="button" className={`chip ${selectedMeal === key ? 'active' : ''}`} onClick={() => handleMealChange(key)}>
                  {label}
                </button>
              ))}
            </div>

            {/* Food list or custom form */}
            {!customMode ? (
              <>
                <p className="muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>{$('NUT_PICK_FOOD', locale)}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '240px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                  {filteredPresets.map((food, i) => {
                    const isSelected = selectedFood === food
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedFood(isSelected ? null : food)}
                        style={{
                          textAlign: 'left', padding: '0.55rem 0.75rem', borderRadius: '0.5rem',
                          border: `1.5px solid ${isSelected ? 'var(--color-primary, #7c3aed)' : 'var(--color-border, #e5e7eb)'}`,
                          background: isSelected ? 'var(--color-primary-light, #ede9fe)' : 'transparent',
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}
                      >
                        <div style={{ fontWeight: isSelected ? 600 : 400, fontSize: '0.9rem' }}>
                          {locale === 'bn' ? food.name_bn : food.name_en}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)', marginTop: '0.1rem' }}>
                          {food.calories} kcal · {food.protein}g {$('NUT_FIELD_PROTEIN', locale)} · {food.iron}mg {$('NUT_FIELD_IRON', locale)} · {food.folic_acid}mcg {$('NUT_FIELD_FOLIC', locale)}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </>
            ) : (
              /* Custom food form */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                    {$('NUT_CUSTOM_FOOD_NAME', locale)} *
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={e => setCustomName(e.target.value)}
                    placeholder={locale === 'bn' ? 'যেমন: ডাল ভাত' : 'e.g. Daal Bhaat'}
                    style={{
                      width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.9rem',
                      border: '1.5px solid var(--color-border, #e5e7eb)', background: 'transparent',
                      color: 'inherit', outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
                <p className="muted" style={{ fontSize: '0.78rem', margin: '0.1rem 0 0.2rem' }}>
                  {locale === 'bn' ? 'পুষ্টির তথ্য (ঐচ্ছিক)' : 'Nutrient values (optional)'}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {CUSTOM_FIELDS.map(({ key, label, unit }) => (
                    <div key={key}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 500, display: 'block', marginBottom: '0.2rem' }}>
                        {label} <span style={{ opacity: 0.6 }}>({unit})</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={customNutrients[key]}
                        onChange={e => setCustomNutrients(prev => ({ ...prev, [key]: e.target.value }))}
                        placeholder="0"
                        style={{
                          width: '100%', padding: '0.4rem 0.6rem', borderRadius: '0.5rem', fontSize: '0.875rem',
                          border: '1.5px solid var(--color-border, #e5e7eb)', background: 'transparent',
                          color: 'inherit', outline: 'none', boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Toggle custom mode */}
            <button
              type="button"
              onClick={toggleCustomMode}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--color-primary, #7c3aed)', fontSize: '0.8rem',
                padding: '0.5rem 0', marginTop: '0.5rem', textDecoration: 'underline',
              }}
            >
              {customMode ? $('NUT_BACK_TO_LIST', locale) : $('NUT_NOT_IN_LIST', locale)}
            </button>

            <button
              type="button"
              className="btn-primary"
              style={{ width: '100%', marginTop: '0.75rem' }}
              disabled={addDisabled}
              onClick={handleAddFood}
            >
              {adding ? '…' : $('NUT_ADD_FOOD', locale)}
            </button>
          </div>

          {/* Today's log */}
          <div className="card stagger" style={{ animationDelay: '0.35s' }}>
            <h3 className="text-gradient">{$('NUT_TODAYS_LOG', locale)}</h3>
            {loadingTracker ? (
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
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '0.2rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span className="pill" style={{ padding: '0.1rem 0.4rem', fontSize: '0.7rem' }}>
                          {MEAL_LABELS[entry.meal_type]}
                        </span>
                        <span>{new Date(entry.logged_at).toLocaleTimeString(locale === 'bn' ? 'bn-BD' : 'en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>{parseFloat(entry.calories_kcal).toFixed(0)} kcal</span>
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
    </MobileLayout>
  )
}
