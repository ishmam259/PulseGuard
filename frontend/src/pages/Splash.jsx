import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion, useInView } from 'framer-motion';
import { useApp } from '../context/AppContext';
import $ from '../config/strings';
import WelcomeIntro from '../components/landing/WelcomeIntro';
import VitalsMonitor from '../components/landing/VitalsMonitor';
import SafariMock from '../components/landing/SafariMock';
import IPhoneMock from '../components/landing/IPhoneMock';
import Reveal from '../components/landing/Reveal';
import showcaseDesktop from '../assets/showcase-desktop2.png';
import { Pricing } from '../components/ui/pricing';
import showcaseMobile from '../assets/showcase-mobile.png';
import {
  ArrowRight,
  ShieldAlert,
  HeartPulse,
  Moon,
  Sun,
  Sparkles,
  Activity,
  Stethoscope,
  RefreshCw,
  BrainCircuit,
  Mic,
  MessageCircle,
  Siren,
  LineChart,
  Salad,
  Gauge,
  Droplet,
  Syringe,
  Clock,
  Zap,
  Baby,
  Brain,
  ShieldCheck,
  Quote,
} from 'lucide-react';

/* Count-up number that animates the first time it scrolls into view. */
function CountUp({ value }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [display, setDisplay] = useState(value);

  // Parse a leading number out of strings like "97%", "12k+", "0".
  const match = String(value).match(/^([\d.]+)(.*)$/);
  const target = match ? parseFloat(match[1]) : null;
  const suffix = match ? match[2] : '';
  const decimals = match && match[1].includes('.') ? 1 : 0;

  useEffect(() => {
    if (target === null) {
      setDisplay(value);
      return;
    }
    if (reduce || !inView) {
      setDisplay(reduce ? value : `0${suffix}`);
      if (reduce) return;
    }
    if (!inView) return;
    let raf;
    const start = performance.now();
    const dur = 1200;
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const n = (target * eased).toFixed(decimals);
      setDisplay(`${n}${suffix}`);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, target, suffix, decimals, value]);

  return <span ref={ref}>{display}</span>;
}

