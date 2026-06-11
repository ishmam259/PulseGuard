import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { useApp } from '../context/AppContext'
import AboutSmoothHero from '../components/about/AboutSmoothHero'
import AboutMission from '../components/about/AboutMission'
import AboutScrollStory from '../components/about/AboutScrollStory'
import AboutImpact from '../components/about/AboutImpact'

function AboutNav() {
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
        {/* PulseGuard heart-pulse icon */}
        <svg viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <rect width="28" height="28" rx="8" fill="oklch(0.62 0.22 0)" />
          <path d="M4 14h4l2.5-5 3 10 2.5-7L18 14h6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        PulseGuard
      </Link>

      <div className="about-nav-actions">
        <button
          className="about-nav-icon-btn"
          onClick={() => setLocale(locale === 'en' ? 'bn' : 'en')}
          aria-label="Toggle language"
        >
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.02em' }}>
            {locale === 'en' ? 'বাং' : 'EN'}
          </span>
        </button>
        <button
          className="about-nav-icon-btn"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        <Link to="/role" className="about-nav-btn about-nav-btn--primary">
          {locale === 'en' ? 'Get started' : 'শুরু করুন'}
        </Link>
      </div>
    </header>
  )
}

export default function About() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <AboutNav />
      <main>
        <AboutSmoothHero />
        <AboutMission />
        <AboutScrollStory />
        <AboutImpact />
      </main>
      <footer className="about-footer">
        <Link to="/" className="about-footer-brand">PulseGuard &copy; 2025</Link>
        <nav className="about-footer-links">
          <Link to="/">Home</Link>
          <a href="#mission">Mission</a>
          <Link to="/guidelines">Guidelines</Link>
          <Link to="/role">Get started</Link>
        </nav>
      </footer>
    </div>
  )
}
