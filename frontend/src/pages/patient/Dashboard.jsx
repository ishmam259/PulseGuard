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
  MessageCircle,
  Flower2,
  PhoneCall,
  HeartPulse,
  CheckCircle2,
  Sparkles,
  Shield
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
  const [previewDashboard, setPreviewDashboard] = useState(false)

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
  const dueMedications = allMedications.filter((med) => med.status !== "done");

  // Calculate nutrition target values and percentages for circular charts
  const proteinVal = nutrition?.totals?.protein_g ?? 42;
  const proteinTarget = nutrition?.rda?.protein_g || 71;
  const proteinPct = Math.round((proteinVal / proteinTarget) * 100);

  const ironVal = nutrition?.totals?.iron_mg ?? 0;
  const ironTarget = nutrition?.rda?.iron_mg || 27;
  const ironPct = Math.round((ironVal / ironTarget) * 100);

  const folateVal = nutrition?.totals?.folic_acid_mcg ?? 0;
  const folateTarget = nutrition?.rda?.folic_acid_mcg || 600;
  const folatePct = Math.round((folateVal / folateTarget) * 100);

  const fatVal = nutrition?.totals?.fat_g ?? 18;
  const fatTarget = nutrition?.rda?.fat_g || 65;
  const fatPct = Math.round((fatVal / fatTarget) * 100);

  const nutrientsData = [
    {
      label: locale === 'bn' ? 'প্রোটিন' : 'Protein',
      value: `${proteinVal}g`,
      pct: proteinPct,
      isLow: proteinPct < 70,
    },
    {
      label: locale === 'bn' ? 'আয়রন' : 'Iron',
      value: ironPct < 70 ? (locale === 'bn' ? 'কম' : 'Low') : `${ironVal}mg`,
      pct: ironPct,
      isLow: ironPct < 70,
    },
    {
      label: locale === 'bn' ? 'ফোলেট' : 'Folate',
      value: folatePct < 70 ? (locale === 'bn' ? 'কম' : 'Low') : `${folateVal}mcg`,
      pct: folatePct,
      isLow: folatePct < 70,
    },
    {
      label: locale === 'bn' ? 'ফ্যাট' : 'Fat',
      value: `${fatVal}g`,
      pct: fatPct,
      isLow: fatPct < 70,
    }
  ];

  const showOnboardingWelcome = !patient && !previewDashboard;

  return (
    <MobileLayout
      title={
        showOnboardingWelcome ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {locale === 'bn' ? 'স্বাগতম' : 'Welcome'}
            <span style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-primary)', letterSpacing: '0.08em', marginTop: '4px' }}>
              {locale === 'bn' ? ' · শুরু করুন' : ' · GET STARTED'}
            </span>
          </span>
        ) : $('PAGE_TITLE_DASHBOARD', locale)
      }
      status={connectivity}
      navItems={patientNavItems(locale)}
      hideSubtitle={showOnboardingWelcome}
    >
      <div className="animate-fade-in premium-dashboard">
        {loading ? (
          <div className="card text-center" style={{ padding: '3rem 2rem' }}>
            <p className="muted animate-pulse">{$('DASH_LOADING', locale)}</p>
          </div>
        ) : showOnboardingWelcome ? (
          /* Profile incomplete welcome state */
          <>
            <div className="premium-dashboard-hero animate-fade-in" style={{ padding: 'clamp(20px, 5vw, 40px)', position: 'relative' }}>
              <div className="welcome-grid-layout">
                {/* Left Column: text and actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 1 }}>
                  <div className="welcome-badge-sparkle">
                    <Sparkles />
                    <span>{locale === 'bn' ? 'এখানে নতুন' : 'NEW HERE'}</span>
                  </div>
                  <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem, 6vw, 3rem)', fontWeight: '800', lineHeight: '1.1', margin: '0 0 16px 0', color: 'var(--color-text)' }}>
                    {locale === 'bn' ? 'স্বাগতম, ' : 'Welcome, '}
                    <span className="italic" style={{ color: 'var(--color-primary)', fontWeight: '800' }}>
                      {currentUser?.name?.split(' ')[0] || (locale === 'bn' ? 'মা' : 'Mother')}
                    </span>
                  </h2>
                  <p className="muted" style={{ fontSize: '16px', lineHeight: '1.6', color: 'var(--color-text-secondary)', margin: '0 0 16px 0', maxWidth: '540px' }}>
                    {locale === 'bn' 
                      ? 'আপনার অ্যাকাউন্ট প্রস্তুত! ভাইটাল ট্র্যাকিং, এআই স্বাস্থ্য পরীক্ষা এবং আপনার সপ্তাহের জন্য তৈরি ব্যক্তিগতকৃত পরিকল্পনা আনলক করতে আপনার গর্ভাবস্থার প্রোফাইল সম্পন্ন করুন।'
                      : 'Your account is ready. Complete your pregnancy profile to unlock vitals tracking, AI health checks, and a personalised plan made for your week.'}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', margin: '8px 0 24px 0' }}>
                    <button
                      type="button"
                      className="btn btn--primary"
                      style={{
                        borderRadius: '9999px',
                        padding: '12px 28px',
                        fontWeight: '700',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: 'var(--shadow-glow-primary)'
                      }}
                      onClick={() => navigate('/patient/onboarding')}
                    >
                      <CheckCircle2 className="h-4 w-4" style={{ color: '#fff' }} />
                      <span>{locale === 'bn' ? 'আমার প্রোফাইল সম্পন্ন করুন' : 'Complete my profile'}</span>
                    </button>
                    <button
                      type="button"
                      className="btn"
                      style={{
                        borderRadius: '9999px',
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-text-secondary)',
                        padding: '12px 28px',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => setPreviewDashboard(true)}
                    >
                      <span>{locale === 'bn' ? 'আপাতত বাদ দিন' : 'Skip for now'}</span>
                      <span>→</span>
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-muted)' }}>
                    <Shield className="h-4 w-4" style={{ color: 'var(--color-success)' }} />
                    <span>
                      {locale === 'bn'
                        ? 'আপনার ডেটা এনক্রিপ্ট করা এবং কখনও শেয়ার করা হবে না।'
                        : 'Your data is encrypted and never shared.'}
                    </span>
                  </div>
                </div>

                {/* Right Column: floating icon container */}
                <div className="welcome-glow-container">
                  {/* Glowing Blob */}
                  <div style={{ position: 'absolute', height: '180px', width: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(244, 63, 94, 0.4) 0%, transparent 70%)', filter: 'blur(30px)', zIndex: 0 }} />
                  
                  {/* Floating Box */}
                  <div className="welcome-float-card">
                    <div style={{
                      height: '80px',
                      width: '80px',
                      borderRadius: '20px',
                      backgroundImage: 'var(--gradient-primary)',
                      boxShadow: 'var(--shadow-glow-primary)',
                      display: 'grid',
                      placeItems: 'center',
                      color: '#fff'
                    }}>
                      <HeartPulse className="h-10 w-10" strokeWidth={2.2} style={{ color: '#fff' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom 3 Quick Steps Section */}
            <div className="steps-container animate-fade-in">
              <h3 className="steps-heading">{locale === 'bn' ? '৩টি সহজ ধাপ' : '3 QUICK STEPS'}</h3>
              <div className="steps-grid">
                <div className="step-card">
                  <span className="step-number">1</span>
                  <p className="step-title">{locale === 'bn' ? 'প্রাথমিক তথ্য' : 'Basic details'}</p>
                </div>
                <div className="step-card">
                  <span className="step-number">2</span>
                  <p className="step-title">{locale === 'bn' ? 'গর্ভাবস্থার সপ্তাহ' : 'Pregnancy week'}</p>
                </div>
                <div className="step-card">
                  <span className="step-number">3</span>
                  <p className="step-title">{locale === 'bn' ? 'স্বাস্থ্যের ইতিহাস' : 'Health history'}</p>
                </div>
              </div>
            </div>
          </>
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
                })()}
              </h2>
              <p className="muted" style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                {locale === 'bn' ? 'আজকের গর্ভাবস্থা ও স্বাস্থ্য সারাংশ দেখুন।' : "Check out today's pregnancy & health overview."}
              </p>
            </div>

            {/* Pregnancy hero */}
            <section className="premium-dashboard-hero">
              <div className="premium-dashboard-hero-grid">
                <div>
                  <h3 className="font-display" style={{ fontSize: 'clamp(1.6rem, 5vw, 2.8rem)', lineHeight: '1.1', fontWeight: '800', margin: '0', color: 'var(--color-text)' }}>
                    {locale === 'bn' ? 'আপনার যাত্রা,' : 'Your journey,'}<br />
                    <span className="italic text-gradient-primary">{locale === 'bn' ? 'সপ্তাহে সপ্তাহে।' : 'week by week.'}</span>
                  </h3>
                  <Link
                    to="/patient/calendar"
                    className="premium-dashboard-hero-play-btn"
                  >
                    <span>{locale === 'bn' ? 'কী পরিবর্তন হচ্ছে?' : "What's changing?"}</span>
                    <ChevronRight className="h-4 w-4" style={{ marginLeft: '4px' }} />
                  </Link>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'flex-end' }}>
                    <span className="font-display" style={{ fontSize: 'clamp(3rem, 12vw, 6rem)', fontWeight: '800', lineHeight: '1', color: 'var(--color-text)' }}>
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

            {/* Daily Tips */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--color-muted)', margin: '0' }}>
                  {locale === 'bn' ? 'দৈনিক টিপস — ওয়েলনেস হাব' : 'Daily Tips — Wellness Hub'}
                </p>
                <Link to="/patient/education" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: '600', color: 'var(--color-primary)' }}>
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
                      <p className="muted" style={{ fontSize: '13.5px', lineHeight: '1.6', color: 'var(--color-text-secondary)' }}>{tip.body}</p>
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
                  <span className="premium-icon-badge-accent">
                    <MessageCircle className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="font-display" style={{ fontSize: '1.2rem', fontWeight: '700', margin: '0', color: 'var(--color-text)' }}>{locale === 'bn' ? 'এআই চ্যাট' : 'AI Chat'}</p>
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
                <div className="grid-macros">
                  {nutrientsData.map((nut) => {
                    const radius = 24;
                    const strokeWidth = 5;
                    const circumference = 2 * Math.PI * radius;
                    const cleanPct = Math.min(100, Math.max(0, nut.pct || 0));
                    const strokeDashoffset = circumference - (cleanPct / 100) * circumference;

                    return (
                      <div
                        key={nut.label}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          textAlign: "center",
                        }}
                      >
                        {/* Circular progress SVG */}
                        <div style={{ position: "relative", width: "56px", height: "56px" }}>
                          <svg
                            width="56"
                            height="56"
                            viewBox="0 0 56 56"
                            style={{ transform: "rotate(-90deg)" }}
                          >
                            {/* Track circle */}
                            <circle
                              cx="28"
                              cy="28"
                              r={radius}
                              fill="transparent"
                              stroke={nut.isLow ? "var(--color-warning-dim)" : "var(--color-primary-dim)"}
                              strokeWidth={strokeWidth}
                            />
                            {/* Progress fill circle */}
                            <circle
                              cx="28"
                              cy="28"
                              r={radius}
                              fill="transparent"
                              stroke={nut.isLow ? "var(--color-warning)" : "var(--color-primary)"}
                              strokeWidth={strokeWidth}
                              strokeDasharray={circumference}
                              strokeDashoffset={strokeDashoffset}
                              strokeLinecap="round"
                              style={{
                                transition: "stroke-dashoffset 0.5s ease-in-out",
                              }}
                            />
                          </svg>
                          {/* Inner element: AlertTriangle icon if low, percentage if normal */}
                          <div
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {nut.isLow ? (
                              <AlertTriangle
                                className="h-4 w-4"
                                style={{ color: "var(--color-warning)" }}
                              />
                            ) : (
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  color: "var(--color-text)",
                                }}
                              >
                                {cleanPct}%
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Value label */}
                        <p
                          className="font-display"
                          style={{
                            fontSize: "1.25rem",
                            fontWeight: "700",
                            margin: "12px 0 2px 0",
                            color: nut.isLow ? "var(--color-warning)" : "var(--color-text)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "2px",
                          }}
                        >
                          {nut.value}
                        </p>

                        {/* Label name */}
                        <p
                          className="muted"
                          style={{
                            fontSize: "11px",
                            margin: "0",
                            fontWeight: "600",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          {nut.label}
                        </p>
                      </div>
                    );
                  })}
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
              <div className="card" style={{ padding: "24px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: "0.18em",
                        color: "var(--color-muted)",
                        margin: "0",
                      }}
                    >
                      {locale === "bn" ? "হাইড্রেশন" : "Hydration"}
                    </p>
                    <h4
                      className="font-display"
                      style={{
                        fontSize: "1.8rem",
                        fontWeight: "700",
                        margin: "4px 0 0 0",
                        color: "var(--color-text)",
                      }}
                    >
                      {locale === "bn" ? "জল পান" : "Water Intake"}
                    </h4>
                  </div>
                  <div
                    style={{
                      borderRadius: "9999px",
                      backgroundColor: "var(--color-primary-dim)",
                      padding: "6px 14px",
                      fontSize: "13px",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {locale === "bn" ? (
                      <>
                        লক্ষ্য:{" "}
                        <span
                          style={{
                            fontWeight: "700",
                            color: "var(--color-text)",
                          }}
                        >
                          ১০
                        </span>{" "}
                        / প্রতিদিন
                      </>
                    ) : (
                      <>
                        Goal:{" "}
                        <span
                          style={{
                            fontWeight: "700",
                            color: "var(--color-text)",
                          }}
                        >
                          10
                        </span>{" "}
                        / day
                      </>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "8px",
                    marginTop: "24px",
                  }}
                >
                  <span
                    className="font-display"
                    style={{
                      fontSize: "clamp(2rem, 7vw, 3.5rem)",
                      fontWeight: "800",
                      lineHeight: "1",
                      color: "var(--color-text)",
                    }}
                  >
                    {locale === "bn"
                      ? wellness?.water?.total_ml
                        ? Math.round(
                            wellness.water.total_ml / 250,
                          ).toLocaleString("bn-BD")
                        : "৪"
                      : wellness?.water?.total_ml
                        ? Math.round(wellness.water.total_ml / 250)
                        : "4"}
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      color: "var(--color-text-secondary)",
                      fontWeight: "400",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {locale === "bn" ? "গ্লাস" : "glasses"}
                  </span>
                </div>

                <div
                  style={{
                    height: "8px",
                    overflow: "hidden",
                    borderRadius: "9999px",
                    backgroundColor: "var(--color-primary-dim)",
                    marginTop: "20px",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      borderRadius: "9999px",
                      backgroundColor: "var(--color-primary)",
                      width: `${wellness?.water?.hydration_pct || 40}%`,
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    borderRadius: "9999px",
                    backgroundColor: "rgba(249, 115, 22, 0.08)",
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#ea580c",
                    marginTop: "16px",
                  }}
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span>
                    {locale === "bn" ? "কম — আরও পান করুন" : "Low — drink more"}
                  </span>
                </div>

                <div>
                  <Link
                    to="/patient/wellness"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "var(--color-primary)",
                      marginTop: "20px",
                    }}
                  >
                    <span>
                      {locale === "bn" ? "জল ট্র্যাকার" : "Hydration tracker"}
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </MobileLayout>
  )
}
