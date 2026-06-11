import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Reveal from '../components/landing/Reveal'

function GuidelinesNav() {
  const { theme, toggleTheme, locale, setLocale } = useApp()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`about-nav${scrolled ? ' about-nav--scrolled' : ''}`}>
      <Link to="/" className="about-nav-logo">
        <svg viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <rect width="28" height="28" rx="8" fill="oklch(0.62 0.22 0)" />
          <path d="M4 14h4l2.5-5 3 10 2.5-7L18 14h6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        PulseGuard
      </Link>
      <div className="about-nav-actions">
        <button className="about-nav-icon-btn" onClick={() => setLocale(locale === 'en' ? 'bn' : 'en')} aria-label="Toggle language">
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.02em' }}>{locale === 'en' ? 'বাং' : 'EN'}</span>
        </button>
        <button className="about-nav-icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        <Link to="/role" className="about-nav-btn about-nav-btn--primary">
          {locale === 'en' ? 'Get started' : 'শুরু করুন'}
        </Link>
      </div>
    </header>
  )
}

const NOTICE_ITEMS = [
  { en: 'Do not use for emergency diagnosis', bn: 'জরুরি রোগ নির্ণয়ে ব্যবহার করবেন না' },
  { en: 'AI scores are indicative, not conclusive', bn: 'AI স্কোর ইঙ্গিতমূলক, চূড়ান্ত নয়' },
  { en: 'Verify vitals entry before assessment', bn: 'মূল্যায়নের আগে ভাইটাল এন্ট্রি যাচাই করুন' },
  { en: 'Patient consent is required for data collection', bn: 'ডেটা সংগ্রহে রোগীর সম্মতি প্রয়োজন' },
]

const WORKER_ITEMS = [
  { en: 'Complete all vitals fields for accurate risk scoring', bn: 'সঠিক ঝুঁকি স্কোরের জন্য সমস্ত ভাইটাল ফিল্ড পূরণ করুন' },
  { en: 'Re-assess patients flagged High Risk within 24 hours', bn: 'উচ্চ-ঝুঁকি চিহ্নিত রোগীদের ২৪ ঘণ্টার মধ্যে পুনরায় মূল্যায়ন করুন' },
  { en: 'Sync data when connectivity is available', bn: 'সংযোগ পাওয়া গেলে ডেটা সিঙ্ক করুন' },
  { en: 'Report app anomalies via the in-app feedback channel', bn: 'অ্যাপের মাধ্যমে যেকোনো অস্বাভাবিকতা রিপোর্ট করুন' },
]

