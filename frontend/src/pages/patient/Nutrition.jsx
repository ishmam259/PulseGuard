import { useState } from 'react'
import MobileLayout from '../../components/layout/MobileLayout'
import { nutritionData } from '../../data/mockData'
import { patientNavItems } from '../../data/navItems'
import $ from '../../config/strings'
import { useApp } from '../../context/AppContext'

export default function Nutrition() {
  const { locale, connectivity } = useApp()
  const [selectedTag, setSelectedTag] = useState('All')
  const tagKeys = ['All', 'Iron Rich', 'Protein', 'Calcium', 'Vitamins']
  const tagLabels = {
    'All': $('NUTRITION_TAG_ALL', locale),
    'Iron Rich': $('NUTRITION_TAG_IRON', locale),
    'Protein': $('NUTRITION_TAG_PROTEIN', locale),
    'Calcium': $('NUTRITION_TAG_CALCIUM', locale),
    'Vitamins': $('NUTRITION_TAG_VITAMINS', locale),
  }

  const filterRecommended = (foods, tag) => {
    if (tag === 'All') return foods
    const map = {
      'Iron Rich': ['Leafy Greens (Spinach, Kale)', 'Lentils (Dal)'],
      'Protein': ['Eggs', 'Fish (Low Mercury)', 'Lentils (Dal)'],
      'Calcium': ['Yogurt'],
      'Vitamins': ['Sweet Potatoes', 'Leafy Greens (Spinach, Kale)'],
    }
    return foods.filter((f) => (map[tag] || []).includes(f.name))
  }

  const filterLocal = (foods, tag) => {
    if (tag === 'All') return foods
    const map = {
      'Iron Rich': ['Spinach (Palong Shak)', 'Red Lentils (Masoor Dal)', 'Chickpeas (Chola)'],
      'Protein': ['Red Lentils (Masoor Dal)', 'Rice + Lentils', 'Chickpeas (Chola)'],
      'Calcium': ['Milk'],
      'Vitamins': ['Seasonal Fruits', 'Spinach (Palong Shak)'],
    }
    return foods.filter((f) => (map[tag] || []).includes(f.name))
  }

  const recommendedFoods = filterRecommended(nutritionData.recommended, selectedTag)
  const localFoods = filterLocal(nutritionData.local, selectedTag)

  return (
    <MobileLayout
      title={$('PAGE_TITLE_NUTRITION', locale)}
      status={connectivity}
      navItems={patientNavItems(locale)}
    >
      <div className="animate-fade-in">
        {/* Filter Tags */}
        <div className="chip-row" style={{ marginBottom: '1.5rem', overflowX: 'auto', whiteSpace: 'nowrap' }}>
          {tagKeys.map((tagKey) => (
            <button
              type="button"
              key={tagKey}
              className={`chip ${selectedTag === tagKey ? 'active' : ''}`}
              onClick={() => setSelectedTag(tagKey)}
            >
              {tagLabels[tagKey]}
            </button>
          ))}
        </div>

        {/* Recommended Foods */}
        <div className="card stagger" style={{ animationDelay: '0s' }}>
          <h3 className="text-gradient">{$('NUTRITION_SECTION_RECOMMENDED', locale)}</h3>
          <p className="muted">{$('NUTRITION_SECTION_RECOMMENDED_DESC', locale)}</p>
          {recommendedFoods.length === 0 ? (
            <p className="muted" style={{ marginTop: '1rem' }}>{$('NUTRITION_EMPTY_RECOMMENDED', locale)}</p>
          ) : (
            <div className="pill-list" style={{ marginTop: '1rem' }}>
              {recommendedFoods.map((food) => (
                <span key={food.name} className="pill good" title={food.benefit}>
                  {food.icon} {food.name} <span style={{ opacity: 0.7, fontSize: '0.8rem' }}>({food.benefit})</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Foods to Avoid */}
        <div className="card stagger" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-gradient">{$('NUTRITION_SECTION_AVOID', locale)}</h3>
          <p className="muted">{$('NUTRITION_SECTION_AVOID_DESC', locale)}</p>
          <div className="pill-list" style={{ marginTop: '1rem' }}>
            {nutritionData.avoid.map((food) => (
              <span key={food.name} className="pill warning" title={food.reason}>
                {food.icon} {food.name} <span style={{ opacity: 0.7, fontSize: '0.8rem' }}>({food.reason})</span>
              </span>
            ))}
          </div>
        </div>

        {/* Local Affordable Foods */}
        <div className="card stagger" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-gradient">{$('NUTRITION_SECTION_LOCAL', locale)}</h3>
          <p className="muted">{$('NUTRITION_SECTION_LOCAL_DESC', locale)}</p>
          {localFoods.length === 0 ? (
            <p className="muted" style={{ marginTop: '1rem' }}>{$('NUTRITION_EMPTY_LOCAL', locale)}</p>
          ) : (
            <div className="pill-list" style={{ marginTop: '1rem' }}>
              {localFoods.map((food) => (
                <span key={food.name} className="pill" title={food.tag}>
                  {food.icon} {food.name} <span style={{ opacity: 0.7, fontSize: '0.8rem' }}>({food.tag})</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  )
}
