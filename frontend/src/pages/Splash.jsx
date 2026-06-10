import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import $ from '../config/strings'
import { ArrowRight, ShieldAlert, HeartPulse, Moon, Sun, Sparkles, WifiOff, Activity, Layers, Radio } from 'lucide-react'

export default function Splash() {
  const { theme, toggleTheme, locale, setLocale } = useApp()

  const t = (en, bn) => (locale === 'en' ? en : bn)

  const stats = [
    { value: '97%', label: t('Risk accuracy', 'ঝুঁকি নির্ভুলতা') },
    { value: '0', label: t('Internet required', 'ইন্টারনেট প্রয়োজন') },
    { value: '12k+', label: t('Mothers served', 'সেবা প্রাপ্ত মা') },
  ]

  return (
    <main className="landing-wrapper">
      {/* Background ambient accents */}
      <div className="landing-background-glows">
        <div className="mesh-gradient" />
        <div className="glow-circle glow-circle-1" />
        <div className="glow-circle glow-circle-2" />
      </div>

      {/* Sticky Top Header Bar */}
      <div className="landing-header-sticky-wrapper">
        <header className="landing-header-container">
          <Link to="/" className="landing-header-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ textDecoration: 'none' }}>
            <span className="landing-header-logo-circle" style={{ display: 'grid', placeItems: 'center', width: '32px', height: '32px', borderRadius: '10px', backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}>
              <HeartPulse className="h-5 w-5" strokeWidth={2.5} style={{ color: 'var(--color-surface)' }} />
            </span>
            <span className="landing-header-logo-text">PulseGuard</span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-border bg-surface/60 p-1 text-sm backdrop-blur md:flex" style={{ display: 'flex', gap: '8px', border: '1px solid var(--color-border)', backgroundColor: 'color-mix(in oklab, var(--color-surface) 60%, transparent)', padding: '4px 16px', borderRadius: '9999px', backdropFilter: 'blur(8px)' }}>
            <a href="#features" className="rounded-full px-4 py-1.5 text-muted-foreground transition hover:text-foreground" style={{ textDecoration: 'none', color: 'var(--color-text-secondary)', fontSize: '13px', fontWeight: '500' }}>
              {t("Features", "ফিচার")}
            </a>
            <a href="#trust" className="rounded-full px-4 py-1.5 text-muted-foreground transition hover:text-foreground" style={{ textDecoration: 'none', color: 'var(--color-text-secondary)', fontSize: '13px', fontWeight: '500' }}>
              {t("Trust", "বিশ্বাস")}
            </a>
          </nav>

          <div className="landing-header-actions">
            <button
              type="button"
              onClick={() => setLocale(prev => prev === 'en' ? 'bn' : 'en')}
              className="landing-header-lang-toggle"
            >
              {locale === 'en' ? 'বাংলা' : 'English'}
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="landing-header-theme-btn"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <Link to="/role" className="landing-header-signin-btn">
              {t('Sign In', 'সাইন ইন')}
            </Link>
          </div>
        </header>
      </div>

      {/* Hero Section */}
      <section className="landing-hero-centered" style={{ marginTop: '72px' }}>
        <div className="landing-hero-badge">
          <Sparkles className="h-3.5 w-3.5" style={{ color: 'var(--color-primary)' }} />
          <span>{t('Built for last-mile maternal care', 'প্রান্তিক মাতৃসেবার জন্য তৈরি')}</span>
        </div>

        <h1 className="landing-headline-centered">
          {locale === 'en' ? (
            <>
              AI-Native
              <br />
              <span className="italic text-gradient-primary">Maternal Healthcare</span>
              <br />
              for every mother.
            </>
          ) : (
            <>
              এআই-নেটিভ
              <br />
              <span className="italic text-gradient-primary">মাতৃস্বাস্থ্য সেবা</span>
              <br />
              প্রতিটি মায়ের জন্য।
            </>
          )}
        </h1>

        <p className="landing-description-centered">
          {$('SPLASH_SUBLINE', locale)}
        </p>

        <div className="landing-cta-row" style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '40px' }}>
          <Link 
            to="/role" 
            className="btn btn--primary btn--landing-primary"
          >
            <span>{$('SPLASH_CTA', locale).replace(' →', '')}</span>
            <ArrowRight className="h-4 w-4" style={{ marginLeft: '6px' }} />
          </Link>
          <button type="button" className="btn btn--demo">
            {t("Watch demo", "ডেমো দেখুন")}
          </button>
        </div>
      </section>

      {/* Stat strip — editorial horizontal bar */}
      <section className="landing-stats-strip">
        <div className="landing-stats-container">
          <div className="landing-stats-grid">
            {stats.map((s) => (
              <div key={s.label} className="landing-stat-item">
                <span className="landing-stat-num">{s.value}</span>
                <span className="landing-stat-txt">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features & Disclaimer Section */}
      <section className="landing-features-section" id="features">
        <div className="landing-features-title-row">
          <h2>{t("Why PulseGuard", "কেন PulseGuard")}</h2>
          <div className="landing-features-title-underline" />
        </div>

        <div className="landing-asymmetric-grid">
          {/* Large feature card */}
          <div className="landing-feature-card-large">
            <div className="highlight-bar" />
            <div className="landing-feature-card-large-content">
              <div className="landing-feature-card-large-icon">
                <WifiOff className="h-6 w-6" />
              </div>
              <div>
                <h3 className="landing-feature-card-large-title">{t("Works entirely offline", "সম্পূর্ণ অফলাইনে কাজ করে")}</h3>
                <p className="landing-feature-card-large-body">
                  {t(
                    "Full functionality without connectivity. Data syncs automatically when a signal returns — no manual uploads, no lost records.",
                    "সংকেত ছাড়াই দূরবর্তী স্থানেও সম্পূর্ণ অফলাইনে কাজ করে এবং নেটওয়ার্ক থাকলে স্বয়ংক্রিয়ভাবে সিঙ্ক হয়।"
                  )}
                </p>
              </div>
            </div>
            <div className="landing-feature-card-large-footer">
              <span>
                <Layers className="h-4 w-4" />
                {t("Local SQLite", "লোকাল SQLite")}
              </span>
              <span>
                <Radio className="h-4 w-4" />
                {t("Auto-sync", "অটো-সিঙ্ক")}
              </span>
            </div>
          </div>

          {/* Stacked smaller cards */}
          <div className="landing-feature-column-right">
            <div className="landing-feature-card-small">
              <div className="landing-feature-card-small-icon-wrapper">
                <Activity className="h-5 w-5" />
              </div>
              <h4 className="landing-feature-card-small-title">{t("Risk triage", "ঝুঁকি ত্রিভাজ")}</h4>
              <p className="landing-feature-card-small-body">
                {t("On-device AI flags high-risk pregnancies in seconds, guiding health workers to the mothers who need care first.", "ডিভাইসেই এআই কয়েক সেকেন্ডে উচ্চ-ঝুঁকি চিহ্নিত করে ও তাৎক্ষণিক সিদ্ধান্ত গ্রহণে সাহায্য করে।")}
              </p>
            </div>

            <div className="landing-feature-card-small warning">
              <div className="landing-feature-card-small-icon-wrapper">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <h4 className="landing-feature-card-small-title">{$('SPLASH_DISCLAIMER_TITLE', locale)}</h4>
              <p className="landing-feature-card-small-body">
                {$('SPLASH_DISCLAIMER_BODY', locale)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section id="trust" className="landing-trust-bar">
        <div className="landing-trust-bar-container">
          <p className="landing-trust-text">
            {t("HIPAA-aware · End-to-end encrypted · Open-source core", "এইচআইপিএএ-সচেতন · এন্ড-টু-এন্ড এনক্রিপ্টেড · ওপেন-সোর্স কোর")}
          </p>
          <p className="landing-trust-text" suppressHydrationWarning>
            &copy; {new Date().getFullYear()} PulseGuard AI. {t("All rights reserved.", "সর্বস্বত্ব সংরক্ষিত।")}
          </p>
        </div>
      </section>

      {/* Footer */}
      <section style={{ position: 'relative', zIndex: 10, borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-elevated, var(--color-surface))' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
          <footer className="landing-footer-premium">
            <div className="landing-footer-logo">
              <div className="landing-footer-logo-circle">
                <div className="landing-footer-logo-inner-circle" />
              </div>
              <span className="landing-footer-logo-text">PulseGuard</span>
            </div>

            <div className="landing-footer-links">
              <a href="#privacy">{t('Privacy', 'গোপনীয়তা')}</a>
              <a href="#guidelines">{t('Clinical Guidelines', 'ক্লিনিকাল নির্দেশিকা')}</a>
              <a href="#support">{t('Support', 'সহায়তা')}</a>
            </div>

            <p className="landing-footer-copyright">
              {t('AI-native healthcare.', 'এআই-নেটিভ স্বাস্থ্যসেবা।')}
            </p>
          </footer>
        </div>
      </section>
    </main>
  )
}