const PATIENT_ITEMS = [
  { en: 'Your risk score is a guide, not a final verdict', bn: 'আপনার ঝুঁকি স্কোর একটি নির্দেশিকা, চূড়ান্ত রায় নয়' },
  { en: 'Share your full medical history with your health worker', bn: 'আপনার স্বাস্থ্যকর্মীর সাথে পূর্ণ চিকিৎসা ইতিহাস শেয়ার করুন' },
  { en: 'Seek emergency care immediately for chest pain, heavy bleeding, or seizures', bn: 'বুকে ব্যথা, অতিরিক্ত রক্তক্ষরণ বা খিঁচুনির জন্য তাৎক্ষণিক জরুরি যত্ন নিন' },
  { en: 'Your data is encrypted and never sold to third parties', bn: 'আপনার ডেটা এনক্রিপ্টেড এবং তৃতীয় পক্ষের কাছে কখনও বিক্রি হয় না' },
]

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }}>
      <circle cx="8" cy="8" r="7.5" fill="oklch(1 0 0 / 0.18)" stroke="oklch(1 0 0 / 0.25)" />
      <path d="M4.5 8.5l2.5 2.5 4.5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BulletIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: 3 }}>
      <circle cx="8" cy="8" r="7.5" fill="var(--color-primary-dim)" />
      <path d="M4.5 8.5l2.5 2.5 4.5-5" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Guidelines() {
  const { locale } = useApp()
  const t = (en, bn) => locale === 'en' ? en : bn

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <GuidelinesNav />

      <main>
        {/* Hero */}
        <section className="gl-hero">
          <div className="gl-hero-inner">
            <Reveal>
              <span className="gl-eyebrow">{t('Usage Guidelines', 'ব্যবহারের নির্দেশিকা')}</span>
              <div className="gl-eyebrow-rule" aria-hidden="true" />
              <h1 className="gl-title">
                {t('Clinical Guidelines', 'ক্লিনিকাল নির্দেশিকা')}<br />
                <em>{t('& Disclaimers.', 'ও দায়মুক্তি।')}</em>
              </h1>
              <p className="gl-subtitle">
                {t(
                  'PulseGuard is a decision-support tool designed to assist trained health workers. The following guidelines govern its responsible and safe use across all clinical settings.',
                  'PulseGuard একটি সিদ্ধান্ত-সহায়তা সরঞ্জাম যা প্রশিক্ষিত স্বাস্থ্যকর্মীদের সহায়তার জন্য ডিজাইন করা হয়েছে। নিম্নলিখিত নির্দেশিকাগুলি সকল ক্লিনিকাল পরিবেশে এর দায়িত্বশীল ব্যবহার পরিচালনা করে।'
                )}
              </p>
            </Reveal>
          </div>
        </section>

        {/* Critical Notice */}
        <section className="gl-notice-section">
          <div className="gl-notice-inner">
            <Reveal>
              <div className="gl-notice">
                <div className="gl-notice-header">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true" className="gl-notice-icon">
                    <path d="M14 3L26 24H2L14 3Z" fill="oklch(1 0 0 / 0.15)" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M14 11v6M14 20v1" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <h2 className="gl-notice-title">
                    {t('Important Medical Disclaimer', 'গুরুত্বপূর্ণ চিকিৎসা দায়মুক্তি')}
                  </h2>
                </div>
                <p className="gl-notice-body">
                  {t(
                    'PulseGuard provides risk scoring and decision support only. It is not a diagnostic tool and does not replace the clinical judgement of licensed medical professionals. Always escalate high-risk cases to a qualified physician or specialist.',
                    'PulseGuard শুধুমাত্র ঝুঁকি স্কোরিং এবং সিদ্ধান্ত সহায়তা প্রদান করে। এটি একটি ডায়াগনস্টিক সরঞ্জাম নয় এবং লাইসেন্সপ্রাপ্ত চিকিৎসা পেশাদারদের ক্লিনিকাল বিচারের বিকল্প নয়।'
                  )}
                </p>
                <div className="gl-notice-grid">
                  {NOTICE_ITEMS.map((item, i) => (
                    <div key={i} className="gl-notice-item">
                      <CheckIcon />
                      <span>{t(item.en, item.bn)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Two-column cards */}
        <section className="gl-cards-section">
          <div className="gl-cards-inner">
            <div className="gl-cards">

              {/* Card A: Health Workers */}
              <Reveal delay={0.05}>
                <div className="gl-card">
                  <div className="gl-card-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" fill="var(--color-primary)" />
                    </svg>
                  </div>
                  <h3 className="gl-card-title">{t('For Health Workers', 'স্বাস্থ্যকর্মীদের জন্য')}</h3>
                  <p className="gl-card-sub">{t('Professional usage guidelines', 'পেশাদার ব্যবহারের নির্দেশিকা')}</p>
                  <ul className="gl-card-list">
                    {WORKER_ITEMS.map((item, i) => (
                      <li key={i} className="gl-card-item">
                        <BulletIcon />
                        <span>{t(item.en, item.bn)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              {/* Card B: Patients */}
              <Reveal delay={0.12}>
                <div className="gl-card">
                  <div className="gl-card-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" fill="var(--color-primary)" />
                    </svg>
                  </div>
                  <h3 className="gl-card-title">{t('For Patients & Families', 'রোগী ও পরিবারের জন্য')}</h3>
                  <p className="gl-card-sub">{t('Understanding your health data', 'আপনার স্বাস্থ্য ডেটা বোঝা')}</p>
                  <ul className="gl-card-list">
                    {PATIENT_ITEMS.map((item, i) => (
                      <li key={i} className="gl-card-item">
                        <BulletIcon />
                        <span>{t(item.en, item.bn)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

            </div>
          </div>
        </section>

        {/* Privacy block */}
        <section className="gl-privacy">
          <div className="gl-privacy-inner">
            <Reveal delay={0.1}>
              <div className="gl-privacy-card">
                <p className="gl-privacy-text">
                  {t(
                    'All patient data collected by PulseGuard is stored encrypted on-device and synced only over authenticated secure channels. PulseGuard complies with Bangladesh DGDA digital health guidelines and WHO maternal health data standards.',
                    'PulseGuard কর্তৃক সংগৃহীত সকল রোগী ডেটা ডিভাইসে এনক্রিপ্টেড এবং শুধুমাত্র প্রমাণীকৃত সুরক্ষিত চ্যানেলের মাধ্যমে সিঙ্ক করা হয়। PulseGuard বাংলাদেশ DGDA ডিজিটাল স্বাস্থ্য নির্দেশিকা এবং WHO মাতৃস্বাস্থ্য ডেটা মান মেনে চলে।'
                  )}
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* CTA strip */}
        <section className="gl-cta">
          <Reveal>
            <h2 className="gl-cta-heading">
              {t('Ready to make a difference?', 'পরিবর্তন আনতে প্রস্তুত?')}
            </h2>
            <p className="gl-cta-sub">
              {t('Join health workers across Bangladesh using PulseGuard to protect mothers.', 'বাংলাদেশ জুড়ে মায়েদের সুরক্ষায় PulseGuard ব্যবহারকারী স্বাস্থ্যকর্মীদের সাথে যোগ দিন।')}
            </p>
            <div className="gl-cta-buttons">
              <Link to="/role" className="about-impact-btn about-impact-btn--primary">
                {t('Get started →', 'শুরু করুন →')}
              </Link>
              <Link to="/" className="about-impact-btn about-impact-btn--ghost">
                {t('Back to home', 'হোমে ফিরুন')}
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="about-footer">
        <Link to="/" className="about-footer-brand">PulseGuard &copy; 2025</Link>
        <nav className="about-footer-links">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/guidelines">Guidelines</Link>
          <Link to="/role">Get started</Link>
        </nav>
      </footer>
    </div>
  )
}