export default function Splash() {
  const { theme, toggleTheme, locale, setLocale } = useApp();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const t = (en, bn) => (locale === 'en' ? en : bn);

  // Scroll-aware sticky header (drops a stronger shadow once scrolled).
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const stats = [
    { value: '97%', label: t('Risk accuracy', 'ঝুঁকি নির্ভুলতা') },
    { value: '2', label: t('AI modes', 'এআই মোড') },
    { value: '12k+', label: t('Mothers served', 'সেবা প্রাপ্ত মা') },
  ];

  const steps = [
    {
      icon: <Stethoscope strokeWidth={2} />,
      title: t('Capture vitals', 'তথ্য সংগ্রহ'),
      body: t(
        'A health worker records blood pressure, symptoms and history in under a minute — on any low-end phone.',
        'একজন স্বাস্থ্যকর্মী এক মিনিটেই রক্তচাপ, উপসর্গ ও ইতিহাস লিপিবদ্ধ করেন — যেকোনো সাধারণ ফোনে।',
      ),
    },
    {
      icon: <BrainCircuit strokeWidth={2} />,
      title: t('On-device AI triage', 'ডিভাইসেই এআই ত্রিভাজ'),
      body: t(
        'The model scores pregnancy risk using RAG-augmented patient history and live vital signs — surfacing the highest-risk cases first.',
        'মডেলটি RAG-সমৃদ্ধ রোগীর ইতিহাস ও তাৎক্ষণিক ভাইটাল ব্যবহার করে ঝুঁকি নির্ণয় করে — সর্বোচ্চ ঝুঁকির রোগীকে সামনে আনে।',
      ),
    },
    {
      icon: <RefreshCw strokeWidth={2} />,
      title: t('Share with your care team', 'যত্ন দলের সাথে শেয়ার করুন'),
      body: t(
        'Records are instantly shared with the clinic and family — keeping every care team informed and in step.',
        'রেকর্ড সাথে সাথে ক্লিনিক ও পরিবারে শেয়ার হয় — প্রতিটি যত্ন দলকে সবসময় আপডেট রাখে।',
      ),
    },
  ];

  // Full capability set — every item maps to a real AI feature in the app.
  const capabilities = [
    {
      icon: <BrainCircuit strokeWidth={2} />,
      title: t('RAG-powered health chat', 'RAG-চালিত স্বাস্থ্য চ্যাট'),
      body: t(
        "Ask anything about your pregnancy and get answers grounded in your own medical history. PulseGuard's RAG engine retrieves relevant health records before every response.",
        'গর্ভাবস্থা সম্পর্কে যেকোনো প্রশ্ন করুন — উত্তর আসবে আপনার নিজের স্বাস্থ্য ইতিহাস থেকে। প্রতিটি উত্তরের আগে RAG ইঞ্জিন প্রাসঙ্গিক রেকর্ড খুঁজে নেয়।',
      ),
    },
    {
      icon: <Sparkles strokeWidth={2} />,
      title: t('Dual AI modes', 'দ্বৈত এআই মোড'),
      body: t(
        'Switch between Gemini AI for general guidance and RAG Pro mode for clinically grounded answers drawn strictly from verified patient context.',
        'সাধারণ পরামর্শের জন্য Gemini AI এবং ক্লিনিক্যালি নির্ভরযোগ্য উত্তরের জন্য RAG Pro মোডে স্যুইচ করুন।',
      ),
    },
    {
      icon: <Zap strokeWidth={2} />,
      title: t('Smart Device Integration', 'স্মার্ট ডিভাইস ইন্টিগ্রেশন'),
      body: t(
        'Connect PulseGuard to smartwatches, wearables, and health sensors via MCP. Reads live vitals directly from the device — heart rate, SpO₂, and movement — without manual entry.',
        'স্মার্টওয়াচ ও হেলথ সেন্সর থেকে MCP দিয়ে সরাসরি ভাইটাল পড়ে — হৃদস্পন্দন, SpO₂ ও নড়াচড়া — কোনো ম্যানুয়াল এন্ট্রি ছাড়াই।',
      ),
    },
    {
      icon: <Activity strokeWidth={2} />,
      title: t('Real-time risk scoring', 'তাৎক্ষণিক ঝুঁকি স্কোরিং'),
      body: t(
        'AI scores pregnancy risk in seconds from vitals and symptoms — flagging preeclampsia, anemia, and six other complications before they escalate.',
        'ভাইটাল ও উপসর্গ থেকে সেকেন্ডে গর্ভকালীন ঝুঁকি স্কোর করে — প্রি-একলাম্পসিয়া, রক্তস্বল্পতাসহ ছয়টি জটিলতা আগেভাগে চিহ্নিত করে।',
      ),
    },
    {
      icon: <Mic strokeWidth={2} />,
      title: t('Dual Voice Input for AI', 'এআইয়ের জন্য দ্বৈত ভয়েস ইনপুট'),
      body: t(
        'Speak symptoms in English or Bengali and the AI understands. No typing required — designed for mothers with limited literacy or mobility.',
        'বাংলা বা ইংরেজিতে উপসর্গ বলুন, এআই বুঝে নেবে। টাইপিং লাগবে না — সীমিত সাক্ষরতার মায়েদের জন্য তৈরি।',
      ),
    },
    {
      icon: <LineChart strokeWidth={2} />,
      title: t(
        'Longitudinal Analysis via XGBoost',
        'XGBoost-এ দীর্ঘমেয়াদী বিশ্লেষণ',
      ),
      body: t(
        'An XGBoost model watches BP, weight, and vitals across the full pregnancy — detecting rising-risk patterns and generating clinical recommendations over time.',
        'XGBoost মডেল পুরো গর্ভকাল জুড়ে রক্তচাপ, ওজন ও ভাইটাল বিশ্লেষণ করে — ঊর্ধ্বমুখী ঝুঁকি ধরে ক্লিনিক্যাল পরামর্শ তৈরি করে।',
      ),
    },
  ];

  // Maternal risk conditions the model screens for (decision-support, not diagnosis).
  const conditions = [
    {
      icon: <Gauge strokeWidth={2} />,
      title: t('Preeclampsia', 'প্রি-একলাম্পসিয়া'),
      sub: 'HYPERTENSIVE DISORDER',
      body: t(
        'Rising blood pressure with protein signs, flagged early.',
        'রক্তচাপ বৃদ্ধি ও প্রোটিন লক্ষণ আগেভাগে চিহ্নিত।',
      ),
      tag: t('BP + protein', 'বিপি + প্রোটিন'),
    },
    {
      icon: <Droplet strokeWidth={2} />,
      title: t('Anemia', 'রক্তস্বল্পতা'),
      sub: 'IRON DEFICIENCY',
      body: t(
        'Low-hemoglobin patterns surfaced from vitals and intake.',
        'ভাইটাল ও খাদ্য থেকে নিম্ন-হিমোগ্লোবিন ধরন শনাক্ত।',
      ),
      tag: t('Hemoglobin', 'হিমোগ্লোবিন'),
    },
    {
      icon: <Syringe strokeWidth={2} />,
      title: t('Gestational diabetes', 'গর্ভকালীন ডায়াবেটিস'),
      sub: 'GLYCEMIC RISK',
      body: t(
        'Glucose-related risk tracked alongside weight trends.',
        'ওজন প্রবণতার সাথে গ্লুকোজ-সম্পর্কিত ঝুঁকি পর্যবেক্ষণ।',
      ),
      tag: t('Glucose', 'গ্লুকোজ'),
    },
    {
      icon: <HeartPulse strokeWidth={2} />,
      title: t('Postpartum hemorrhage', 'প্রসব-পরবর্তী রক্তক্ষরণ'),
      sub: 'BLEEDING RISK',
      body: t(
        'Post-delivery warning signs raised for fast referral.',
        'দ্রুত রেফারেলের জন্য প্রসব-পরবর্তী সতর্ক লক্ষণ।',
      ),
      tag: t('Post-delivery', 'প্রসব-পরবর্তী'),
    },
    {
      icon: <Clock strokeWidth={2} />,
      title: t('Preterm labor', 'অকাল প্রসব'),
      sub: 'EARLY ONSET',
      body: t(
        'Early-onset indicators before 37 weeks, watched closely.',
        '৩৭ সপ্তাহের আগে অকাল লক্ষণ নিবিড়ভাবে পর্যবেক্ষণ।',
      ),
      tag: t('< 37 weeks', '< ৩৭ সপ্তাহ'),
    },
    {
      icon: <Zap strokeWidth={2} />,
      title: t('Eclampsia', 'একলাম্পসিয়া'),
      sub: 'SEIZURE RISK',
      body: t(
        'Escalation from severe hypertension flagged as urgent.',
        'তীব্র উচ্চ রক্তচাপ থেকে জরুরি অবস্থা হিসেবে চিহ্নিত।',
      ),
      tag: t('Emergency', 'জরুরি'),
    },
    {
      icon: <Baby strokeWidth={2} />,
      title: t('Fetal growth restriction', 'ভ্রূণ বৃদ্ধি সীমাবদ্ধতা'),
      sub: 'IUGR',
      body: t(
        'Growth-trend signals prompt earlier clinical review.',
        'বৃদ্ধি-প্রবণতা সংকেত আগাম ক্লিনিকাল পর্যালোচনায় সহায়তা করে।',
      ),
      tag: t('Growth', 'বৃদ্ধি'),
    },
    {
      icon: <Brain strokeWidth={2} />,
      title: t('Postpartum depression', 'প্রসব-পরবর্তী বিষণ্নতা'),
      sub: 'MATERNAL MENTAL HEALTH',
      body: t(
        'Wellbeing check-ins surface mothers who need support.',
        'সুস্থতা যাচাই সহায়তা প্রয়োজন এমন মায়েদের চিহ্নিত করে।',
      ),
      tag: t('Wellbeing', 'সুস্থতা'),
    },
  ];

  // Authorities whose maternal-health guidance the product is built on.
  const standards = [
    {
      acr: 'WHO',
      name: t('World Health Organization', 'বিশ্ব স্বাস্থ্য সংস্থা'),
      scope: t('Global', 'আন্তর্জাতিক'),
      tint: 'rose',
    },
    {
      acr: 'UNICEF',
      name: t('Maternal & Newborn Health', 'মাতৃ ও নবজাতক স্বাস্থ্য'),
      scope: t('Global', 'আন্তর্জাতিক'),
      tint: 'plum',
    },
    {
      acr: 'DGHS',
      name: t('Directorate General of Health Services', 'স্বাস্থ্য অধিদপ্তর'),
      scope: t('Bangladesh', 'বাংলাদেশ'),
      tint: 'teal',
    },
    {
      acr: 'FIGO',
      name: t(
        'Intl. Federation of Gynecology & Obstetrics',
        'আন্তর্জাতিক স্ত্রীরোগ ও প্রসূতি ফেডারেশন',
      ),
      scope: t('Global', 'আন্তর্জাতিক'),
      tint: 'amber',
    },
    {
      acr: 'ACOG',
      name: t(
        'American College of Obstetricians',
        'আমেরিকান কলেজ অব অবস্টেট্রিশিয়ানস',
      ),
      scope: t('Clinical', 'ক্লিনিকাল'),
      tint: 'blue',
    },
  ];

  const pricingPlans = [
    {
      name: t('COMMUNITY CLINIC', 'কমিউনিটি ক্লিনিক'),
      price: '0',
      yearlyPrice: '0',
      period: t('free forever', 'চিরতরে ফ্রি'),
      features: [
        t('On-device AI Triage scoring', 'ডিভাইসেই এআই ঝুঁকি পরিমাপ'),
        t('Secure cloud data storage & backup', 'নিরাপদ ক্লাউড ডেটা সংরক্ষণ ও ব্যাকআপ'),
        t('Emergency SOS locator', 'জরুরি এসওএস লোকেটার'),
        t('Up to 10 active patient profiles', 'সর্বোচ্চ ১০ জন সক্রিয় রোগী'),
        t(
          'Basic analytics and history tracking',
          'সাধারণ পরিসংখ্যান ও ইতিহাস ট্র্যাকিং',
        ),
        t('Standard community support', 'সাধারণ কমিউনিটি সহায়তা'),
      ],
      description: t(
        'Perfect for individual midwives and rural community clinics.',
        'ব্যক্তিগত ধাত্রী এবং গ্রামীণ কমিউনিটি ক্লিনিকের জন্য উপযোগী।',
      ),
      buttonText: t('Start Free Trial', 'ফ্রি ট্রায়াল শুরু করুন'),
      href: '/role',
      isPopular: false,
    },
    {
      name: t('DISTRICT HEALTH', 'উপজেলা / জেলা স্বাস্থ্য'),
      price: '499',
      yearlyPrice: '399',
      period: t('per month', 'প্রতি মাস'),
      features: [
        t('Everything in Community Clinic', 'কমিউনিটি ক্লিনিকের সব সুবিধা'),
        t('Unlimited patient profiles', 'অসংখ্য রোগীর প্রোফাইল'),
        t('Advanced risk anomaly tracking', 'উন্নত অস্বাভাবিকতা ট্র্যাকিং'),
        t(
          'SMS alerts for high-risk flags',
          'উচ্চ ঝুঁকির জন্য এসএমএস অ্যালার্ট',
        ),
        t(
          'Regional health statistics dashboard',
          'আঞ্চলিক স্বাস্থ্য পরিসংখ্যান ড্যাশবোর্ড',
        ),
        t('24/7 priority support response', '২৪/৭ অগ্রাধিকার সহায়তা'),
        t(
          'Custom integration with national systems (DGHS)',
          'জাতীয় ব্যবস্থার (DGHS) সাথে কাস্টম সিঙ্ক',
        ),
      ],
      description: t(
        'Ideal for growing sub-district health offices and local systems.',
        'ক্রমবর্ধমান উপজেলা স্বাস্থ্য অফিস এবং স্থানীয় সিস্টেমের জন্য আদর্শ।',
      ),
      buttonText: t('Get Started', 'শুরু করুন'),
      href: '/role',
      isPopular: true,
    },
    {
      name: t('NATIONAL DEPLOYMENT', 'জাতীয় কার্যক্রম'),
      price: '1999',
      yearlyPrice: '1499',
      period: t('per month', 'প্রতি মাস'),
      features: [
        t('Everything in District Health', 'জেলা স্বাস্থ্যের সব সুবিধা'),
        t(
          'Dedicated regional account managers',
          'ডেডিকেটেড আঞ্চলিক অ্যাকাউন্ট ম্যানেজার',
        ),
        t('Custom local AI model fine-tuning', 'স্থানীয় এআই মডেল ফাইন-টিউনিং'),
        t(
          'State-level secure data warehousing',
          'রাষ্ট্রীয় স্তরের নিরাপদ ডেটা সংরক্ষণ',
        ),
        t('1-hour SLA support response', '১ ঘণ্টার মধ্যে সেবা সহায়তা'),
        t(
          'Advanced security with HIPAA awareness',
          'উন্নত নিরাপত্তা ও এইচআইপিএএ-সচেতনতা',
        ),
        t('Custom contract & SLA agreement', 'কাস্টম চুক্তি ও এসএলএ চুক্তি'),
      ],
      description: t(
        'For large organizations and national maternal-health programs.',
        'বৃহৎ সংস্থা এবং জাতীয় মাতৃস্বাস্থ্য কর্মসূচির জন্য।',
      ),
      buttonText: t('Contact Sales', 'যোগাযোগ করুন'),
      href: '/role',
      isPopular: false,
    },
  ];

  return (
    <main className="landing-wrapper">
      <WelcomeIntro locale={locale} />

      {/* Background ambient accents */}
      <div className="landing-background-glows">
        <div className="mesh-gradient" />
        <div className="glow-circle glow-circle-1" />
        <div className="glow-circle glow-circle-2" />
      </div>
      <div className="grain-overlay" aria-hidden="true" />

      {/* Sticky Top Header Bar */}
      <div
        className={`landing-header-sticky-wrapper${scrolled ? ' is-scrolled' : ''}`}
      >
        <header className="landing-header-container">
          <Link
            to="/"
            className="landing-header-logo"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ textDecoration: 'none' }}
          >
            <span className="landing-brand-mark">
              <HeartPulse className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <span className="landing-header-logo-text">PulseGuard</span>
          </Link>

          <nav className="landing-nav-pill">
            <a href="#features">{t('Features', 'ফিচার')}</a>
            <a href="#how">{t('How it works', 'যেভাবে কাজ করে')}</a>
            <a href="#pricing">{t('Pricing', 'মূল্য')}</a>
            <a href="#trust">{t('Trust', 'বিশ্বাস')}</a>
            <Link to="/about">{t('About', 'আমাদের সম্পর্কে')}</Link>
            <Link to="/guidelines">{t('Guidelines', 'নির্দেশিকা')}</Link>
          </nav>

          <div className="landing-header-actions">
            <button
              type="button"
              onClick={() => setLocale((prev) => (prev === 'en' ? 'bn' : 'en'))}
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
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            <Link to="/role" className="landing-header-signin-btn">
              {t('Sign In', 'সাইন ইন')}
            </Link>
          </div>
        </header>
      </div>

      {/* Hero — two column */}
      <section className="landing-hero-split">
        <div className="landing-hero-dotgrid" aria-hidden="true" />
        <div className="landing-hero-split-inner">
          {/* Left — greeting */}
          <div className="landing-hero-left">
            <motion.div
              className="landing-hero-badge"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Sparkles
                className="h-3.5 w-3.5"
                style={{ color: 'var(--color-primary)' }}
              />
              <span>
                {t(
                  "Bangladesh's First AI Native Maternity Healthcare App",
                  'বাংলাদেশের প্রথম এআই-নেটিভ মাতৃস্বাস্থ্য অ্যাপ',
                )}
              </span>
            </motion.div>

            <motion.h1
              className="landing-hero-title"
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {locale === 'en' ? (
                <>
                  AI-native care for
                  <br />
                  <span className="italic text-gradient-primary">
                    every mother
                  </span>
                  ,
                  <br />
                  everywhere.
                </>
              ) : (
                <>
                  প্রতিটি মায়ের জন্য
                  <br />
                  <span className="italic text-gradient-primary">
                    এআই-নেটিভ সেবা
                  </span>
                  ,
                  <br />
                  সর্বত্র।
                </>
              )}
            </motion.h1>

            <motion.p
              className="landing-hero-sub"
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              {$('SPLASH_SUBLINE', locale)}
            </motion.p>

            <motion.div
              className="landing-hero-cta"
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <Link
                to="/role"
                className="btn btn--primary btn--landing-primary"
              >
                <span>{$('SPLASH_CTA', locale).replace(' →', '')}</span>
                <ArrowRight className="h-4 w-4" style={{ marginLeft: '6px' }} />
              </Link>
              <button type="button" className="btn btn--demo" onClick={() => navigate('/watch-demo')}>
                {t('Watch demo', 'ডেমো দেখুন')}
              </button>
            </motion.div>
          </div>

          {/* Right — vitals monitor */}
          <div className="landing-hero-right">
            <VitalsMonitor locale={locale} />
          </div>
        </div>
      </section>


      {/* Capabilities — 6-card grid */}
      <section className="landing-features-section" id="features">
        <Reveal className="landing-sec-head">
          <span className="landing-eyebrow">
            {t('Everything in one app', 'একটি অ্যাপেই সবকিছু')}
          </span>
          <h2 className="landing-sec-title">
            {locale === 'en' ? (
              <>
                One toolkit for{' '}
                <span className="italic text-gradient-primary">
                  every visit
                </span>
              </>
            ) : (
              <>
                প্রতিটি ভিজিটের জন্য{' '}
                <span className="italic text-gradient-primary">
                  একটি টুলকিট
                </span>
              </>
            )}
          </h2>
          <p className="landing-sec-sub">
            {t(
              'From the first checkup to emergency response — built to run on a low-end phone, with or without a signal.',
              'প্রথম চেকআপ থেকে জরুরি সাড়া — সংকেত থাকুক বা না থাকুক, সাধারণ ফোনেই চলার জন্য তৈরি।',
            )}
          </p>
        </Reveal>

        <div className="landing-cap-grid">
          {capabilities.map((c, i) => (
            <Reveal
              key={c.title}
              className="landing-cap-card landing-feature-hoverable"
              delay={(i % 3) * 0.08}
            >
              <div className="landing-feature-hoverbar" aria-hidden="true" />
              <span className="landing-cap-index">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="landing-cap-ic">{c.icon}</span>
              <h3 className="landing-cap-title">{c.title}</h3>
              <p className="landing-cap-body">{c.body}</p>
            </Reveal>
          ))}
        </div>

        {/* Medical disclaimer band */}
        <Reveal className="landing-disclaimer">
          <span className="landing-disclaimer-ic">
            <ShieldAlert strokeWidth={2} />
          </span>
          <div>
            <h3>{$('SPLASH_DISCLAIMER_TITLE', locale)}</h3>
            <p>{$('SPLASH_DISCLAIMER_BODY', locale)}</p>
          </div>
        </Reveal>
      </section>

      {/* Cross-platform showcase */}
      <section className="landing-showcase" id="showcase">
        <Reveal className="landing-sec-head">
          <span className="landing-eyebrow">
            {t('One app, every screen', 'এক অ্যাপ, সব স্ক্রিন')}
          </span>
          <h2 className="landing-sec-title">
            {locale === 'en' ? (
              <>
                Looks right on{' '}
                <span className="italic text-gradient-primary">
                  every screen
                </span>
              </>
            ) : (
              <>
                প্রতিটি স্ক্রিনে{' '}
                <span className="italic text-gradient-primary">নিখুঁত</span>
              </>
            )}
          </h2>
          <p className="landing-sec-sub">
            {t(
              'The same PulseGuard — tuned for a health worker’s phone in the field and the clinic desktop. Consistent AI, every screen.',
              'একই PulseGuard — মাঠের স্বাস্থ্যকর্মীর ফোন আর ক্লিনিকের ডেস্কটপের জন্য। প্রতিটি স্ক্রিনে সমান এআই।',
            )}
          </p>
        </Reveal>

        <Reveal className="landing-showcase-stage" delay={0.1}>
          <div className="landing-showcase-browser">
            <SafariMock
              src={showcaseDesktop}
              alt={t(
                'PulseGuard on a desktop browser',
                'ডেস্কটপ ব্রাউজারে PulseGuard',
              )}
            />
          </div>
          <div className="landing-showcase-phone">
            <IPhoneMock
              src={showcaseMobile}
              alt={t('PulseGuard on a phone', 'ফোনে PulseGuard')}
            />
          </div>
        </Reveal>
      </section>

      {/* Conditions screened */}
      <section className="landing-conditions" id="conditions">
        <Reveal className="landing-sec-head">
          <span className="landing-eyebrow">
            {t('Condition-aware screening', 'রোগ-সচেতন স্ক্রিনিং')}
          </span>
          <h2 className="landing-sec-title">
            {locale === 'en' ? (
              <>
                Risk signals across{' '}
                <span className="italic text-gradient-primary">
                  maternal conditions
                </span>
              </>
            ) : (
              <>
                <span className="italic text-gradient-primary">
                  মাতৃস্বাস্থ্য জটিলতা
                </span>{' '}
                জুড়ে ঝুঁকি সংকেত
              </>
            )}
          </h2>
          <p className="landing-sec-sub">
            {t(
              'The model watches for the complications that matter most in pregnancy — surfacing them early as decision support, never as a diagnosis.',
              'মডেলটি গর্ভকালের সবচেয়ে গুরুত্বপূর্ণ জটিলতাগুলোর দিকে নজর রাখে — রোগনির্ণয় নয়, সিদ্ধান্ত-সহায়তা হিসেবে আগেভাগে চিহ্নিত করে।',
            )}
          </p>
        </Reveal>

        <div className="landing-cond-grid">
          {conditions.map((c, i) => (
            <Reveal
              key={c.sub}
              className="landing-cond-card landing-feature-hoverable"
              delay={(i % 4) * 0.06}
            >
              <div className="landing-feature-hoverbar" aria-hidden="true" />
              <span className="landing-cond-ic">{c.icon}</span>
              <h3 className="landing-cond-title">{c.title}</h3>
              <span className="landing-cond-sub">{c.sub}</span>
              <p className="landing-cond-body">{c.body}</p>
              <span className="landing-cond-tag">{c.tag}</span>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Pricing section */}
      <section id="pricing" className="landing-pricing-section">
        <Pricing
          plans={pricingPlans}
          title={t('Simple, Transparent Pricing', 'সহজ, স্বচ্ছ মূল্য')}
          description={t(
            'Choose the plan that works for you.\nAll plans include access to our platform, logging tools, and dedicated support.',
            'আপনার প্রয়োজন অনুযায়ী সঠিক প্ল্যানটি বেছে নিন।\nসব প্ল্যানেই আমাদের প্ল্যাটফর্ম, ট্র্যাকিং টুলস এবং ডেডিকেটেড সাপোর্টের সুবিধা রয়েছে।',
          )}
        />
      </section>

      {/* Trusted guidance */}
      <section className="landing-standards">
        <div className="landing-standards-inner">
          <Reveal className="landing-standards-intro">
            <span className="landing-eyebrow">
              <ShieldCheck strokeWidth={2} style={{ width: 14, height: 14 }} />{' '}
              {t('Guideline-backed', 'নির্দেশিকা-সমর্থিত')}
            </span>
            <h2 className="landing-sec-title">
              {t(
                'Built on trusted guidance',
                'নির্ভরযোগ্য নির্দেশনার উপর তৈরি',
              )}
            </h2>
            <p className="landing-sec-sub">
              {t(
                'Every risk threshold and recommendation traces back to recognized maternal-health authorities.',
                'প্রতিটি ঝুঁকি সীমা ও পরামর্শ স্বীকৃত মাতৃস্বাস্থ্য কর্তৃপক্ষের নির্দেশনা থেকে এসেছে।',
              )}
            </p>
          </Reveal>
          <div className="landing-standards-grid">
            {standards.map((s, i) => (
              <Reveal
                key={s.acr}
                className={`landing-std-card landing-std-card--${s.tint}`}
                delay={i * 0.06}
              >
                <strong className="landing-std-acr">{s.acr}</strong>
                <span className="landing-std-name">{s.name}</span>
                <span className="landing-std-scope">{s.scope}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Health-worker quote */}
      <section className="landing-quote">
        <Reveal className="landing-quote-inner">
          <span className="landing-quote-mark" aria-hidden="true">
            <Quote strokeWidth={1.5} />
          </span>
          <blockquote className="landing-quote-text">
            {t(
              'I used to guess which mothers needed the clinic. Now the phone tells me who to see first — even in the villages with no signal.',
              'কোন মায়েদের ক্লিনিকে পাঠাতে হবে তা আগে অনুমান করতাম। এখন ফোনই বলে দেয় কাকে আগে দেখতে হবে — সংকেতহীন গ্রামেও।',
            )}
          </blockquote>
          <div className="landing-quote-by">
            <span className="landing-quote-avatar">RA</span>
            <span>
              <strong>{t('Rabeya Akter', 'রাবেয়া আক্তার')}</strong>
              <em>
                {t(
                  'Community Health Worker · Kurigram',
                  'কমিউনিটি স্বাস্থ্যকর্মী · কুড়িগ্রাম',
                )}
              </em>
            </span>
          </div>
        </Reveal>
      </section>

      {/* How it works */}
      <section className="landing-how" id="how">
        <Reveal className="landing-how-head">
          <span className="landing-how-eyebrow">
            {t('How it works', 'যেভাবে কাজ করে')}
          </span>
          <h2>
            {t(
              'Three steps from visit to verdict',
              'ভিজিট থেকে সিদ্ধান্ত — তিন ধাপে',
            )}
          </h2>
        </Reveal>

        <div className="landing-how-grid">
          <div className="landing-how-line" aria-hidden="true" />
          {steps.map((s, i) => (
            <Reveal key={s.title} className="landing-how-step" delay={i * 0.12}>
              <span className="landing-how-num">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="landing-how-ic">{s.icon}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* What's Upcoming? */}
      <section className="landing-upcoming">
        <div className="landing-upcoming-inner">
          <Reveal className="landing-upcoming-head">
            <span className="landing-upcoming-eyebrow">
              {t('Coming Soon', 'শীঘ্রই আসছে')}
            </span>
            <h2>{t("What's Upcoming?", 'কী আসছে?')}</h2>
            <p>
              {t(
                "Get a glimpse of the features we're building next for PulseGuard.",
                'পালসগার্ডে আমরা পরবর্তীতে কী তৈরি করছি তা দেখুন।',
              )}
            </p>
          </Reveal>

          <div className="landing-upcoming-grid">
            <Reveal className="landing-upcoming-card" delay={0.05}>
              <a href="/b1.html" target="_blank" rel="noopener noreferrer" className="landing-upcoming-card-link">
                <div className="landing-upcoming-card-icon">
                  <Activity size={26} />
                </div>
                <div className="landing-upcoming-card-body">
                  <span className="landing-upcoming-tag">{t('Dashboard', 'ড্যাশবোর্ড')}</span>
                  <h3>{t('Prenatal & Postnatal Dashboard', 'প্রসব-পূর্ব ও প্রসব-পরবর্তী ড্যাশবোর্ড')}</h3>
                  <p>
                    {t(
                      'A unified health command center — vitals, nutrition, scans, and AI alerts for every stage of your journey.',
                      'একটি ইউনিফাইড হেলথ কমান্ড সেন্টার — প্রতিটি পর্যায়ে ভাইটাল, পুষ্টি, স্ক্যান ও এআই সতর্কতা।',
                    )}
                  </p>
                </div>
                <span className="landing-upcoming-arrow">
                  <ArrowRight size={18} />
                </span>
              </a>
            </Reveal>

            <Reveal className="landing-upcoming-card" delay={0.12}>
              <a href="/b2.html" target="_blank" rel="noopener noreferrer" className="landing-upcoming-card-link">
                <div className="landing-upcoming-card-icon">
                  <Stethoscope size={26} />
                </div>
                <div className="landing-upcoming-card-body">
                  <span className="landing-upcoming-tag">{t('Consultation', 'পরামর্শ')}</span>
                  <h3>{t('Find & Book a Specialist', 'বিশেষজ্ঞ খুঁজুন ও বুক করুন')}</h3>
                  <p>
                    {t(
                      "Browse verified OB-GYN doctors by country, hospital, and availability. View fees, degrees, and schedule your appointment.",
                      'দেশ, হাসপাতাল ও উপলব্ধতা অনুযায়ী যাচাইকৃত ডাক্তার খুঁজুন। ফি, ডিগ্রি দেখুন এবং অ্যাপয়েন্টমেন্ট নির্ধারণ করুন।',
                    )}
                  </p>
                </div>
                <span className="landing-upcoming-arrow">
                  <ArrowRight size={18} />
                </span>
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="landing-final">
        <span className="landing-final-watermark" aria-hidden="true">
          PulseGuard
        </span>
        <Reveal className="landing-final-inner">
          <h2 className="landing-final-title">
            {locale === 'en' ? (
              <>
                Care that reaches the{' '}
                <span className="italic text-gradient-primary">last mile</span>.
              </>
            ) : (
              <>
                সেবা পৌঁছে যাক{' '}
                <span className="italic text-gradient-primary">
                  প্রান্তিক প্রান্তে
                </span>
                ।
              </>
            )}
          </h2>
          <p className="landing-final-sub">
            {t(
              'Start protecting more mothers today — with AI that knows their full health history.',
              'আজই আরও বেশি মায়ের সুরক্ষা শুরু করুন — এআই যা তাদের পূর্ণ স্বাস্থ্য ইতিহাস জানে।',
            )}
          </p>
          <Link to="/role" className="btn btn--primary btn--landing-primary">
            <span>{$('SPLASH_CTA', locale).replace(' →', '')}</span>
            <ArrowRight className="h-4 w-4" style={{ marginLeft: '6px' }} />
          </Link>
        </Reveal>
      </section>

      {/* Trust bar */}
      <section id="trust" className="landing-trust-bar">
        <div className="landing-trust-bar-container">
          <p className="landing-trust-text">
            {t(
              'HIPAA-aware · End-to-end encrypted · Open-source core',
              'এইচআইপিএএ-সচেতন · এন্ড-টু-এন্ড এনক্রিপ্টেড · ওপেন-সোর্স কোর',
            )}
          </p>
          <p className="landing-trust-text" suppressHydrationWarning>
            &copy; {new Date().getFullYear()} PulseGuard AI.{' '}
            {t('All rights reserved.', 'সর্বস্বত্ব সংরক্ষিত।')}
          </p>
        </div>
      </section>

      {/* Footer */}
      <section className="landing-footer-shell">
        <div className="landing-footer-shell-inner">
          <footer className="landing-footer-premium">
            <div className="landing-footer-logo">
              <div className="landing-footer-logo-circle">
                <div className="landing-footer-logo-inner-circle" />
              </div>
              <span className="landing-footer-logo-text">PulseGuard</span>
            </div>

            <div className="landing-footer-links">
              <a href="#privacy">{t('Privacy', 'গোপনীয়তা')}</a>
              <a href="#how">
                {t('Clinical Guidelines', 'ক্লিনিকাল নির্দেশিকা')}
              </a>
              <a href="#trust">{t('Support', 'সহায়তা')}</a>
            </div>

            <p className="landing-footer-copyright">
              {t('AI-native healthcare.', 'এআই-নেটিভ স্বাস্থ্যসেবা।')}
            </p>
          </footer>
        </div>
      </section>
    </main>
  );
}
