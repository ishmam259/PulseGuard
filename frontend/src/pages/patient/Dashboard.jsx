import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MobileLayout from '../../components/layout/MobileLayout'
import { useApp } from '../../context/AppContext'
import * as api from '../../services/api'
import { patientNavItems } from '../../data/navItems'
import $ from '../../config/strings'
import { 
  Activity,
  Scale,
  Thermometer,
  Ruler,
  AlertTriangle,
  Moon,
  BookHeart,
  Send,
  Play,
  Calendar as CalendarIcon,
  ChevronRight,
  Bot,
  Flower2,
  PhoneCall,
  HeartPulse
} from 'lucide-react'

import ConnectAI from '../../components/ConnectAI'

export default function Dashboard() {
  const { currentUser, connectivity, locale } = useApp()
  const navigate = useNavigate()
  const [patient, setPatient] = useState(null)
  const [latestVitals, setLatestVitals] = useState(null)
  const [nutrition, setNutrition] = useState(null)
  const [wellness, setWellness] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPatientData() {
      try {
        const [profileRes, nutritionRes, wellnessRes] = await Promise.all([
          api.getMyPatientProfile(),
          api.getNutritionDaily().catch(() => null),
          api.getWellnessDaily().catch(() => null)
        ])
        if (profileRes && profileRes.patient) {
          setPatient(profileRes.patient)
          setLatestVitals(profileRes.latestVitals)
        }
        if (nutritionRes) {
          setNutrition(nutritionRes)
        }
        if (wellnessRes) {
          setWellness(wellnessRes)
        }
      } catch (err) {
        console.error('Failed to load patient dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadPatientData()
  }, [])

  const currentWeek = patient?.gestational_week || 24
  const lmpDate = patient?.lmp_date ? new Date(patient.lmp_date) : new Date(Date.now() - currentWeek * 7 * 24 * 60 * 60 * 1000)
  const eddDate = new Date(lmpDate.getTime() + 280 * 24 * 60 * 60 * 1000)
  const daysUntilDue = Math.max(0, Math.ceil((eddDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
  const formattedEDD = eddDate.toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })

  // Dynamic calculations for vitals
  const bpValue = latestVitals ? `${latestVitals.bp_systolic}/${latestVitals.bp_diastolic}` : '118/76'
  const weightValue = latestVitals?.weight_kg ? `${latestVitals.weight_kg} kg` : '62.5 kg'
  const tempValue = latestVitals?.temperature_c ? `${latestVitals.temperature_c}°C` : '36.8°C'
  const bmiValue = (() => {
    if (latestVitals?.weight_kg && patient?.height_cm) {
      const heightM = patient.height_cm / 100
      return (latestVitals.weight_kg / (heightM * heightM)).toFixed(1)
    }
    return '23.4'
  })()

  // Tips array mapped to current week
  const TIPS = [
    {
      icon: Moon,
      title: locale === 'bn' ? 'শোয়ার পজিশন' : 'Sleep Position',
      body: locale === 'bn' ? 'বাম কাতে ঘুমালে আপনার শিশু এবং কিডনিতে রক্তপ্রবাহ বাড়ে।' : 'Left-side sleeping boosts blood flow to your baby and kidneys.',
      cta: locale === 'bn' ? 'আরও পড়ুন' : 'Read more',
      to: '/patient/wellness'
    },
    {
      icon: Flower2,
      title: locale === 'bn' ? 'প্রসবপূর্ব যোগব্যায়াম' : 'Prenatal Yoga',
      body: locale === 'bn' ? `সপ্তাহ ${currentWeek}-এর জন্য মৃদু স্ট্রেচিং — পিঠের ব্যথা কমায় এবং শারীরিক ভঙ্গি উন্নত করে।` : `Gentle stretches for Week ${currentWeek} — eases back pain and improves posture.`,
      cta: locale === 'bn' ? 'ব্যায়াম চেষ্টা করুন' : 'Try exercises',
      to: '/patient/calendar'
    }
  ]

  // Medications array - hardcoded details to filter
  const allMedications = [
    { 
      name: 'Folic Acid 5mg', 
      timeText: locale === 'bn' ? 'সময়: দুপুর ২:০০ · ১টি ট্যাবলেট' : 'Due: 2:00 PM · 1 tablet', 
      status: 'due', 
      statusText: locale === 'bn' ? 'এখনই প্রদেয়' : 'Due Now', 
      badgeColor: 'rgba(245, 158, 11, 0.15)', 
      badgeTextColor: 'var(--color-warning)', 
      dotColor: '#f59e0b', 
      borderCls: '1px solid rgba(245, 158, 11, 0.3)', 
      bgCls: 'rgba(245, 158, 11, 0.05)' 
    },
    { 
      name: 'Iron Supplement', 
      timeText: locale === 'bn' ? 'নেওয়া হয়েছে সকাল ৯:০০ টায় ✓' : 'Taken 9:00 AM ✓', 
      status: 'done', 
      statusText: locale === 'bn' ? 'সম্পন্ন' : 'Done', 
      badgeColor: 'rgba(16, 185, 129, 0.15)', 
      badgeTextColor: 'var(--color-success)', 
      dotColor: '#10b981', 
      borderCls: 'none', 
      bgCls: 'var(--color-primary-dim)' 
    },
    { 
      name: 'Vitamin D3', 
      timeText: locale === 'bn' ? 'পরবর্তী সময়: রাত ৮:০০ টা' : 'Next: 8:00 PM', 
      status: 'later', 
      statusText: locale === 'bn' ? 'পরে' : 'Later', 
      badgeColor: 'var(--color-primary-dim)', 
      badgeTextColor: 'var(--color-primary)', 
      dotColor: 'var(--color-primary)', 
      borderCls: 'none', 
      bgCls: 'var(--color-primary-dim)' 
    }
  ]

  // Filter only due medications (Due Now or Later)
  const dueMedications = allMedications.filter(med => med.status !== 'done')

  return (
    <MobileLayout
      title={$('PAGE_TITLE_DASHBOARD', locale)}
      status={connectivity}
      navItems={patientNavItems(locale)}
    >
      <div className="animate-fade-in premium-dashboard">
        {loading ? (
          <div className="card text-center" style={{ padding: '3rem 2rem' }}>
            <p className="muted animate-pulse">{$('DASH_LOADING', locale)}</p>
          </div>
        ) : !patient ? (
          /* Profile incomplete welcome state */
          <div className="card text-center" style={{ padding: '2.5rem 1.5rem' }}>
            <div className="mx-auto" style={{ display: 'grid', height: '64px', width: '64px', placeItems: 'center', borderRadius: '16px', background: 'var(--color-primary-dim)', color: 'var(--color-primary)', margin: '0 auto 1.5rem' }}>
              <HeartPulse style={{ height: '32px', width: '32px' }} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {$('DASH_WELCOME_HEADING_PREFIX', locale)} {currentUser?.name?.split(' ')[0] || 'Mother'}!
            </h2>
            <p className="muted" style={{ marginBottom: '1.5rem', lineHeight: 1.6, maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
              {$('DASH_WELCOME_BODY', locale)}
            </p>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => navigate('/patient/onboarding')}
            >
              {$('DASH_COMPLETE_PROFILE_BTN', locale)}
            </button>
          </div>
        ) : (
          /* Main welcome greeting & premium layout */
          <>
            {/* Greeting */}
            <div>
              <h2 className="font-display" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '2.2rem', fontWeight: '700', margin: '0 0 8px 0', color: 'var(--color-text)' }}>
                {locale === 'bn' ? 'হ্যালো, ' : 'Hello, '}
                {(() => {
                  const name = patient.name
                  const words = name.split(' ')
                  if (words.length <= 1) return name
                  const lastWord = words[words.length - 1]
                  const rest = words.slice(0, -1).join(' ')
                  return (
                    <>
                      {rest} <span className="italic" style={{ color: 'var(--color-primary)', fontWeight: '700' }}>{lastWord}</span>
                    </>
                  )
                })()}!
                <BookHeart className="h-8 w-8" style={{ color: 'var(--color-primary)' }} />
              </h2>
              <p className="muted" style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                {locale === 'bn' ? 'আজকের গর্ভাবস্থা ও স্বাস্থ্য সারাংশ দেখুন।' : "Check out today's pregnancy & health overview."}
              </p>
            </div>

            {/* Pregnancy hero */}
            <section className="premium-dashboard-hero">
              <div className="premium-dashboard-hero-grid">
                <div>
                  <h3 className="font-display" style={{ fontSize: '2.8rem', lineHeight: '1.1', fontWeight: '800', margin: '0', color: 'var(--color-text)' }}>
                    {locale === 'bn' ? 'আপনার যাত্রা,' : 'Your journey,'}<br />
                    <span className="italic text-gradient-primary">{locale === 'bn' ? 'সপ্তাহে সপ্তাহে।' : 'week by week.'}</span>
                  </h3>
                  <Link
                    to="/patient/calendar"
                    className="premium-dashboard-hero-play-btn"
                  >
                    <span className="premium-dashboard-hero-play-icon">
                      <Play className="h-4 w-4 fill-white" />
                    </span>
                    <span>{locale === 'bn' ? 'কী পরিবর্তন হচ্ছে?' : "What's changing?"}</span>
                  </Link>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'flex-end' }}>
                    <span className="font-display" style={{ fontSize: '6rem', fontWeight: '800', lineHeight: '1', color: 'var(--color-text)' }}>
                      {locale === 'bn' ? currentWeek.toLocaleString('bn-BD') : currentWeek}
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.22em', color: 'var(--color-muted)', margin: '8px 0 0 0' }}>
                    {locale === 'bn' ? 'সপ্তাহ গর্ভবতী' : 'Weeks Pregnant'}
                  </p>
                  <div className="premium-dashboard-hero-pill">
                    <CalendarIcon className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                    <span className="muted">{locale === 'bn' ? 'নির্ধারিত:' : 'Due:'}</span>
                    <span style={{ fontWeight: '600', color: 'var(--color-primary)' }}>{formattedEDD}</span>
                    <span className="muted">·</span>
                    <span className="muted">{locale === 'bn' ? `${daysUntilDue.toLocaleString('bn-BD')} দিন` : `${daysUntilDue} days`}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Connect AI Section (MCP) */}
            <div style={{ marginBottom: '2rem' }}>
               <ConnectAI locale={locale} />
            </div>

            {/* Daily Tips */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--color-muted)', margin: '0' }}>
                  {locale === 'bn' ? 'দৈনিক টিপস — ওয়েলনেস হাব' : 'Daily Tips — Wellness Hub'}
                </p>
                <Link to="/patient/wellness" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: '600', color: 'var(--color-primary)' }}>
                  <span>{locale === 'bn' ? 'সব দেখুন' : 'See all topics'}</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid-tips">
                {TIPS.map((tip) => {
                  const Icon = tip.icon
                  return (
                    <div key={tip.title} className="card" style={{ padding: '24px' }}>
                      <span className="tip-icon-badge">
                        <Icon className="h-6 w-6" />
                      </span>
                      <h4 className="font-display" style={{ fontSize: '1.25rem', fontWeight: '700', margin: '12px 0 8px 0', color: 'var(--color-text)' }}>{tip.title}</h4>
                      <p className="muted" style={{ fontSize: '13.5px', lineHeight: '1.6', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>{tip.body}</p>
                      <Link to={tip.to} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: '600', color: 'var(--color-primary)' }}>
                        <span>{tip.cta}</span>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* AI + Nutrition */}
            <div className="grid-2">
              {/* PulseGuard AI */}
              <div className="ai-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="premium-dashboard-hero-play-icon" style={{ height: '48px', width: '48px', borderRadius: '16px' }}>
                    <Bot className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="font-display" style={{ fontSize: '1.2rem', fontWeight: '700', margin: '0', color: 'var(--color-text)' }}>PulseGuard AI</p>
                    <p className="muted" style={{ margin: '2px 0 0 0' }}>{locale === 'bn' ? 'আপনার মাতৃস্বাস্থ্য সঙ্গী' : 'Your maternal health companion'}</p>
                  </div>
                </div>
                <p className="muted" style={{ margin: '20px 0', fontSize: '14px', lineHeight: '1.6', color: 'var(--color-text-secondary)' }}>
                  {locale === 'bn' ? `আপনার গর্ভাবস্থা, পুষ্টি, উপসর্গ বা ওষুধ সম্পর্কে যেকোনো কিছু জিজ্ঞাসা করুন — আমি সপ্তাহ ${currentWeek.toLocaleString('bn-BD')}-এর জন্য বিজ্ঞান-ভিত্তিক উত্তর দিই।` : `Ask me anything about your pregnancy, nutrition, symptoms, or medication — I give science-based answers tailored for Week ${currentWeek}.`}
                </p>
                <form 
                  onSubmit={(e) => { 
                    e.preventDefault()
                    const val = e.target.query.value.trim()
                    if (val) navigate(`/patient/ai-chat?q=${encodeURIComponent(val)}`)
                  }} 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '9999px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', padding: '6px 6px 6px 20px', boxShadow: 'var(--shadow-sm)' }}
                >
                  <input
                    name="query"
                    aria-label={locale === 'bn' ? 'এআই অনুসন্ধান ইনপুট' : 'AI search input'}
                    placeholder={locale === 'bn' ? 'আজ আমি কীভাবে সাহায্য করতে পারি?' : 'How can I help you today?'}
                    style={{ flex: 1, backgroundColor: 'transparent', fontSize: '14px', color: 'var(--color-text)', border: 'none', outline: 'none' }}
                  />
                  <button
                    type="submit"
                    aria-label="Send"
                    className="premium-dashboard-hero-play-icon"
                    style={{ height: '36px', width: '36px', border: 'none', cursor: 'pointer' }}
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
                <Link to="/patient/ai-chat" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: '600', color: 'var(--color-primary)', marginTop: '20px' }}>
                  <span>{locale === 'bn' ? 'সম্পূর্ণ এআই সহকারী খুলুন' : 'Open full AI assistant'}</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Nutrition Today */}
              <div className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--color-muted)', margin: '0' }}>
                    {locale === 'bn' ? 'আজকের পুষ্টি' : 'Nutrition Today'}
                  </p>
                  <p style={{ textAlign: 'right', margin: '0' }}>
                    <span className="font-display" style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-text)' }}>
                      {locale === 'bn' ? (2200).toLocaleString('bn-BD') : '2,200'}
                    </span>
                    <sup style={{ fontSize: '10px', color: 'var(--color-muted)', marginLeft: '2px' }}>Kcal</sup>
                    <br />
                    <span className="muted" style={{ fontSize: '11px' }}>{locale === 'bn' ? 'দৈনিক লক্ষ্য' : 'Daily target'}</span>
                  </p>
                </div>
                <p className="font-display" style={{ fontSize: '3rem', fontWeight: '800', margin: '24px 0 0 0', color: 'var(--color-text)' }}>
                  {locale === 'bn' ? (nutrition?.totals?.calories_kcal || 1430).toLocaleString('bn-BD') : (nutrition?.totals?.calories_kcal || 1430)}{' '}
                  <span style={{ fontSize: '1.5rem', color: 'var(--color-muted)', fontWeight: '400' }}>/Kcal</span>
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-muted)', marginTop: '12px' }}>
                  <span>০</span>
                  <span>{locale === 'bn' ? (2200).toLocaleString('bn-BD') : '2,200'}</span>
                </div>
                <div style={{ height: '8px', overflow: 'hidden', borderRadius: '9999px', backgroundColor: 'var(--color-primary-dim)', marginTop: '6px' }}>
                  <div style={{ height: '100%', borderRadius: '9999px', backgroundImage: 'var(--gradient-primary)', width: `${Math.min(100, Math.round(((nutrition?.totals?.calories_kcal || 1430) / 2200) * 100))}%` }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '24px', textAlign: 'center' }}>
                  <div>
                    <p className="font-display" style={{ fontSize: '1.5rem', fontWeight: '700', margin: '0', color: 'var(--color-text)' }}>
                      {locale === 'bn' ? (nutrition?.totals?.protein_g || 42).toLocaleString('bn-BD') : (nutrition?.totals?.protein_g || 42)}
                      <sup style={{ fontSize: '10px', color: 'var(--color-muted)' }}>g</sup>
                    </p>
                    <p className="muted" style={{ fontSize: '11px', marginTop: '4px' }}>Protein</p>
                  </div>
                  <div>
                    <p className="font-display" style={{ fontSize: '1.1rem', fontWeight: '700', margin: '0', color: 'var(--color-warning)', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                      <AlertTriangle className="h-4 w-4" />{locale === 'bn' ? 'কম' : 'Low'}
                    </p>
                    <p className="muted" style={{ fontSize: '11px', marginTop: '4px' }}>Iron</p>
                  </div>
                  <div>
                    <p className="font-display" style={{ fontSize: '1.1rem', fontWeight: '700', margin: '0', color: 'var(--color-warning)', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                      <AlertTriangle className="h-4 w-4" />{locale === 'bn' ? 'কম' : 'Low'}
                    </p>
                    <p className="muted" style={{ fontSize: '11px', marginTop: '4px' }}>Folate</p>
                  </div>
                  <div>
                    <p className="font-display" style={{ fontSize: '1.5rem', fontWeight: '700', margin: '0', color: 'var(--color-text)' }}>
                      {locale === 'bn' ? (nutrition?.totals?.fat_g || 18).toLocaleString('bn-BD') : (nutrition?.totals?.fat_g || 18)}
                      <sup style={{ fontSize: '10px', color: 'var(--color-muted)' }}>g</sup>
                    </p>
                    <p className="muted" style={{ fontSize: '11px', marginTop: '4px' }}>Fat</p>
                  </div>
                </div>
                <Link to="/patient/nutrition" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: '600', color: 'var(--color-primary)', marginTop: '24px' }}>
                  <span>{locale === 'bn' ? 'সম্পূর্ণ পুষ্টি পরিকল্পনা' : 'Full nutrition plan'}</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Health summary */}
            <section className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--color-muted)', margin: '0' }}>
                  {locale === 'bn' ? 'স্বাস্থ্য সারাংশ — আজ' : 'Health Summary — Today'}
                </p>
                <Link to="/patient/daily-check" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: '600', color: 'var(--color-primary)' }}>
                  <span>{locale === 'bn' ? 'ট্র্যাকার দেখুন' : 'View tracker'}</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid-vitals">
                {[
                  { icon: Activity, value: bpValue, label: 'BP MMHG' },
                  { icon: Scale, value: weightValue, label: locale === 'bn' ? 'ওজন' : 'Weight' },
                  { icon: Thermometer, value: tempValue, label: locale === 'bn' ? 'তাপমাত্রা' : 'Temp' },
                  { icon: Ruler, value: bmiValue, label: 'BMI' }
                ].map((v) => {
                  const Icon = v.icon
                  return (
                    <div key={v.label} style={{ borderRadius: '16px', backgroundColor: 'var(--color-primary-dim)', padding: '20px', textAlign: 'center' }}>
                      <Icon className="h-6 w-6" style={{ margin: '0 auto', color: 'var(--color-primary)' }} />
                      <p className="font-display" style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary)', marginTop: '8px', marginBottom: '4px' }}>
                        {locale === 'bn' ? v.value.toLocaleString('bn-BD') : v.value}
                      </p>
                      <p style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--color-muted)', margin: '0' }}>
                        {v.label}
                      </p>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Medication + Hydration */}
            <div className="grid-2">
              {/* Medication */}
              <div className="card" style={{ padding: '24px' }}>
                <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--color-muted)', margin: '0' }}>
                  Medication
                </p>
                <h4 className="font-display" style={{ fontSize: '1.5rem', fontWeight: '700', margin: '4px 0 0 0', color: 'var(--color-text)' }}>
                  {locale === 'bn' ? 'আজকের রিমাইন্ডার' : "Today's Reminders"}
                </h4>
                <p className="muted" style={{ margin: '8px 0 20px 0', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                  {locale === 'bn' 
                    ? `${dueMedications.length.toLocaleString('bn-BD')}টি ওষুধ বাকি · ১টি এখনই প্রদেয়` 
                    : `${dueMedications.length} medications · 1 due now`}
                </p>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '0', padding: '0' }}>
                  {dueMedications.map((med) => (
                    <li
                      key={med.name}
                      style={{ display: 'flex', alignItems: 'center', justifyBox: 'space-between', justifyContent: 'space-between', borderRadius: '16px', border: med.borderCls, backgroundColor: med.bgCls, padding: '12px 16px' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ height: '8px', width: '8px', borderRadius: '50%', backgroundColor: med.dotColor }} />
                        <div>
                          <p style={{ fontWeight: '600', color: 'var(--color-text)', fontSize: '14px', margin: '0' }}>{med.name}</p>
                          <p className="muted" style={{ fontSize: '12px', marginTop: '2px', color: 'var(--color-text-secondary)', margin: '0' }}>{med.timeText}</p>
                        </div>
                      </div>
                      <span style={{ borderRadius: '9999px', backgroundColor: med.badgeColor, padding: '4px 12px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: med.badgeTextColor }}>
                        {med.statusText}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link to="/patient/medicine-check" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: '600', color: 'var(--color-primary)', marginTop: '20px' }}>
                  <span>{locale === 'bn' ? 'সব ওষুধ' : 'All medications'}</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Hydration */}
              <div className="card" style={{ padding: '24px' }}>
                <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--color-muted)', margin: '0' }}>
                  Hydration
                </p>
                <h4 className="font-display" style={{ fontSize: '1.5rem', fontWeight: '700', margin: '4px 0 0 0', color: 'var(--color-text)' }}>
                  {locale === 'bn' ? 'জল পান' : 'Water Intake'}
                </h4>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '20px' }}>
                  <p className="font-display" style={{ fontSize: '3rem', fontWeight: '800', margin: '0', color: 'var(--color-text)' }}>
                    {locale === 'bn' ? (wellness?.water?.total_ml ? Math.round(wellness.water.total_ml / 250).toLocaleString('bn-BD') : '৪') : (wellness?.water?.total_ml ? Math.round(wellness.water.total_ml / 250) : '4')}{' '}
                    <span style={{ fontSize: '14px', color: 'var(--color-muted)', fontWeight: '400', fontFamily: 'var(--font-sans)' }}>
                      {locale === 'bn' ? 'গ্লাস' : 'glasses'}
                    </span>
                  </p>
                  <p className="muted" style={{ fontSize: '14px', margin: '0' }}>
                    {locale === 'bn' ? 'লক্ষ্য: ১০ / প্রতিদিন' : 'Goal: 10 / day'}
                  </p>
                </div>
                <div style={{ height: '8px', overflow: 'hidden', borderRadius: '9999px', backgroundColor: 'var(--color-primary-dim)', marginTop: '16px' }}>
                  <div style={{ height: '100%', borderRadius: '9999px', backgroundColor: '#38bdf8', width: `${wellness?.water?.hydration_pct || 40}%` }} />
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', borderRadius: '9999px', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '6px 12px', fontSize: '12px', fontWeight: '600', color: 'var(--color-warning)', marginTop: '16px' }}>
                  <AlertTriangle className="h-4 w-4" />
                  <span>{locale === 'bn' ? 'কম — আরও পান করুন' : 'Low — drink more'}</span>
                </div>
                <Link to="/patient/wellness" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: '600', color: 'var(--color-primary)', marginTop: '20px' }}>
                  <span>{locale === 'bn' ? 'জল ট্র্যাকার' : 'Hydration tracker'}</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Floating SOS button */}
            <Link
              to="/patient/emergency"
              aria-label="Emergency SOS"
              className="sos-floating-btn"
            >
              <span className="sos-floating-btn-ping" />
              <span className="sos-floating-btn-ring" />
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1' }}>
                <PhoneCall className="h-5 w-5" />
                <span style={{ marginTop: '2px', fontSize: '10px', fontWeight: '700', letterSpacing: '0.18em' }}>SOS</span>
              </span>
            </Link>
          </>
        )}
      </div>
    </MobileLayout>
  )
}
