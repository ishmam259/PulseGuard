import { useState } from 'react'
import MobileLayout from '../../components/layout/MobileLayout'
import { useLocale } from '../../context/LocaleContext'
import { nutritionData } from '../../data/mockData'
import { patientNavItems } from '../../data/navItems'

export default function Nutrition() {
  const { t } = useLocale()
  const [selectedTag, setSelectedTag] = useState('All')
  const tags = [
    { id: 'All', labelKey: 'NUTRITION_TAG_ALL' },
    { id: 'Iron Rich', labelKey: 'NUTRITION_TAG_IRON_RICH' },
    { id: 'Protein', labelKey: 'NUTRITION_TAG_PROTEIN' },
    { id: 'Calcium', labelKey: 'NUTRITION_TAG_CALCIUM' },
    { id: 'Vitamins', labelKey: 'NUTRITION_TAG_VITAMINS' }
  ]

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
      title={t('NUTRITION_PAGE_TITLE')}
      status="online"
      navItems={patientNavItems}
    >
      <div className="animate-fade-in">
        {/* Filter Tags */}
        <div className="chip-row" style={{ marginBottom: '1.5rem', overflowX: 'auto', whiteSpace: 'nowrap' }}>
          {tags.map((tag) => (
            <button
              type="button"
              key={tag.id}
              className={`chip ${selectedTag === tag.id ? 'active' : ''}`}
              onClick={() => setSelectedTag(tag.id)}
            >
              {t(tag.labelKey)}
            </button>
          ))}
        </div>

        {/* Recommended Foods */}
        <div className="card stagger" style={{ animationDelay: '0s' }}>
          <h3 className="text-gradient">{t('NUTRITION_RECOMMENDED_HEADING')}</h3>
          <p className="muted">{t('NUTRITION_RECOMMENDED_DESC')}</p>
          {recommendedFoods.length === 0 ? (
            <p className="muted" style={{ marginTop: '1rem' }}>{t('NUTRITION_NO_RECOMMENDED')}</p>
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
          <h3 className="text-gradient">{t('NUTRITION_AVOID_HEADING')}</h3>
          <p className="muted">{t('NUTRITION_AVOID_DESC')}</p>
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
          <h3 className="text-gradient">{t('NUTRITION_LOCAL_HEADING')}</h3>
          <p className="muted">{t('NUTRITION_LOCAL_DESC')}</p>
          {localFoods.length === 0 ? (
            <p className="muted" style={{ marginTop: '1rem' }}>{t('NUTRITION_NO_LOCAL')}</p>
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
